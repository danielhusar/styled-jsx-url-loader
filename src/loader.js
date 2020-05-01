const { getOptions } = require('loader-utils')
const postcss = require('postcss')
const asyncReplace = require('async-replace-promise')
const isAbsoluteUrl = require('is-absolute-url')
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
              if (options.exclude && url.match(options.exclude)) {
                return args[0]
              }
              if (options.debug) {
                if (options.scss && url.startsWith('$')) {
                  console.warn('styled-jsx-url-loader: Urls inside variables are not supported')
                } else {
                  console.log(`styled-jsx-url-loader: Found ${url}`)
                }
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
  if (options.scss) postcssOptions.syntax = postcssScss

  const processed = await asyncReplace(
    content,
    /(?:css(?:\.global)?`)([^`]+)/gi,
    async (...args) => {
      const tag = args[0].split('`')[0]
      const css = args[1]
      return new Promise((resolve, reject) => {
        postcss([replacer])
          .process(css, postcssOptions)
          .then((result) => resolve(`${tag}\`${result.css}`))
      })
    },
  )

  callback(null, `${imports}\n${processed}`)
}
