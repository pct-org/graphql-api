import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Episode } from '@pct-org/mongo-models'

import { BookmarksService } from '../bookmarks/bookmarks.service'

@Injectable()
export class EpisodesService {

  constructor(
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>
  ) {}

  /**
   * Returns all the episodes for the user that he did not watch
   * from shows he bookmarked
   */
  async findMyEpisodes(bookmarksService: BookmarksService): Promise<Episode[]> {
    const shows = await bookmarksService.findAllShows({
      offset: 0,
      limit: 1000,
      query: null
    })

    const eightDaysAgo = new Date(new Date().getTime() - (8 * 24 * 60 * 60 * 1000)).getTime()

    return this.episodeModel.find(
      {
        showImdbId: {
          $in: shows.map(show => show._id)
        },
        firstAired: {
          $gt: eightDaysAgo,
        },
        $where: 'this.torrents.length > 0'
      },
      {},
      {
        sort: {
          firstAired: -1
        }
      }
    )
  }

  findOne(_id: string): Promise<Episode[]> {
    return this.episodeModel.findById(
      _id
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
        },
        lean: true
      }
    )
  }

  findAllWithIDS(ids: string[]): Promise<Episode[]> {
    return this.episodeModel.find(
      {
        _id: {
          $in: ids
        }
      },
      {},
      {
        // skip: showsArgs.offset,
        // limit: showsArgs.limit,
        sort: {
          number: 0 // Sort on episode number
        },
        lean: true
      }
    )
  }

  findForCalendar(showImdbId): Promise<Episode[]> {
    const fourteenDaysAgo = new Date(new Date().getTime() - (14 * 24 * 60 * 60 * 1000)).getTime()

    return this.episodeModel.find(
      {
        showImdbId,
        firstAired: {
          $gt: fourteenDaysAgo
        },
      },
      {},
      {
        sort: {
          number: 0 // Sort on episode number
        },
        lean: true
      }
    )
  }

}
