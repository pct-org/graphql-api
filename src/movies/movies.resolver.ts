import { NotFoundException } from '@nestjs/common'
import { Args, Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql'

import { Movie } from '@pct-org/mongo-models'
import { Images } from '@pct-org/mongo-models'

import { MoviesArgs } from './dto/movies.args'
import { MoviesService } from './movies.service'

@Resolver(of => Movie)
export class MoviesResolver {

  constructor(private readonly moviesService: MoviesService) {}

  @Query(returns => [Movie])
  movies(@Args() moviesArgs: MoviesArgs): Promise<Movie[]> {
    return this.moviesService.findAll(moviesArgs)
  }

  // @ResolveProperty(type => Images)
  // async images(@Parent() movie) {
  //
  //   return {
  //     logo: 'test'
  //   }
  // }
}
