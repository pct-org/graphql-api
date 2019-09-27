import { Query, Resolver, ResolveProperty, Parent } from '@nestjs/graphql'
import { Episode, Show } from '@pct-org/mongo-models'

import { EpisodesService } from './episodes.service'
import { BookmarksService } from '../bookmarks/bookmarks.service'
import { ShowsService } from '../shows/shows.service'

@Resolver(of => Episode)
export class EpisodesResolver {

  constructor(
    private readonly bookmarksService: BookmarksService,
    private readonly episodesService: EpisodesService,
    private readonly showsService: ShowsService
  ) {}

  @Query(returns => [Episode])
  myEpisodes(): Promise<Episode[]> {
    return this.episodesService.findMyEpisodes(this.bookmarksService)
  }

  @ResolveProperty(type => Show)
  show(@Parent() episode: Episode) {
    return this.showsService.findOne({
      _id: episode.showImdbId
    })
  }

}
