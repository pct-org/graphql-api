import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Season } from '@pct-org/mongo-models'

@Injectable()
export class SeasonsService {

  constructor(
    @InjectModel('Seasons') private readonly seasonModel: Model<Season>
  ) {}

  findAllForShow(_id: string): Promise<Season[]> {
    return this.seasonModel.find(
      {
        showImdbId: _id
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
