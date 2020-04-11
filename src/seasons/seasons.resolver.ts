import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Season, Episode } from '@pct-org/mongo-models'

import { EpisodesService } from '../episodes/episodes.service'

@Resolver(of => Season)
export class SeasonsResolver {

  constructor(
    private readonly episodesService: EpisodesService
  ) {}

  @ResolveField(type => [Episode])
  episodes(@Parent() season: Season): Promise<Episode[]> {
    return this.episodesService.findAllForSeason(season.showImdbId, season.number)
  }

}
