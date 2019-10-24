<h1 align="center">
  <img height="200" width="200" src="https://github.com/pct-org/getting-started/blob/master/.github/logo.png" alt="logo" />
  <br />
  GraphQL API
</h1>

<div align="center">
  <a target="_blank" href="https://gitter.im/pct-org/Lobby">
    <img src="https://badges.gitter.im/popcorn-time-desktop.svg" alt="Gitter" />
  </a>
  <a target="_blank" href="https://david-dm.org/pct-org/graphql-api" title="dependencies status">
    <img src="https://david-dm.org/pct-org/graphql-api/status.svg" />
  </a>
  <a target="_blank" href="https://david-dm.org/pct-org/graphql-api?type=dev" title="devDependencies status">
    <img src="https://david-dm.org/pct-org/graphql-api/dev-status.svg" />
  </a>
    <a target="_blank" href="https://github.com/pct-org/graphql-api/pulls">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
    </a>
</div>

---

## Projects

Popcorn Time consists of several projects, each doing it's own part.

| Project                      | Description |
| ---------------------------- | -------------------------------------------------------- |
| [`@pct-org/graphql-api`]     | Serves the data to the clients from the MongoDB database |
| [`@pct-org/getting-started`] | Explains how to get started with this setup              |
| [`@pct-org/mongo-models`]    | Models used for MongoDB and GraphQL object types         |
| [`@pct-org/native-app`]      | React Native App                                         |
| [`@pct-org/scraper`]         | Scrapes everything and saves it to MongoDB database      |

## Installation

```bash
$ yarn install
```

## Running the API

**Requirements**
- Make sure MongoDB is running, for Mac users see [`@pct-org/getting-started`] repo for the docker-compose file.
- Copy the `.env.example` file and fill it in
- If you want transcoding support make sure you have [ffmpeg](https://www.ffmpeg.org/download.html) installed

### Development
```bash
$ yarn build:watch

# Also run this in a different terminal tab
$ yarn start:watch
```

### Production

```bash
$ yarn build
$ yarn start
```

## [License](./LICENSE)

This project is [MIT licensed](./LICENSE).

## Contributing:

Please see the [contributing guide].

## Issues

File a issues against [pct-org/getting-started prefixed with \[graphql-api\]](https://github.com/pct-org/getting-started/issues/new?title=[graphql-api]%20).

[contributing guide]: ./CONTRIBUTING.md
[`@pct-org/graphql-api`]: https://github.com/pct-org/graphql-api
[`@pct-org/getting-started`]: https://github.com/pct-org/getting-started
[`@pct-org/mongo-models`]: https://github.com/pct-org/mongo-models
[`@pct-org/native-app`]: https://github.com/pct-org/native-app
[`@pct-org/scraper`]: https://github.com/pct-org/scraper
