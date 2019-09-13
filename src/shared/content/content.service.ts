import { ContentArgs } from './dto/content.args'

export abstract class ContentService {

  protected getOptions(contentArgs: ContentArgs): Object {
    return {
      skip: contentArgs.offset,
      limit: contentArgs.limit,
      sort: this.getSorting(contentArgs)
    }
  }

  protected getQuery(contentArgs: ContentArgs): Object {
    let query = {}

    if (contentArgs.noBookmarks) {
      query = {
        bookmarked: false
      }
    }

    if (contentArgs.noWatched) {
      query = {
        ...query,
        watched: false
      }
    }

    return query
  }

  protected getSorting(contentArgs: ContentArgs): Object {
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
          latest_episode: order,
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
