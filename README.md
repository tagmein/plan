# Plan

Software to keep your life organized.

## Development

See `PORT` in `.env` file for the local development server port. The code is watched and will re-build automatically when there are changes. However, the app will not reload automatically in the browser, so a manual reload is required to see the changes.

```sh
npm install
npm start
```

## Build

To build Plan, install dependencies and run the build command. Artifacts will be created in the `client-dist` and `server-dist` directories.

```sh
npm install
npm run build
```

## Serve

See `PORT` in `.env` file to configure the server port.

```sh
node server-dist
```

## Contributing

Pull requests are welcomed. All contributions must be explicitly released into the public domain without copyright by the contributor, and must state as such in the pull request description. Contributions that do not explicitly abandon claim of copyright will be closed without merging.

## License

This source code is released into the public domain without claim of copyright, and may be used for any purpose, including commercial uses. No warranties are implied.
