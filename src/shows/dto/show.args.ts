import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class ShowArgs {

  @Field()
  _id: string

}
