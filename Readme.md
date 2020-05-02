# styled-jsx-url-loader

[![Build Status](https://travis-ci.org/danielhusar/styled-jsx-url-loader.svg?branch=master)](https://travis-ci.org/danielhusar/styled-jsx-url-loader) [![npm version](https://badge.fury.io/js/styled-jsx-url-loader.svg)](https://www.npmjs.com/package/styled-jsx-url-loader)

Webpack loader to transform `url()` to es6 imports inside the css or sass when using [separate files to create styled-jsx styles](https://github.com/zeit/styled-jsx#styles-in-regular-css-files).\
This loader needs to be used together with styled-jsx/webpack loader.\
It's similar to what css-loader does, but css-loader is incompatible with styled-jsx/webpack loader.

## Installation

Using yarn:

```sh
yarn add styled-jsx-url-loader --dev
```

Or using npm:

```sh
npm install styled-jsx-url-loader --dev
```

## Configuration

This loader should be executed right after `styled-jsx/webpack` and before babel loader.\
Since loaders are executed from last to first, usage can be like this (with next.js):

```js
config.module.rules.push({
  test: /\.s?css$/,
  use: [
    options.defaultLoaders.babel,
    {
      loader: require.resolve('styled-jsx-url-loader'),
      options: {},
    },
    {
      loader: require('styled-jsx/webpack').loader,
      options: {
        type: 'scoped',
      },
    },
  ],
})
```

## Options

#### scss

Type: `Boolean`\
Default: `false`

Allow parsing scss code.\
(It will not transform scss to css, only allow parser to parse it)

#### exclude

Type: `String|RegExp`\
Default: `null`

Exclude urls from transformations.

#### debug

Type: `Boolean`\
Default: `false`

Print debug messages.

## Caveats

Sass variables inside the urls are not supported. Example: `background: url(${heroImage})`. If you need to transform them, transform your sass code first to plain css.

There is no source maps support. (PR welcome)

## License

MIT © [Daniel Husar](https://github.com/danielhusar)
