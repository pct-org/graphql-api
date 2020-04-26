## [0.6.2](https://github.com/pct-org/graphql-api/compare/v0.6.1...v0.6.2) (2020-04-26)



## [0.6.1](https://github.com/pct-org/graphql-api/compare/v0.6.0...v0.6.1) (2020-04-26)


### Bug Fixes

* Fixed downloadQuality not being filled ([ca55528](https://github.com/pct-org/graphql-api/commit/ca555282cba1f0fcf7f5e606e5473ae1f8198bbb))



# [0.6.0](https://github.com/pct-org/graphql-api/compare/2c8b7e5af08af2c04c30f15f6a1d5e3f7c1be343...v0.6.0) (2020-04-26)


### Bug Fixes

* Correctly cleanup after streaming ([6aa9fc7](https://github.com/pct-org/graphql-api/commit/6aa9fc7fe1695cd871bd9749563f13d408ab9d20))
* Do less updates ([be6b92f](https://github.com/pct-org/graphql-api/commit/be6b92fbae22f2f17911eed9daea86c2ff5d9e59))
* Don't show my episodes when they don't have any torrents ([1ec1f7a](https://github.com/pct-org/graphql-api/commit/1ec1f7aa086c4ad145717846643f8ea05467a0fb))
* Fixed error with useFindAndModify not being set ([e02ff84](https://github.com/pct-org/graphql-api/commit/e02ff84d014e36ed1ed149a4901d1b57b381b81a))
* Fixed linting ([668224b](https://github.com/pct-org/graphql-api/commit/668224b22cac84328444e988476631aa4cf13bfb))
* Fixed non aired my episodes where returned ([b8301fc](https://github.com/pct-org/graphql-api/commit/b8301fc5d5dc0fff97f258a6c6d7dd679cb5057e))
* Fixed postinstall script missing ([6a3d950](https://github.com/pct-org/graphql-api/commit/6a3d9507e2a5bfc4802f4dd402a585ae4ede3f97))
* Fixed that one episode could not be found ([440b300](https://github.com/pct-org/graphql-api/commit/440b300e382be2cefaae44c15e39eeb4a617b90d))
* Fixes for downloads not cleaningup correctly ([c8e2b99](https://github.com/pct-org/graphql-api/commit/c8e2b99a7d6955f41574659d310b10dda568bc47))
* Fixes for the watch controller ([db46599](https://github.com/pct-org/graphql-api/commit/db46599ab2f909a1bd508230d77e0ea1cda35b6e))
* Fixes for watching ([8827850](https://github.com/pct-org/graphql-api/commit/88278506e49cdd654db86e5dd27c6df2c3628b4c))
* If download already exists return that one ([0129afd](https://github.com/pct-org/graphql-api/commit/0129afdbcc047f7926e6ce5e195210032c48aa62))
* Improved ffmpeg and added debug logger ([b9a8023](https://github.com/pct-org/graphql-api/commit/b9a8023145134d281da638977a88ed60335acbc0))
* Moved the log for download removed to the correct place ([70ba60e](https://github.com/pct-org/graphql-api/commit/70ba60e62bfe74f55eaff2d2cdde1347ff123259))
* Only start download if it's not complete ([e5da307](https://github.com/pct-org/graphql-api/commit/e5da30798fe491f5a4885c49e317c57e4b946eef))
* Prevent updating the download model twice at the same time ([a99205a](https://github.com/pct-org/graphql-api/commit/a99205a7edd7f4453724cd504bdf58f191908318))
* Properly handle already downloading items and fix start stream ([404331c](https://github.com/pct-org/graphql-api/commit/404331ce1cdebe9ce206f18be83648787563f65c))
* Reanable the start downloads ([6fbcb7b](https://github.com/pct-org/graphql-api/commit/6fbcb7be94f5b6933579d90a0ce723de38f34392))
* Small fixes for the getting started ([c1b9cd7](https://github.com/pct-org/graphql-api/commit/c1b9cd72bef7c036c657d3d874a332eb0c68f289))
* Try catch added to saving items ([f14f895](https://github.com/pct-org/graphql-api/commit/f14f89558c1fb7fd462f0d98e83d0b4a8698d5b1))


### Features

* Added cleanup if stream is stopped ([2de8f3a](https://github.com/pct-org/graphql-api/commit/2de8f3a2acf854f40ed00163cbcf264b3f3cb356))
* Added first part for movies ([2c8b7e5](https://github.com/pct-org/graphql-api/commit/2c8b7e5af08af2c04c30f15f6a1d5e3f7c1be343))
* Added MyEpisodes ([9d1c502](https://github.com/pct-org/graphql-api/commit/9d1c502ba71b85699f374ee1a40ad1325bd065b3))
* Added removeDownload ([83aaa13](https://github.com/pct-org/graphql-api/commit/83aaa1354ff3bcabcfa81e3481d2865a41d86bac))
* Added show and movie methods ([fda4194](https://github.com/pct-org/graphql-api/commit/fda41944c8ed0d736a5de0fbcc85d2883e2af8d1))
* Added shows ([bb3f3a3](https://github.com/pct-org/graphql-api/commit/bb3f3a3da10a6290d9ee8f6f6d626e862420324d))
* Added startStream ([8f9e23f](https://github.com/pct-org/graphql-api/commit/8f9e23fefd995a5762ed6c394a2a4b496ec8ddb9))
* Added status of the scraper ([4e8e302](https://github.com/pct-org/graphql-api/commit/4e8e30247d45cc1b7d84a2c61d58129a8b29b6d9))
* Added subscription for bookmarks ([fcfaacd](https://github.com/pct-org/graphql-api/commit/fcfaacd91828ad4c0b39a52de97009e1823234a2))
* Added watch controller that will be in charge of handeling videos ([38a96cb](https://github.com/pct-org/graphql-api/commit/38a96cb821e4ea6a6d4780cd2549bd7d30b3e3c9))
* Always have debug enabled ([d3d4aad](https://github.com/pct-org/graphql-api/commit/d3d4aad1eebcb9f1a3644a247406088a9833534b))
* Changed default port and added status controller ([07d86ab](https://github.com/pct-org/graphql-api/commit/07d86ab14e9db665655f8a23f5d11509ee7c3020))
* If torrent is still ongoing then serve that one in /watch ([004ac9d](https://github.com/pct-org/graphql-api/commit/004ac9d642dc6747d658d4d95d0e4d66645221d6))
* Improved cleanup and downloads service ([43a4dfe](https://github.com/pct-org/graphql-api/commit/43a4dfe46d8551488529ce776eaed2b11d8f796d))
* Improved torrent service ([e9374da](https://github.com/pct-org/graphql-api/commit/e9374daef801485e2ad53798d00ca46d5f3d23e6))
* Made movies searchable ([dddb223](https://github.com/pct-org/graphql-api/commit/dddb223d80109479b27d98f17cc8f1c68665fc4b))
* Multiple new features :tada: ([41a1276](https://github.com/pct-org/graphql-api/commit/41a1276374e007dcaf50d43b31402bd834795f82))
* Remove torrent when there are no peers ([9bc71a5](https://github.com/pct-org/graphql-api/commit/9bc71a5142980de39e030fdd00001eb90febaf4d))
* Started on downloader ([460d50b](https://github.com/pct-org/graphql-api/commit/460d50b72e685fc698d1bb7ef024a57ae7556930))
* Watch now transcodeds videos for chromecast ([2e6a268](https://github.com/pct-org/graphql-api/commit/2e6a268d66297d2789c752ed4ee288480ee70e2b))


### Performance Improvements

* Improved speed fetching episodes ([ed43aab](https://github.com/pct-org/graphql-api/commit/ed43aab408068fe80c9d888cde8f0547f8ce9f2f))



