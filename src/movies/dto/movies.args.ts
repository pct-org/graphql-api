import { ArgsType, Field } from 'type-graphql'

import { ContentsArgs } from '../../shared/content/dto/contents.args'

@ArgsType()
export class MoviesArgs extends ContentsArgs {

  @Field()
  noWatched: boolean = false

}
