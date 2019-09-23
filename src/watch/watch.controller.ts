import * as fs from 'fs'
import * as path from 'path'
import { Controller, Get, Res, Req, Param } from '@nestjs/common'

import { ConfigService } from '../shared/config/config.service'
import { TorrentService } from '../shared/torrent/torrent.service'

@Controller()
export class WatchController {

  constructor(
    private readonly configService: ConfigService,
    private readonly torrentService: TorrentService,
  ) {}

  @Get('watch/:_id')
  watch(
    @Param() params,
    @Res() res,
    @Req() req
  ) {

    // Get the torrent file and use it as stream with createReadStream

    // Get all the files for this item
    const files = fs.readdirSync(
      path.resolve(
        this.configService.get(ConfigService.DOWNLOAD_LOCATION),
        params._id
      )
    )

    // Find a media file
    const mediaFile = files.find(file => file.indexOf('.mkv') > -1)

    // Return 404 if we did not find a media file
    if (!mediaFile) {
      res.status(404)
      return res.send()
    }

    // Get the full location of the media file
    const mediaFileLocation = path.resolve(
      this.configService.get(ConfigService.DOWNLOAD_LOCATION),
      params._id,
      mediaFile
    )

    const { size: mediaSize } = fs.statSync(mediaFileLocation)

    // If we have range then we need to start somewhere else
    if (req.headers.range) {
      const parts = req.headers.range.replace(/bytes=/, '').split('-')
      const partialStart = parts[0]
      const partialEnd = parts[1]

      const start = parseInt(partialStart, 10)
      const end = partialEnd ? parseInt(partialEnd, 10) : mediaSize - 1
      const chunkSize = (end - start) + 1

      res.status(206)
      res.headers({
        'Content-Range': 'bytes ' + start + '-' + end + '/' + chunkSize,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      })

      res.send(
        fs.createReadStream(mediaFileLocation, { start: start, end: end })
      )
    } else {
      // Return a stream from the media
      res.status(200)
      res.headers({
        'Content-Length': mediaSize,
        'Content-Type': 'video/mp4'
      })

      res.send(
        fs.createReadStream(mediaFileLocation)
      )
    }

  }

}
