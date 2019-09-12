import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { MongooseModule } from '@nestjs/mongoose'

import { ConfigModule } from './config/config.module'
import { ConfigService } from './config/config.service'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { MoviesModule } from './movies/movies.module'

@Module({
  imports: [
    MoviesModule,

    // Enable
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
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
