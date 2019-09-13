import { Args, Query, Resolver } from '@nestjs/graphql'

import { Movie } from '@pct-org/mongo-models'

import { ContentArgs } from '../shared/content/dto/content.args'
import { MoviesService } from './movies.service'

@Resolver(of => Movie)
export class MoviesResolver {

  constructor(private readonly moviesService: MoviesService) {}

  @Query(returns => [Movie])
  movies(@Args() contentArgs: ContentArgs): Promise<Movie[]> {
    return this.moviesService.findAll(contentArgs)
  }

}
