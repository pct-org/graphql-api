import { ArgsType } from '@nestjs/graphql'

import { ContentsArgs } from '../../shared/content/dto/contents.args'

@ArgsType()
export class ShowsArgs extends ContentsArgs {

}
