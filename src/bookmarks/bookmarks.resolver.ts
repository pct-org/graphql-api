import { Args, Query, Mutation, Resolver } from '@nestjs/graphql'

import { Content } from '@pct-org/mongo-models'

import { BookmarksArgs } from './dto/bookmarks.args'
import { BookmarksService } from './bookmarks.service'

@Resolver(of => Content)
export class BookmarksResolver {

  constructor(private readonly bookmarksService: BookmarksService) {}

  @Query(returns => [Content])
  bookmarks(@Args() bookmarksArgs: BookmarksArgs): Promise<Content[]> {
    return this.bookmarksService.findAll(bookmarksArgs)
  }

  @Mutation(returns => Content)
  addBookmark(
    @Args('_id') _id: string,
    @Args('type') type: string
  ): Promise<Content> {
    return this.bookmarksService.updateBookmark({
        _id,
        type
      },
      true
    )
  }

  @Mutation(returns => Content)
  removeBookmark(
    @Args('_id') _id: string,
    @Args('type') type: string
  ): Promise<Content> {
    return this.bookmarksService.updateBookmark({
        _id,
        type
      },
      false
    )
  }

}
