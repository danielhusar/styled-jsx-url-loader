// import { getOptions } from 'loader-utils'

// export default function loader(source) {
//   const options = getOptions(this)

//   source = source.replace(/\[name\]/g, options.name)

//   return `export default ${JSON.stringify(source)}`
// }

const { getOptions } = require('loader-utils')
const postcss = require('postcss')
const asyncReplace = require('async-replace-promise')
const isAbsoluteUrl = require('is-absolute-url')
const postcssSass = require('postcss-sass')
const postcssScss = require('postcss-scss')

module.exports = async function (content) {
  const callback = this.async()
  const options = getOptions(this)

  if (this.cacheable) this.cacheable()
  this.addDependency(this.resourcePath)

  let index = 0
  let imports = ''

  const replacer = postcss.plugin('postcss-styled-jsx-url-loader', () => {
    return (root) => {
      root.walkRules((rule) => {
        rule.walkDecls((decl) => {
          console.log(decl.value)

          decl.value = decl.value.replace(
            /(?:url(?:\s+)?)\((?:'|")?([^(|'|"]+)(?:'|")?\)/gi,
            (...args) => {
              let url = args[1]
              if (isAbsoluteUrl(url)) {
                return args[0]
              }
              if (url.match('postcssStyledJsxUrlLoader')) {
                return args[0]
              }
              if (options.debug && (options.sass || options.scss) && url.startsWith('$')) {
                console.warn('styled-jsx-url-loader: Urls inside variables are not supported')
              }
              if (!url.startsWith('.') && !url.startsWith('/')) {
                url = `./${url}`
              }
              this.addDependency(url)

              const name = `postcssStyledJsxUrlLoader_${index}`
              const nameAsVar = '${' + name + '}'
              imports = `${imports}\nimport ${name} from '${url}';`
              index++
              return `url("${nameAsVar}")`
            },
          )
        })
      })
    }
  })

  const postcssOptions = { map: false, from: this.resourcePath }
  if (options.sass) postcssOptions.syntax = postcssSass
  if (options.scss) postcssOptions.syntax = postcssScss

  const processed = await asyncReplace(content, /(?:css`)([^`]+)/gi, async (...args) => {
    const css = args[1]
    return new Promise((resolve, reject) => {
      postcss([replacer])
        .process(css, postcssOptions)
        .then((result) => resolve(`css\`${result.css}`))
    })
  })

  console.log(`${imports}\n${processed}`)

  callback(null, `${imports}\n${processed}`)
}
