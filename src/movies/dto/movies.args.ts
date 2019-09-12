import { Max, Min } from 'class-validator'
import { ArgsType, Field, Int } from 'type-graphql'

@ArgsType()
export class MoviesArgs {

  @Field(type => Int)
  @Min(0)
  offset: number = 0

  @Field(type => Int)
  @Min(1)
  @Max(50)
  limit: number = 25

  @Field(type => String)
  sort: string = 'trending'

}
