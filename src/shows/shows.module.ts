import { Module } from '@nestjs/common'

import { ShowsResolver } from './shows.resolver'
import { ShowsService } from './shows.service'

@Module({
  providers: [ShowsResolver, ShowsService]
})
export class ShowsModule {
}
