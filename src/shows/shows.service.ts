import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Show } from '@pct-org/mongo-models'

import { ShowsArgs } from './dto/shows.args'
import { ShowArgs } from './dto/show.args'

import { ContentService } from '../shared/content/content.service'

@Injectable()
export class ShowsService extends ContentService {

  constructor(
    @InjectModel('Shows') private readonly showModel: Model<Show>
  ) {
    super()
  }

  async findOne(showArgs: ShowArgs): Promise<Show> {
    return this.showModel.findById(
      showArgs._id
    )
  }

  async findAll(contentArgs: ShowsArgs): Promise<Show[]> {
    return this.showModel.find(
      this.getQuery(contentArgs),
      {},
      this.getOptions(contentArgs)
    )
  }

}
