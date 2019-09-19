import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Movie, Show, Content } from '@pct-org/mongo-models'

import { BookmarksArgs } from './dto/bookmarks.args'
import { NewBookmarkInput } from './dto/new-bookmark.input'

@Injectable()
export class BookmarksService {

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>,
    @InjectModel('Shows') private readonly showModel: Model<Show>
  ) {}

  async findAll(bookmarksArgs: BookmarksArgs): Promise<Content[]> {
    const movies = await this.movieModel.find(
      {
        bookmarked: true
      },
      {},
      {
        skip: bookmarksArgs.offset,
        limit: bookmarksArgs.limit
      }
    )

    const shows = await this.showModel.find(
      {
        bookmarked: true
      },
      {},
      {
        skip: bookmarksArgs.offset,
        limit: bookmarksArgs.limit
      }
    )

    return [
      ...movies,
      ...shows
    ].sort((itemA, itemB) => itemB.bookmarkedOn - itemA.bookmarkedOn)
  }

  /**
   * Updates an movie or show to be bookmarked
   * @param addBookmarksArgs
   * @param {boolean} add - Do we need to add or remove the bookmark
   */
  async updateBookmark(addBookmarksArgs: NewBookmarkInput, add): Promise<Content> {
    return await (

      addBookmarksArgs.type === 'movie'
        ? this.movieModel
        : this.showModel

    ).findByIdAndUpdate(
      addBookmarksArgs._id,
      {
        bookmarked: add,
        bookmarkedOn: add
          ? Number(new Date())
          : null
      },
      {
        new: true // Return the new updated object
      }
    )
  }

}
