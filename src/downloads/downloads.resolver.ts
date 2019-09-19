import { Args, Parent, Query, ResolveProperty, Resolver, Mutation } from '@nestjs/graphql'

import { Movie, Episode, Download } from '@pct-org/mongo-models'

import { DownloadsArgs } from './dto/downloads.args'
import { DownloadArgs } from './dto/download.args'
import { NewDownloadInput } from './dto/new-download.input'
import { DownloadsService } from './downloads.service'

import { TorrentService } from '../shared/services/torrent.service'

@Resolver(of => Download)
export class DownloadsResolver {

  constructor(
    private readonly downloadsService: DownloadsService,
    private readonly torrentService: TorrentService
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
    @Args('type') type: string,
    @Args('quality') quality: string
  ): Promise<Download> {
    return this.downloadsService.addOne({
      _id,
      type,
      quality
    })
  }

  @Mutation(returns => Download)
  async startStream(
    @Args('_id') _id: string,
    @Args('type') type: string,
    @Args('quality') quality: string
  ): Promise<Download> {
    let download = await this.download({ _id })

    if (!download) {
      download = await this.startDownload(_id, type, quality)
    }

    if (download.status !== TorrentService.STATUS_DOWNLOADING) {
      this.torrentService.startStreaming(download)
    }

    return download
  }

  @Mutation(returns => Download)
  async stopStream(
    @Args('_id') _id: string,
    @Args('type') type: string,
    @Args('quality') quality: string
  ): Promise<Download> {
    let download = await this.download({ _id })

    if (!download) {
      download = await this.startDownload(_id, type, quality)
    }

    if (download.status === TorrentService.STATUS_DOWNLOADING) {
      this.torrentService.startStreaming(download)
    }

    return download
  }

  @ResolveProperty(type => Movie)
  movie(@Parent() download) {
    if (download.type !== 'movie') {
      return null
    }

    return this.downloadsService.getMovie(download._id)
  }

  @ResolveProperty(type => Episode)
  episode(@Parent() download) {
    if (download.type !== 'episode') {
      return null
    }

    return this.downloadsService.getEpisode(download._id)
  }

}
