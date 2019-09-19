import { Module } from '@nestjs/common'

import { TorrentService } from '../shared/services/torrent.service'
import { DownloadsResolver } from './downloads.resolver'
import { DownloadsService } from './downloads.service'

@Module({
  providers: [
    DownloadsResolver,
    DownloadsService,
    TorrentService
  ]
})
export class DownloadsModule {
}
