import { Torrent, TorrentFile } from 'webtorrent'

export interface TorrentInterface {

  _id: string

  torrent: Torrent

  file: TorrentFile

}
