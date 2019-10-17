import * as fs from 'fs'
import * as path from 'path'
import { Controller, Get, Res, Req, Param, Logger } from '@nestjs/common'
import * as ffmpeg from 'fluent-ffmpeg'

import { ConfigService } from '../shared/config/config.service'
import { TorrentService } from '../shared/torrent/torrent.service'

@Controller()
export class WatchController {

  private readonly logger = new Logger(WatchController.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly torrentService: TorrentService
  ) {}

  @Get('watch/:_id')
  watch(
    @Param() params,
    @Res() res,
    @Req() req
  ) {
    this.logger.debug(`[${params._id}]: Watch`)
    const torrent = this.torrentService.torrents.find(torrent => torrent._id === params._id)

    // Get all the files for this item
    const files = fs.readdirSync(
      path.resolve(
        this.configService.get(ConfigService.DOWNLOAD_LOCATION),
        params._id
      )
    )

    // There are no files
    if (files.length === 0) {
      res.status(404)
      return res.send()
    }

    // Get the correct media file
    const mediaFile = files.reduce((previous, current, index) => {
      const formatIsSupported = !!this.torrentService.supportedFormats.find(format => current.includes(format))

      if (formatIsSupported) {
        if (current.length > previous.length) {
          return current
        }
      }

      return previous

    }, files[0])

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

    let streamOptions = null

    // If we have range then we need to start somewhere else
    if (req.headers.range) {
      const parts = req.headers.range
        .replace(/bytes=/, '')
        .split('-')

      const partialStart = parts[0]
      const partialEnd = parts[1]

      const start = parseInt(partialStart, 10)
      const end = partialEnd
        ? parseInt(partialEnd, 10)
        : mediaSize - 1

      const chunkSize = (end - start) + 1

      res.status(206)
      res.headers({
        'Content-Range': 'bytes ' + start + '-' + end + '/' + chunkSize,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      })

      streamOptions = {
        start: start,
        end: end
      }
    } else {
      // Return a stream from the media
      res.status(200)
      res.headers({
        'Content-Length': mediaSize,
        'Content-Type': 'video/mp4'
      })
    }

    const readStream = torrent
      ? torrent.file.createReadStream(streamOptions)
      : fs.createReadStream(mediaFileLocation, streamOptions)

    // Check if the device is chromecast
    const isChromeCast = req.query && req.query.device && req.query.device === 'chromecast'
    const forceTranscoding = req.query && !!req.query.transcode

    if (isChromeCast || forceTranscoding) {
      if (isChromeCast) {
        this.logger.debug(`[${params._id}]: Device is chromecast`)
      }

      if (forceTranscoding) {
        this.logger.debug(`[${params._id}]: Force transcoding`)
      }

      // Double check if it's needed
      ffmpeg.ffprobe(mediaFileLocation, (err, metadata) => {
        if (err) {
          // Send out normal response
          res.send(readStream)
        } else {
          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')

          this.logger.debug(`[${params._id}]: Stream metadata ${JSON.stringify(metadata)}`)

          // Thoughts: h264 && level = 31 does not work

          // Thoughts: h264 && profile = Main works

          // Thoughts: h264 && profile = High && ENCODER: 'Lavf58.31.101' works
          // Thoughts: h264 && profile = High && encoder: 'libebml v1.3.9 + libmatroska v1.5.2', works
          // Thoughts: h264 && profile = High && encoder: 'libebml v1.3.3 + libmatroska v1.4.4', works

          // Thoughts: h264 && profile = Main && encoder: 'libebml v1.3.6 + libmatroska v1.4.9', works
          // Thoughts: h264 && profile = High && encoder: 'libebml v1.3.6 + libmatroska v1.4.9', does not work

          // hevc vidoe never works

          // We need to transform it
          if (forceTranscoding && ['hevc'].includes(videoStream.codec_name)) {
            // Improve the output stream so Chromecast can play it
            res.send(
              ffmpeg(readStream)
                .format('matroska')
                .addOption('-movflags', 'faststart')
                .on('progress', progress => this.logger.debug(`[${params._id}]: ffmpeg processed until ${progress.timemark}`))
                .on('error', err => this.logger.error(`[${params._id}] ffmpeg threw "${err.message || err}"`))
                .pipe(null, { end: true })
            )

          } else {
            res.send(readStream)
          }
        }
      })

    } else {
      res.send(readStream)
    }
  }

}
