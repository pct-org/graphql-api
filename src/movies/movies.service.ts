import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Movie } from '@pct-org/mongo-models'

import { ContentService } from '../shared/content/content.service'
import { ContentArgs } from '../shared/content/dto/content.args'

@Injectable()
export class MoviesService extends ContentService {

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>
  ) {
    super()
  }

  async findAll(contentArgs: ContentArgs): Promise<Movie[]> {
    return this.movieModel.find(
      this.getQuery(contentArgs),
      {},
      this.getOptions(contentArgs)
    )
  }

}
