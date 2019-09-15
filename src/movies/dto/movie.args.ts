import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class MovieArgs {

  @Field()
  _id: string

}
