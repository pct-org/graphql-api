import { ContentsArgs } from './dto/contents.args'

export abstract class ContentService {

  protected getOptions(contentArgs: ContentsArgs): Object {
    return {
      skip: contentArgs.offset,
      limit: contentArgs.limit,
      sort: this.getSorting(contentArgs)
    }
  }

  protected getQuery(contentArgs: ContentsArgs): Object {
    let query = {}

    if (contentArgs.noBookmarks) {
      query = {
        bookmarked: false
      }
    }

    return query
  }

  protected getSorting(contentArgs: ContentsArgs): Object {
    const order = -1

    switch (contentArgs.sort) {
      case 'name':
        return {
          title: order
        }
      case 'rating':
        return {
          'rating.votes': order,
          'rating.percentage': order
        }

      case 'released':
        return {
          latestEpisode: order,
          released: order
        }

      case 'trending':
        return {
          'rating.watching': order
        }

      case 'year':
        return {
          year: order
        }

      default:
        return {
          'rating.votes': order,
          'rating.precentage': order,
          'rating.watching': order
        }
    }
  }
}
