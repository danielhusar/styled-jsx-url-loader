import path from 'path'
import compiler from '../helpers/compiler.js'

describe('Loader', () => {
  test('Replaces all urls in the css file', async () => {
    const stats = await compiler(path.join(__dirname, './fixtures/styles.css'))
    const output = stats.toJson().modules.slice(-1)[0].source
    expect(output).toMatchSnapshot()
  })

  test('Replaces all urls in the scss file', async () => {
    const stats = await compiler(path.join(__dirname, './fixtures/styles.scss'), { scss: true })
    const output = stats.toJson().modules.slice(-1)[0].source
    expect(output).toMatchSnapshot()
  })

  test('Exclude files', async () => {
    const stats = await compiler(path.join(__dirname, './fixtures/styles.css'), {
      exclude: /image\.png/,
    })
    const output = stats.toJson().modules.slice(-1)[0].source
    expect(output).toMatchSnapshot()
  })

  test('Show warning for invalid scss file', async () => {
    expect.assertions(1)
    console.warn = jest.fn()
    try {
      await compiler(path.join(__dirname, './fixtures/invalid.scss'), { scss: true, debug: true })
    } catch {
      expect(console.warn).toHaveBeenCalledWith(
        'styled-jsx-url-loader: Urls inside variables are not supported',
      )
      console.warn.mockReset()
    }
  })
})
