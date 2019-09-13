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

@Module({
  imports: [
    StatusModule,
    ModelsModule,
    ConfigModule,

    MoviesModule,
    ShowsModule,
    SeasonModule,
    BookmarksModule,

    // Enable Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.databaseUri,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }),
      inject: [ConfigService]
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
