const core = require('@actions/core')
const { loadRcFile } = require('@lhci/utils/src/lighthouserc')
const { resolve } = require('path')

exports.getInput = function getInputArgs() {
  let urls = null

  const configPath = core.getInput('configPath') ? resolve(core.getInput('configPath')) : null
  if (configPath) {
    const rcFileObj = loadRcFile(configPath)
    const { ci } = rcFileObj
    const { collect } = ci
    if (!ci) {
      core.setFailed(`Config missing top level 'ci' property`)
      process.exit(1)
    }

    if (collect && collect.url) {
      urls = collect.url
    }
  }

  urls = urls || interpolateProcessIntoUrls(getList('urls'))

  if (!urls) {
    core.setFailed(`Need either 'urls' in action parameters or a 'static_dist_dir' in lighthouserc file`)
    process.exit(1)
  }

  return {
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
