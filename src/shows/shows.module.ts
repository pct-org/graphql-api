import { Module } from '@nestjs/common'

import { ShowsResolver } from './shows.resolver'
import { ShowsService } from './shows.service'

import { SeasonsService } from '../seasons/seasons.service'

@Module({
  providers: [
    ShowsResolver,
    ShowsService,
    SeasonsService
  ]
})
export class ShowsModule {
}
