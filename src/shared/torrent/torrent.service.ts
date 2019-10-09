import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as pMap from 'p-map'
import * as WebTorrent from 'webtorrent-hybrid'
import { Torrent, Instance as WebTorrentInstance } from 'webtorrent'
import { Episode, Movie, Download } from '@pct-org/mongo-models'
import * as rimraf from 'rimraf'

import { ConfigService } from '../config/config.service'
import { formatKbToString } from '../utils'
import { TorrentInterface } from './torrent.interface'

@Injectable()
export class TorrentService {

  public static STATUS_QUEUED = 'queued'
  public static STATUS_DOWNLOADING = 'downloading'
  public static STATUS_CONNECTING = 'connecting'
  public static STATUS_COMPLETE = 'complete'
  public static STATUS_FAILED = 'failed'
  public static STATUS_REMOVED = 'removed'

  public static TYPE_DOWNLOAD = 'download'
  public static TYPE_STREAM = 'stream'

  private readonly logger = new Logger(TorrentService.name)

  /**
   * Maximum of concurrent downloads in the background
   */
  private maxConcurrent: number = 1

  /**
   * Array of downloads that will be downloaded in the background
   */
  private downloads: Download[] = []

  /**
   * Are we currently downloading in the background
   */
  private backgroundDownloading: Boolean = false

  /**
   * Items currently downloading
   */
  public torrents: TorrentInterface[] = []

  /**
   * WebTorrent engine
   */
  private webTorrent: WebTorrentInstance = null

