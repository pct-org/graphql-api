import { Module } from '@nestjs/common'

import { StatusResolver } from './status.resolver'
import { StatusService } from './status.service'
import { StatusController } from './status.controller'

@Module({
  providers: [StatusResolver, StatusService],
  controllers: [StatusController]
})
export class StatusModule {
}
