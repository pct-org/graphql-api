import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { movieSchema } from '@pct-org/mongo-models/dist/movie/movie.schema'

import { MoviesResolver } from './movies.resolver'
import { MoviesService } from './movies.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Movies', schema: movieSchema }])],
  providers: [MoviesResolver, MoviesService]
})
export class MoviesModule {
}
