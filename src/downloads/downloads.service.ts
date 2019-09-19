import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Episode, Movie, Download } from '@pct-org/mongo-models'

import { DownloadsArgs } from './dto/downloads.args'
import { DownloadArgs } from './dto/download.args'
import { NewDownloadInput } from './dto/new-download.input'
import { TorrentService } from '../shared/services/torrent.service'

@Injectable()
export class DownloadsService {

  constructor(
    @InjectModel('Movies') private readonly movieModel: Model<Movie>,
    @InjectModel('Episodes') private readonly episodeModel: Model<Episode>,
    @InjectModel('Downloads') private readonly downloadModel: Model<Download>
  ) {}

  async addOne(newDownloadData: NewDownloadInput): Promise<Download> {
    return new this.downloadModel({
      ...newDownloadData,
      status: TorrentService.STATUS_QUEUED,
      progress: 0,
      createdAt: Number(new Date()),
      updatedAt: Number(new Date())
    }).save()
  }

  async findOne(downloadArgs: DownloadArgs): Promise<Download> {
    return this.downloadModel.findById(
      downloadArgs._id
    )
  }

  async findAll(downloadsArgs: DownloadsArgs): Promise<Download[]> {
    return this.downloadModel.find(
      {},
      {},
      {
        skip: downloadsArgs.offset,
        limit: downloadsArgs.limit
      }
    )
  }

  async getMovie(_id: string): Promise<Movie> {
    return this.movieModel.findById(
      _id
    )
  }

  async getEpisode(_id: string): Promise<Episode> {
    return this.episodeModel.findById(
      _id
    )
  }

}
