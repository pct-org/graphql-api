import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Movie } from '@pct-org/mongo-models'

import { MovieArgs } from './dto/movie.args'
import { MoviesArgs } from './dto/movies.args'
import { ContentService } from '../shared/content/content.service'

@Injectable()
export class MoviesService extends ContentService {

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>
  ) {
    super()
  }

  findOne(movieArgs: MovieArgs): Promise<Movie> {
    return this.movieModel.findById(
      movieArgs._id
    )
  }

  findAll(moviesArgs: MoviesArgs): Promise<Movie[]> {
    return this.movieModel.find(
      this.getQuery(moviesArgs),
      {},
      this.getOptions(moviesArgs)
    )
  }

  protected getQuery(moviesArgs: MoviesArgs): Object {
    let query = super.getQuery(moviesArgs)

    if (moviesArgs.noWatched) {
      query = {
        ...query,
        'watched.complete': false
      }
    }

    return query
  }

}
