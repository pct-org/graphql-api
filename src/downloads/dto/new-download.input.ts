import { Field, InputType } from 'type-graphql'

@InputType()
export class NewDownloadInput {

  @Field({ description: 'The _id of the movie or episode.' })
  _id: string

  @Field({ description: 'Type of the download: stream or download.', nullable: true, defaultValue: 'download' })
  type: string

  @Field({ description: 'The item\'s of the download, episode or movie.' })
  itemType: string

  @Field({ description: 'The quality to download.' })
  quality: string

}
