import { Parent, ResolveProperty, Resolver } from '@nestjs/graphql'
import { Season, Episode } from '@pct-org/mongo-models'

import { EpisodesService } from '../episodes/episodes.service'

@Resolver(of => Season)
export class SeasonsResolver {

  constructor(
    private readonly episodesService: EpisodesService
  ) {}

  @ResolveProperty(type => [Episode])
  episodes(@Parent() season: Season) {
    return this.episodesService.findAllForSeason(season.showImdbId, season.number)
  }

}
