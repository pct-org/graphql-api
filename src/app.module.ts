import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { MongooseModule } from '@nestjs/mongoose'
import { PubSub } from 'graphql-subscriptions'

import { ConfigModule } from './shared/config/config.module'
import { ConfigService } from './shared/config/config.service'
import { ModelsModule } from './shared/models/models.module'
import { TorrentModule } from './shared/torrent/torrent.module'
import { PubSubModule } from './shared/pub-sub/pub-sub.module'

import { StatusModule } from './status/status.module'
import { MoviesModule } from './movies/movies.module'
import { ShowsModule } from './shows/shows.module'
import { SeasonsModule } from './seasons/seasons.module'
import { BookmarksModule } from './bookmarks/bookmarks.module'
import { DownloadsModule } from './downloads/downloads.module'
import { EpisodesModule } from './episodes/episodes.module'

import { WatchModule } from './watch/watch.module'

@Module({
  imports: [
    ModelsModule,
    ConfigModule,
    TorrentModule,
    PubSubModule,

    // GraphQL
    StatusModule,
    MoviesModule,
    ShowsModule,
    SeasonsModule,
    BookmarksModule,
    DownloadsModule,
    EpisodesModule,

    // Rest
    WatchModule,

    // Enable Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.databaseUri,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
    }),

    // Enable Graphql
    GraphQLModule.forRoot({
      debug: true,
      playground: true,
      tracing: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql'
    })
  ]
})
export class AppModule {
}
