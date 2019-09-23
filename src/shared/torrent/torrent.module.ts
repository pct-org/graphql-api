import { Global, Module } from '@nestjs/common'

import { TorrentService } from './torrent.service'

@Global()
@Module({
  providers: [TorrentService],
  exports: [TorrentService]
})
export class TorrentModule {
}
