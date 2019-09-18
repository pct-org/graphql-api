import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { MongooseModule } from '@nestjs/mongoose'

import { ConfigModule } from './shared/config/config.module'
import { ConfigService } from './shared/config/config.service'
import { ModelsModule } from './shared/models/models.module'

import { StatusModule } from './status/status.module'
import { MoviesModule } from './movies/movies.module'
import { ShowsModule } from './shows/shows.module'
import { SeasonModule } from './season/season.module'
import { BookmarksModule } from './bookmarks/bookmarks.module'
import { DownloadsModule } from './downloads/downloads.module'

import { WatchModule } from './watch/watch.module'

@Module({
  imports: [
    StatusModule,
    ModelsModule,
    ConfigModule,

    // GraphQL
    MoviesModule,
    ShowsModule,
    SeasonModule,
    BookmarksModule,
    DownloadsModule,

    // Rest
    WatchModule,

    // Enable Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.databaseUri,
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    }),

    // Enable Graphql
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        debug: configService.isDevelopment,
        playground: true,
        tracing: true,

        installSubscriptionHandlers: true,
        autoSchemaFile: 'schema.gql'
      })
    })
  ]
})
export class AppModule {
}
