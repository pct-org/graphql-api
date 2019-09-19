import { Args, Parent, Query, ResolveProperty, Resolver, Mutation } from '@nestjs/graphql'
import { Movie, Episode, Download } from '@pct-org/mongo-models'

import { DownloadsArgs } from './dto/downloads.args'
import { DownloadArgs } from './dto/download.args'
import { DownloadsService } from './downloads.service'

import { TorrentService } from '../shared/services/torrent.service'
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
  startDownload(
    @Args('_id') _id: string,
    @Args('variant') variant: string,
    @Args('quality') quality: string,
    @Args({ name: 'type', defaultValue: 'download', type: () => String }) type: string
  ): Promise<Download> {
    return this.downloadsService.addOne({
      _id,
      type,
      variant,
      quality
    })
  }

  @Mutation(returns => Download)
  async startStream(
    @Args('_id') _id: string,
    @Args('variant') variant: string,
    @Args('quality') quality: string
  ): Promise<Download> {
    let download = await this.download({ _id })

    if (!download) {
      download = await this.startDownload(_id, variant, quality, 'stream')
    }

    // if (download.status !== TorrentService.STATUS_DOWNLOADING
    //   && download.status !== TorrentService.STATUS_COMPLETE
    // ) {
    this.torrentService.startStreaming(download)
    // }

    return download
  }

  @Mutation(returns => Boolean)
  async stopStream(
    @Args('_id') _id: string
  ): Promise<Boolean> {
    const download = await this.download({ _id })

    if (download) {
      await this.torrentService.stopStreaming(download)
    }

    return true
  }

  /**
   * Fetch the movie of this download
   *
   * @param {Download} download - The download to fetch the movie for
   */
  @ResolveProperty(type => Movie, { description: 'The movie of this download, only if variant === "movie"' })
  movie(@Parent() download) {
    if (download.variant !== 'movie') {
      return null
    }

    return this.moviesService.findOne({ _id: download._id })
  }

  /**
   * Fetch the episode of this download
   *
   * @param {Download} download - The download to fetch the episode for
   */
  @ResolveProperty(type => Episode, { description: 'The episode of this download, only if variant === "episode"' })
  episode(@Parent() download) {
    if (download.variant !== 'episode') {
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
  downloadSpeed(@Parent() download) {
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
