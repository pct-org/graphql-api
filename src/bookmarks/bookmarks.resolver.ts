import { NotFoundException } from '@nestjs/common'
import { Args, Parent, Query, ResolveProperty, Mutation, Resolver } from '@nestjs/graphql'

import { Movie, Show, Content } from '@pct-org/mongo-models'
import { Images } from '@pct-org/mongo-models'

import { BookmarksArgs } from './dto/bookmarks.args'
import { NewBookmarkInput } from './dto/new-bookmark.input'
import { BookmarksService } from './bookmarks.service'

@Resolver(of => Content)
export class BookmarksResolver {

  constructor(private readonly bookmarksService: BookmarksService) {}

  @Query(returns => [Content])
  bookmarks(@Args() bookmarksArgs: BookmarksArgs): Promise<Content[]> {
    return this.bookmarksService.findAll(bookmarksArgs)
  }

  @Mutation(returns => Content)
  addBookmark(@Args('data') newBookmarkData: NewBookmarkInput): Promise<Content> {
    return this.bookmarksService.updateBookmark(newBookmarkData, true)
  }

  @Mutation(returns => Content)
  removeBookmark(@Args('data') newBookmarkData: NewBookmarkInput): Promise<Content> {
    return this.bookmarksService.updateBookmark(newBookmarkData, false)
  }

}
