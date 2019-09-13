import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class Status {

  @Field({ description: 'The current version of the scraper.', nullable: true })
  version: string

  @Field({ description: 'The current status of the scraper.' })
  status: string

  @Field({ description: 'The total amount of movies in the database.' })
  totalMovies: number

  @Field({ description: 'The total amount of shows in the database.' })
  totalShows: number

  @Field({ description: 'The time when the scraper scrapped for the last time' })
  updated: number

  @Field({ description: 'The uptime of the scraper.' })
  uptime: number

}
