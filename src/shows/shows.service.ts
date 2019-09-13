import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Show, Season } from '@pct-org/mongo-models'

import { ContentService } from '../shared/content/content.service'
import { ContentArgs } from '../shared/content/dto/content.args'

@Injectable()
export class ShowsService extends ContentService {

  constructor(
    @InjectModel('Shows') private readonly showModel: Model<Show>,
    @InjectModel('Seasons') private readonly seasonModel: Model<Season>
  ) {
    super()
  }

  async findAll(contentArgs: ContentArgs): Promise<Show[]> {
    return this.showModel.find(
      this.getQuery(contentArgs),
      {},
      this.getOptions(contentArgs)
    )
  }

  async getSeasons(imdbId: string): Promise<Season[]> {
    return this.seasonModel.find(
      {
        showImdbId: imdbId
      },
      {},
      {
        // skip: showsArgs.offset,
        // limit: showsArgs.limit,
        sort: {
          number: 0 // Sort on season number
        }
      }
    )
  }

}
