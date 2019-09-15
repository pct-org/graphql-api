import { Args, Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql'

import { Show, Season } from '@pct-org/mongo-models'

import { ShowArgs } from './dto/show.args'
import { ShowsArgs } from './dto/shows.args'
import { ShowsService } from './shows.service'

@Resolver(of => Show)
export class ShowsResolver {

  constructor(private readonly showsService: ShowsService) {}

  @Query(returns => Show, { description: 'Get one show by _id (imdb id)' })
  show(@Args() showArgs: ShowArgs): Promise<Show> {
    return this.showsService.findOne(showArgs)
  }

  @Query(returns => [Show], { description: 'Get all shows.' })
  shows(@Args() showsArgs: ShowsArgs): Promise<Show[]> {
    return this.showsService.findAll(showsArgs)
  }

  @ResolveProperty(type => [Season])
  seasons(@Parent() show) {
    return this.showsService.getSeasons(show.imdbId)
  }

}
