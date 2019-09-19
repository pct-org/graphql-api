import { Module } from '@nestjs/common'

import { TorrentService } from '../shared/services/torrent.service'
import { DownloadsResolver } from './downloads.resolver'
import { DownloadsService } from './downloads.service'

import { MoviesService } from '../movies/movies.service'
import { EpisodesService } from '../episodes/episodes.service'

@Module({
  providers: [
    DownloadsResolver,
    DownloadsService,
    TorrentService,

    MoviesService,
    EpisodesService
  ]
})
export class DownloadsModule {
}
