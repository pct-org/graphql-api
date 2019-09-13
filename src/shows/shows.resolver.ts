import { Args, Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql'

import { Show, Season } from '@pct-org/mongo-models'

import { ContentArgs } from '../shared/content/dto/content.args'
import { ShowsService } from './shows.service'

@Resolver(of => Show)
export class ShowsResolver {

  constructor(private readonly showsService: ShowsService) {}

  @Query(returns => [Show])
  shows(@Args() contentArgs: ContentArgs): Promise<Show[]> {
    return this.showsService.findAll(contentArgs)
  }

  @ResolveProperty(type => [Season])
  seasons(@Parent() show) {
    return this.showsService.getSeasons(show.imdbId)
  }

}
