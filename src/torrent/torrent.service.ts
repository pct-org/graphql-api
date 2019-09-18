import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as pMap from 'p-map'
import * as WebTorrent from 'webtorrent-hybrid'

import { Episode, Movie, Download } from '@pct-org/mongo-models'
import { ConfigService } from '../shared/config/config.service'

@Injectable()
export class TorrentService {

  public static STATUS_QUEUED = 'queued'
  public static STATUS_DOWNLOADING = 'downloading'
  public static STATUS_CONNECTING = 'connecting'
  public static STATUS_COMPLETE = 'complete'
  public static STATUS_FAILED = 'failed'

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
  private stream: Download = null

  /**
   * WebTorrent engine
   */
  private webTorrent: WebTorrent = null

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>,
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>,
    @InjectModel('Downloads') private readonly downloadModel: Model<Download>,
    private readonly configService: ConfigService
  ) {
    this.webTorrent = new WebTorrent({ maxConns: 20 })
    this.webTorrent.on('error', console.log)

    // Check for incomplete downloads and add them to the downloads
    this.checkForIncompleteDownloads()
  }

  /**
   * Starts the streaming process of one item
   *
   * @param stream
   */
  public startStreaming(stream: Download) {
    this.stream = stream

    this.download(stream)
  }

  /**
   * Starts background downloads
   */
  public async startDownloads() {
    if (this.backgroundDownloading || this.downloads.length === 0) {
      return
    }

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

    console.log(this.downloads)
    console.log('')
    console.log('')
    console.log('')
    console.log('')

    // this.startDownloads()
  }

  /**
   * Downloads one item
   *
   * @param {Download} download - Item to download
   */
  private async download(download: Download) {
    return new Promise((async (resolve, reject) => {
      const item = await (
        download.type === 'movie'
          ? this.movieModel
          : this.episodeModel
      ).findById(download._id)

      const { torrents } = item

      // Find the correct magnet
      const magnet = torrents.find(torrent => torrent.quality === download.quality)

      // Check if we have a magnet to be sure
      if (magnet) {
        // Update the status to connecting
        await this.updateOne(download, {
          status: TorrentService.STATUS_CONNECTING
        })

        this.webTorrent.add(
          magnet.url,
          {
            // Add a unique download location for this item
            path: `${this.configService.get('DOWNLOAD_LOCATION')}/${download._id}`
          },
          this.handleTorrent(resolve, reject, download)
        )

      } else {
        // No magnet found, update status to failed
        await this.updateOne(download, {
          status: TorrentService.STATUS_FAILED
        })

        // Resolve instead of reject as no try catch is around the method
        resolve()
      }
    }))
  }

  /**
   * Handles the torrent and resolves when the torrent is done
   *
   * @param resolve
   * @param reject
   * @param download
   */
  private handleTorrent(resolve, reject, download) {
    return (torrent) => {
      // Update the progress every 1 second
      let interval = setInterval(() => {
        console.log(`[${download._id}] Progress: ${(torrent.progress * 100).toFixed(1)}% at ${torrent.downloadSpeed} down and ${torrent.uploadSpeed} up`)

        // Update the item
        this.updateOne(download, {
          progress: (torrent.progress * 100).toFixed(1),
          status: TorrentService.STATUS_DOWNLOADING
        })
      }, 1000)

      torrent.on('done', async () => {
        // Clear the interval
        clearInterval(interval)

        await this.updateOne(download, {
          progress: 100,
          status: TorrentService.STATUS_COMPLETE
        })

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

}
