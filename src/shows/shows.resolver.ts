import { Args, Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql'

import { Show, Season } from '@pct-org/mongo-models'

import { ShowArgs } from './dto/show.args'
import { ShowsArgs } from './dto/shows.args'
import { ShowsService } from './shows.service'

import { SeasonsService } from '../seasons/seasons.service'

@Resolver(of => Show)
export class ShowsResolver {

  constructor(
    private readonly showsService: ShowsService,
    private readonly seasonsService: SeasonsService
  ) {}

  /**
   * Fetch one show
   */
  @Query(returns => Show, { description: 'Get one show by _id (imdb id)' })
  show(@Args() showArgs: ShowArgs): Promise<Show> {
    return this.showsService.findOne(showArgs)
  }

  /**
   * Fet multiple shows
   */
  @Query(returns => [Show], { description: 'Get all shows.' })
  shows(@Args() showsArgs: ShowsArgs): Promise<Show[]> {
    return this.showsService.findAll(showsArgs)
  }

  /**
   * Fetches all seasons for a show
   */
  @ResolveProperty(type => [Season])
  seasons(@Parent() show: Show): Promise<Season[]> {
    return this.seasonsService.findAllForShow(show._id)
  }

}
