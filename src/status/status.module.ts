import { Module, HttpModule } from '@nestjs/common'

import { StatusResolver } from './status.resolver'
import { StatusService } from './status.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: 100
    })
  ],
  providers: [StatusResolver, StatusService]
})
export class StatusModule {
}
