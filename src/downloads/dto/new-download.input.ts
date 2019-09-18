import { Field, InputType } from 'type-graphql'

@InputType()
export class NewDownloadInput {

  @Field({ description: 'The _id of the movie or episode.' })
  _id: string

  @Field({ description: 'Type of the download: movie or episode.' })
  type: string

  @Field({ description: 'The quality to download.' })
  quality: string

}
