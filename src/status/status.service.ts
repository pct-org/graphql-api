import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Movie, Show, Episode } from '@pct-org/mongo-models'

import { ConfigService } from '../shared/config/config.service'
import { Status } from './status.object-type'

@Injectable()
export class StatusService {

  constructor(
    @InjectModel('Movies')
    private readonly movieModel: Model<Movie>,
    @InjectModel('Shows')
    private readonly showModel: Model<Show>,
    @InjectModel('Episodes')
    private readonly episodesModel: Model<Episode>,
    private readonly configService: ConfigService
  ) {}

  async getStatus(): Promise<Status> {
    return {
      version: this.configService.version,
      totalMovies: this.movieModel.countDocuments(),
      totalShows: this.showModel.countDocuments(),
      totalEpisodes: this.episodesModel.countDocuments()
    }
  }

}
