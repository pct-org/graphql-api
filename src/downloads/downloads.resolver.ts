import { Args, Parent, Query, ResolveProperty, Resolver, Mutation } from '@nestjs/graphql'

import { Movie, Episode, Download } from '@pct-org/mongo-models'

import { DownloadsArgs } from './dto/downloads.args'
import { DownloadArgs } from './dto/download.args'
import { NewDownloadInput } from './dto/new-download.input'
import { DownloadsService } from './downloads.service'

@Resolver(of => Download)
export class DownloadsResolver {

  constructor(private readonly downloadsService: DownloadsService) {}

  @Query(returns => [Download], { description: 'Get all downloads.' })
  downloads(@Args() downloadsArgs: DownloadsArgs): Promise<Download[]> {
    return this.downloadsService.findAll(downloadsArgs)
  }

  @Query(returns => Download, { description: 'Get one download.' })
  download(@Args() downloadArgs: DownloadArgs): Promise<Download> {
    return this.downloadsService.findOne(downloadArgs)
  }

  @Mutation(returns => Download)
  startDownload(@Args('data') newDownloadData: NewDownloadInput): Promise<Download> {
    return this.downloadsService.addOne(newDownloadData)
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
