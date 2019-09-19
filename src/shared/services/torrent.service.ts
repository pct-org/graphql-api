import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as pMap from 'p-map'
import * as WebTorrent from 'webtorrent-hybrid'
import { Torrent, Instance as WebTorrentInstance } from 'webtorrent'
import { Episode, Movie, Download } from '@pct-org/mongo-models'

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
   * Download that will be streamed to the user
   */
  private streams: Download[] = []

  /**
   * Items currently downloading
   */
  private torrents: TorrentInterface[] = []

  /**
   * WebTorrent engine
   */
  private webTorrent: WebTorrentInstance = null

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>,
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>,
    @InjectModel('Downloads') private readonly downloadModel: Model<Download>,
    private readonly configService: ConfigService
  ) {
    this.webTorrent = new WebTorrent({ maxConns: 20 })
    this.webTorrent.on('error', (error) => {
      this.logger.error(`[webTorrent]: ${JSON.stringify(error)}`)
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
  public stopStreaming(download: Download): Promise<any> {
    this.logger.log(`[${download._id}]: Stop streaming`)

    return new Promise((resolve) => {
      // Get the stream
      const downloadingTorrent = this.torrents.find(torrent => torrent._id === download._id)

      if (!downloadingTorrent) {
        return resolve()
      }

      // Destroy the torrent
      downloadingTorrent.torrent.destroy((err) => {
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

      const item = await (
        download.type === 'movie'
          ? this.movieModel
          : this.episodeModel
      ).findById(download._id)

      const { torrents } = item

      // Find the correct magnet
      const magnet = torrents.find(torrent => torrent.quality === download.quality)

      // Check if we have a magnet to be sure
      if (!magnet) {
        // TODO:: Download then a different quality?

        // No magnet found, update status to failed
        await this.updateOne(download, {
          status: TorrentService.STATUS_FAILED
        })

        item.downloading = false
        item.save()

        // Resolve instead of reject as no try catch is around the method
        return resolve()
      }

      // Update item that we are downloading
      item.downloading = true
      item.save()

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
          path: `${this.configService.get('DOWNLOAD_LOCATION')}/${download._id}`
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
      this.torrents.push({
        _id: download._id,
        torrent
      })

      let lastUpdateProgress = null

      torrent.on('download', async () => {
        const newProgress = torrent.progress * 100

        this.logger.debug(`[${download._id}]: Progress ${newProgress.toFixed(1)}% at ${formatKbToString(torrent.downloadSpeed)}`)

        if (lastUpdateProgress === null || (lastUpdateProgress + 1) < newProgress) {
          lastUpdateProgress = newProgress

          // Update the item
          this.updateOne(download, {
            progress: (torrent.progress * 100).toFixed(1),
            status: TorrentService.STATUS_DOWNLOADING,
            timeRemaining: torrent.timeRemaining,
            speed: torrent.downloadSpeed,
            numPeers: torrent.numPeers
          })
        }
      })

      torrent.on('error', (error) => {
        console.log('TORRENT ERROR', error)
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

        // Remove the magnet from the client
        this.webTorrent.remove(
          magnet.url
        )

        item.downloading = false
        item.downloaded = true
        item.downloadedOn = Number(new Date())
        item.save()

        resolve()
      })
    }
  }

  /**
   * Updates download item in the databse
   *
   * @param download
   * @param update
   */
  private async updateOne(download: Model<Download>, update: Object): Promise<Download> {
    // Apply the update
    Object.keys(update).forEach((key) => download[key] = update[key])

    download.updatedAt = Number(new Date())

    // Save the update
    return download.save()
  }

  /**
   * Removes a download from torrents
   */
  private removeFromTorrents(download: Download) {
    this.torrents = this.torrents.filter(tor => tor._id !== download._id)
  }
}
