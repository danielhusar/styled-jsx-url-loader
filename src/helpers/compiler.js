import path from 'path'
import webpack from 'webpack'
import { createFsFromVolume, Volume } from 'memfs'

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [
            {
              loader: path.resolve(__dirname, '../loader.js'),
              options,
            },
            {
              loader: require('styled-jsx/webpack').loader,
              options: {
                type: 'scoped',
              },
            },
          ],
        },
      ],
    },
  })

  const volume = createFsFromVolume(new Volume())
  volume.join = path.join
  compiler.outputFileSystem = volume

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors))
      resolve(stats)
    })
  })
}
