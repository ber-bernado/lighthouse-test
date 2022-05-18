const core = require('@actions/core')
const { resolve } = require('path')

exports.getInput = function getInputArgs() {
  const urls = interpolateProcessIntoUrls(getList('urls'))
  const configPath = core.getInput('configPath') ? resolve(core.getInput('configPath')) : null

  if (!urls) {
    core.setFailed(`Need either 'urls' in action parameters or a 'static_dist_dir' in lighthouserc file`)
    process.exit(1)
  }

  return {
    configPath,
    urls,
  }
}

/**
 * @param {string} arg
*/

function getList(arg, separator = '\n') {
  const input = core.getInput(arg)
  if (!input) return []
  return input.split(separator).map((url) => url.trim())
}

/**
 * @param {string[]} urls
 */

 function interpolateProcessIntoUrls(urls) {
  return urls.map((url) => {
    if (!url.includes('$')) return url
    Object.keys(process.env).forEach((key) => {
      if (url.includes(`${key}`)) {
        url = url.replace(`$${key}`, `${process.env[key]}`)
      }
    })
    return url
  })
}
