import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Episode } from '@pct-org/mongo-models'

@Injectable()
export class SeasonService {

  constructor(
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>
  ) {}

  async getEpisodes(imdbId: string, seasonNumber: string): Promise<Episode[]> {
    return this.episodeModel.find(
      {
        showImdbId: imdbId,
        season: seasonNumber
      },
      {},
      {
        // skip: showsArgs.offset,
        // limit: showsArgs.limit,
        sort: {
          number: 0 // Sort on episode number
        }
      }
    )
  }

}
