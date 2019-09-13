import { Max, Min } from 'class-validator'
import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class MoviesArgs {

  @Field()
  @Min(0)
  offset: number = 0

  @Field()
  @Min(1)
  @Max(50)
  limit: number = 25

  @Field()
  sort: string = 'trending'

  @Field()
  withoutBookmarks: boolean = false

}
