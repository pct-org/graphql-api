import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Movie } from '@pct-org/mongo-models'

import { MoviesArgs } from './dto/movies.args'

@Injectable()
export class MoviesService {

  constructor(@InjectModel('Movies') private readonly movieModel: Model<Movie>) {}

  async findOneById(id: string): Promise<Movie> {
    return {} as any
  }

  async findAll(moviesArgs: MoviesArgs): Promise<Movie[]> {
    return this.movieModel.find(
      this.getQuery(moviesArgs),
      {},
      {
        skip: moviesArgs.offset,
        limit: moviesArgs.limit,
        sort: this.getSorting(moviesArgs)
      }
    )
  }

  private getQuery(moviesArgs: MoviesArgs): Object {
    let query = {}

    if (moviesArgs.withoutBookmarks) {
      query = {
        bookmarked: false
      }
    }

    return query
  }

  private getSorting(moviesArgs: MoviesArgs): Object {
    const order = -1

    switch (moviesArgs.sort) {
      case 'name':
        return {
          title: order
        }
      case 'rating':
        return {
          'rating.votes': order,
          'rating.percentage': order
        }

      case 'released':
        return {
          latest_episode: order,
          released: order
        }

      case 'trending':
        return {
          'rating.watching': order
        }

      case 'year':
        return {
          year: order
        }

      default:
        return {
          'rating.votes': order,
          'rating.precentage': order,
          'rating.watching': order
        }
    }
  }
}
