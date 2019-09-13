import { HttpService, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Movie, Show } from '@pct-org/mongo-models'

import { ConfigService } from '../shared/config/config.service'
import { Status } from './status.object-type'

@Injectable()
export class StatusService {

  constructor(
    @InjectModel('Movies')
    private readonly movieModel: Model<Movie>,
    @InjectModel('Shows')
    private readonly showModel: Model<Show>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async getStatus(): Promise<Status> {
    try {
      const status = await this.httpService.get(
        `${this.configService.get('SCRAPER_URL')}/status`
      ).toPromise()

      return status.data

    } catch (e) {
      return {
        version: null,
        status: 'offline',
        totalMovies: this.movieModel.countDocuments(),
        totalShows: this.showModel.countDocuments(),
        updated: 0,
        uptime: 0
      }
    }
  }

}
