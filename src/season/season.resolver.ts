import { Parent, ResolveProperty, Resolver } from '@nestjs/graphql'
import { Season, Episode } from '@pct-org/mongo-models'

import { SeasonService } from './season.service'

@Resolver(of => Season)
export class SeasonResolver {

  constructor(private readonly seasonService: SeasonService) {}

  @ResolveProperty(type => [Episode])
  episodes(@Parent() season) {
    return this.seasonService.getEpisodes(season.showImdbId, season.number)
  }

}
