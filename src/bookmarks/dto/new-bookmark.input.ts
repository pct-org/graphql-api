import { Field, InputType } from 'type-graphql'

@InputType()
export class NewBookmarkInput {

  @Field({ description: 'The IMDB ID of the movie or show.' })
  _id: string

  @Field({ description: 'Type of the bookmark: movie or show.' })
  type: string

}