  /**
   * All the different supported formats
   */
  public supportedFormats: string[] = ['mp4', 'ogg', 'mov', 'webmv', 'mkv', 'wmv', 'avi']

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>,
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>,
    @InjectModel('Downloads') private readonly downloadModel: Model<Download>,
    private readonly configService: ConfigService
  ) {
    this.webTorrent = new WebTorrent({ maxConns: 20 })
    this.webTorrent.on('error', (error) => {
      this.logger.error(`[webTorrent]: ${JSON.stringify(error)}`)

      // Create a new one so others can continue
      this.webTorrent = new WebTorrent({ maxConns: 20 })
      this.checkForIncompleteDownloads()
    })

    // Check for incomplete downloads and add them to the downloads
    this.checkForIncompleteDownloads()
  }

  /**
   * Starts the streaming process of one item
   *
   * @param download
   */
  public startStreaming(download: Model<Download>) {
    this.logger.log(`[${download._id}]: Start streaming`)

    this.download(download)
  }

  /**
   * Starts the streaming process of one item
   *
   * @param download
   */
  public stopDownloading(download: Download): Promise<any> {
    return new Promise((resolve) => {
      // Get the stream
      const downloadingTorrent = this.torrents.find(torrent => torrent._id === download._id)

      if (!downloadingTorrent) {
        return resolve()
      }

      this.logger.log(`[${download._id}]: Stop downloading`)

      // Destroy the torrent
      downloadingTorrent.torrent.destroy((err) => {
        downloadingTorrent.resolve()

        if (err) {
          this.logger.error(`[${download._id}]: Error stopping download`, err.toString())
        }

        this.logger.log(`[${download._id}]: Stopped download`)

        this.removeFromTorrents(download)

        resolve()
      })
    })
  }

  /**
   * Adds a download to the queued items
   */
  public addDownload(download: Download) {
    this.downloads.push(download)

    this.logger.log(`[${download._id}]: Added to queue (${this.downloads.length})`)
  }

  /**
   * Starts background downloads
   */
  public async startDownloads() {
    if (this.backgroundDownloading || this.downloads.length === 0) {
      return
    }

    this.logger.log(`Start queued downloads`)

    // Enable that we are downloading
    this.backgroundDownloading = true

    await pMap(
      this.downloads,
      download => this.download(download),
      {
        concurrency: this.maxConcurrent
      }
    )

    // We are no longer downloading to disable
    this.backgroundDownloading = false
  }

  /**
   * Set's the downloads that still needs to be done or completed
   */
  private async checkForIncompleteDownloads() {
    this.downloads = await this.downloadModel.find({
      status: {
        $in: [
          TorrentService.STATUS_QUEUED,
          TorrentService.STATUS_CONNECTING,
          TorrentService.STATUS_DOWNLOADING
        ]
      }
    })

    // TODO:: Do something with streams?

    this.logger.log(`Found ${this.downloads.length} downloads`)

    // this.startDownloads()
  }

  /**
   * Downloads one item
   *
   * @param {Download} download - Item to download
   */
  private async download(download: Download) {
    return new Promise((async (resolve) => {
      this.logger.log(`[${download._id}]: Start download`)

      const item = await this.getItemForDownload(download)

      const { torrents } = item

      // Find the correct magnet
      const magnet = torrents.find(torrent => torrent.quality === download.quality)

      // Check if we have a magnet to be sure
      if (!magnet) {
        // TODO:: Search for it

        // No magnet found, update status to failed
        await this.updateOne(download, {
          status: TorrentService.STATUS_FAILED
        })

        await this.updateOne(item, {
          download: {
            downloadStatus: TorrentService.STATUS_FAILED,
            downloading: false
          }
        })

        // Resolve instead of reject as no try catch is around the method
        return resolve()
      } else {
        // TODO:: Check health otherwise search for a better one
      }

      // Update item that we are connecting
      await this.updateOne(item, {
        download: {
          downloadStatus: TorrentService.STATUS_CONNECTING,
          downloading: true
        }
      })

      // Update the status to connecting
      await this.updateOne(download, {
        status: TorrentService.STATUS_CONNECTING,
        timeRemaining: null,
        speed: null,
        numPeers: null
      })

      this.webTorrent.add(
        magnet.url,
        {
          // Add a unique download location for this item
          path: this.getDownloadLocation(download)
        },
        this.handleTorrent(resolve, item, download, magnet)
      )
    }))
  }

  /**
   * Handles the torrent and resolves when the torrent is done
   *
   * @param resolve
   * @param item
   * @param download
   * @param magnet
   */
  private handleTorrent(resolve, item, download, magnet) {
    return (torrent: Torrent) => {
      // Let's make sure all the not needed files are deselected
      const { file, torrentIndex } = torrent.files.reduce((previous, current, index) => {
        const formatIsSupported = !!this.supportedFormats.find(format => current.name.includes(format))

        if (formatIsSupported) {
          if (current.length > previous.file.length) {
            previous.file.deselect()

            return {
              file: current,
              torrentIndex: index
            }
          }
        }

        // Deselect this file
        current.deselect()

        return previous

      }, { file: torrent.files[0], torrentIndex: 0 })

      // Select this file to be the main
      file.select()

      this.torrents.push({
        _id: download._id,
        torrent,
        file,
        resolve
      })

      let lastUpdate = {
        progress: null,
        numPeers: null
      }

      let updatedItem = false

      torrent.on('noPeers', (a) => {
        console.log('No Peers', a)
      })

      torrent.on('download', async () => {
        const newProgress = torrent.progress * 100

        // Only update every 0.2 %
        if (lastUpdate.progress === null
          || (lastUpdate.progress + 0.2) < newProgress
          || lastUpdate.numPeers !== torrent.numPeers
        ) {
          this.logger.debug(`[${download._id}]: Progress ${newProgress.toFixed(1)}% at ${formatKbToString(torrent.downloadSpeed)}`)

          lastUpdate = {
            progress: newProgress,
            numPeers: torrent.numPeers
          }

          // Update the item
          await this.updateOne(download, {
            progress: newProgress.toFixed(1),
            status: TorrentService.STATUS_DOWNLOADING,
            timeRemaining: torrent.timeRemaining,
            speed: torrent.downloadSpeed,
            numPeers: torrent.numPeers
          })

          if (!updatedItem) {
            updatedItem = true

            // Update item that we are downloading
            await this.updateOne(item, {
              download: {
                downloadStatus: TorrentService.STATUS_DOWNLOADING,
                downloading: true
              }
            })
          }
        }
      })

      torrent.on('done', async () => {
        this.logger.log(`[${download._id}]: Download complete`)

        // Remove from torrents
        this.removeFromTorrents(download)

        await this.updateOne(download, {
          progress: 100,
          status: TorrentService.STATUS_COMPLETE,
          timeRemaining: null,
          speed: null,
          numPeers: null
        })

        await this.updateOne(item, {
          download: {
            downloadStatus: TorrentService.STATUS_COMPLETE,
            downloading: false,
            downloadComplete: true,
            downloadedOn: Number(new Date())
          }
        })

        // Remove the magnet from the client
        this.webTorrent.remove(
          magnet.url
        )

        resolve()
      })
    }
  }

  /**
   * Updates download item in the databse
   *
   * @param item
   * @param update
   */
  public async updateOne(item: Model<Download | Movie | Episode>, update): Promise<Download | Movie | Episode> {
    // Apply the update
    if (Object.keys(update).length === 1 && update.hasOwnProperty('download')) {
      if (!item.hasOwnProperty('download')) {
        item.download = {}
      }

      this.logger.debug(`[${item._id}]: Update download info to "${JSON.stringify(update.download)}"`)

      Object.keys(update.download).forEach((key) => item.download[key] = update.download[key])

    } else {
      Object.keys(update).forEach((key) => item[key] = update[key])
    }

    item.updatedAt = Number(new Date())

    try {
      // Save the update
      return item.save()

    } catch (e) {
      this.logger.error(`[${item._id}]: ${e.message || e}`)

      return item
    }
  }

  /**
   * Removes a download from torrents
   */
  private removeFromTorrents(download: Model<Download>) {
    this.torrents = this.torrents.filter(tor => tor._id !== download._id)
  }

  /**
   * Cleans up a download
   */
  public cleanUpDownload(download: Model<Download>) {
    // Delete the download
    download.delete()

    // Remove the download folder
    rimraf(this.getDownloadLocation(download), (error) => {
      if (error) {
        this.logger.error(`[${download._id}]: Error cleaning up`, error.toString())
      }
    })
  }

  /**
   * Returns the item for the download
   *
   * @param download
   */
  public getItemForDownload(download: Download): Promise<Episode | Movie> {
    return (
      download.itemType === 'movie'
        ? this.movieModel
        : this.episodeModel
    ).findById(download._id)
  }

  /**
   * Returns the download location for a download
   */
  private getDownloadLocation(download: Download) {
    return `${this.configService.get('DOWNLOAD_LOCATION')}/${download._id}`
  }
}
