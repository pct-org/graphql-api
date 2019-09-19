import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Episode } from '@pct-org/mongo-models'

@Injectable()
export class EpisodesService {

  constructor(
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>
  ) {}

  findOne(_id: string): Promise<Episode[]> {
    return this.episodeModel.find(
      {
        _id
      }
    )
  }

  findAllForSeason(imdbId: string, seasonNumber: number): Promise<Episode[]> {
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
