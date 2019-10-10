import { Args, Parent, Query, ResolveProperty, Resolver, Mutation } from '@nestjs/graphql'
import { Movie, Episode, Download } from '@pct-org/mongo-models'

import { DownloadsArgs } from './dto/downloads.args'
import { DownloadArgs } from './dto/download.args'
import { DownloadsService } from './downloads.service'

import { TorrentService } from '../shared/torrent/torrent.service'
import { formatKbToString, formatMsToRemaining } from '../shared/utils'
import { MoviesService } from '../movies/movies.service'
import { EpisodesService } from '../episodes/episodes.service'

@Resolver(of => Download)
export class DownloadsResolver {

  constructor(
    private readonly downloadsService: DownloadsService,
    private readonly torrentService: TorrentService,
    private readonly moviesService: MoviesService,
    private readonly episodesService: EpisodesService
  ) {}

  @Query(returns => [Download], { description: 'Get all downloads.' })
  downloads(@Args() downloadsArgs: DownloadsArgs): Promise<Download[]> {
    return this.downloadsService.findAll(downloadsArgs)
  }

  @Query(returns => Download, { description: 'Get one download.' })
  download(@Args() downloadArgs: DownloadArgs): Promise<Download> {
    return this.downloadsService.findOne(downloadArgs)
  }

  @Mutation(returns => Download)
  async startDownload(
    @Args('_id') _id: string,
    @Args('itemType') itemType: string,
    @Args('quality') quality: string,
    @Args({ name: 'type', defaultValue: TorrentService.TYPE_DOWNLOAD, type: () => String }) type: string
  ): Promise<Download> {
    const downloadExists = await this.downloadsService.findOne({
      _id
    })

    if (downloadExists) {
      return downloadExists
    }

    const download = await this.downloadsService.addOne({
      _id,
      type,
      itemType,
      quality
    })

    this.torrentService.addDownload(download)

    // Add the download to the queue
    if (type !== TorrentService.TYPE_STREAM) {
      // Start the queue
      this.torrentService.startDownloads()
    }

    const item = await this.torrentService.getItemForDownload(download)

    await this.torrentService.updateOne(
      item,
      {
        download: {
          downloadStatus: TorrentService.STATUS_QUEUED,
          downloading: true
        }
      }
    )

    return download
  }

  @Mutation(returns => Download)
  async removeDownload(
    @Args('_id') _id: string,
    @Args({ name: 'type', defaultValue: TorrentService.TYPE_DOWNLOAD, type: () => String }) type: string
  ): Promise<Download> {
    const download = await this.download({ _id })

    if (download) {
      // Only cleanup and update if the stop type is the same as the start type
      if (type === download.type) {
        await this.torrentService.stopDownloading(download)

        // Start the other queued items
        this.torrentService.startDownloads()

        await this.torrentService.cleanUpDownload(download)

        const item = await this.torrentService.getItemForDownload(download)

        await this.torrentService.updateOne(
          item,
          {
            download: {
              downloadedOn: null,
              downloadStatus: null,
              downloading: false,
              downloadComplete: false
            }
          }
        )

        download.status = TorrentService.STATUS_REMOVED
        download.progress = 0
      }

      return download
    }

    return null
  }

  @Mutation(returns => Download)
  async startStream(
    @Args('_id') _id: string,
    @Args('itemType') itemType: string,
    @Args('quality') quality: string
  ): Promise<Download> {
    let download = await this.download({ _id })

    if (!download) {
      download = await this.startDownload(_id, itemType, quality, TorrentService.TYPE_STREAM)
    }

    // Check if the download is not complete or downloading
    if (![TorrentService.STATUS_COMPLETE, TorrentService.STATUS_DOWNLOADING].includes(download.status)) {
      this.torrentService.startStreaming(download)
    }

    return download
  }

  @Mutation(returns => Download)
  async stopStream(
    @Args('_id') _id: string
  ): Promise<Download> {
    return this.removeDownload(_id, TorrentService.TYPE_STREAM)
  }

  /**
   * Fetch the movie of this download
   *
   * @param {Download} download - The download to fetch the movie for
   */
  @ResolveProperty(type => Movie, { description: 'The movie of this download, only if itemType === "movie"' })
  movie(@Parent() download) {
    if (download.itemType !== 'movie') {
      return null
    }

    return this.moviesService.findOne({ _id: download._id })
  }

  /**
   * Fetch the episode of this download
   *
   * @param {Download} download - The download to fetch the episode for
   */
  @ResolveProperty(type => Episode, { description: 'The episode of this download, only if itemType === "episode"' })
  episode(@Parent() download) {
    if (download.itemType !== 'episode') {
      return null
    }

    return this.episodesService.findOne(download._id)
  }

  /**
   * Formats the download speed correctly
   *
   * @param {Download} download - The download to format it on
   */
  @ResolveProperty(type => String)
  speed(@Parent() download) {
    return formatKbToString(download.speed)
  }

  /**
   * Formats the download time remaining correctly
   *
   * @param {Download} download - The download to format it on
   */
  @ResolveProperty(type => String)
  timeRemaining(@Parent() download) {
    return formatMsToRemaining(download.timeRemaining)
  }

}
