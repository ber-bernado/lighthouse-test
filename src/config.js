const core = require('@actions/core')
const { loadRcFile } = require('@lhci/utils/src/lighthouserc')
const { resolve } = require('path')

exports.getInput = function getInputArgs() {
  // fallback to upload.serverBaseUrl + upload.token for previous API support
  const serverBaseUrl = core.getInput('serverBaseUrl') || core.getInput('upload.serverBaseUrl')
  const serverToken = core.getInput('serverToken') || core.getInput('upload.token')

  // Make sure we don't have LHCI xor API token
  if (!!serverBaseUrl != !!serverToken) {
    // Fail and exit
    core.setFailed(`Need both a LHCI server url and an API token.`)
    process.exit(1)
  }

  let urls = null

  // Inspect lighthouserc file for malformations
  const configPath = core.getInput('configPath') ? resolve(core.getInput('configPath')) : null
  if (configPath) {
    const rcFileObj = loadRcFile(configPath)
    const { ci } = rcFileObj
    const { collect } = ci
    if (!ci) {
      // Fail and exit
      core.setFailed(`Config missing top level 'ci' property`)
      process.exit(1)
    }

    // Check if we have a static-dist-dir
    if (collect && collect.url) {
      urls = collect.url
    }
  }

  // Get and interpolate URLs
  urls = urls || interpolateProcessIntoUrls(getList('urls'))

  // Make sure we have either urls or a static-dist-dir
  if (!urls) {
    // Fail and exit
    core.setFailed(`Need either 'urls' in action parameters or a 'static_dist_dir' in lighthouserc file`)
    process.exit(1)
  }

  return {
    urls
  }
}

/**
 * Wrapper for core.getInput for a list input.
 *
 * @param {string} arg
 */

function getList(arg, separator = '\n') {
  const input = core.getInput(arg)
  if (!input) return []
  return input.split(separator).map((url) => url.trim())
}

/**
 * Takes a set of URL strings and interpolates
 * any declared ENV vars into them
 *
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

/**
 * Check if the file under `configPath` has `assert` params set.
 *
 * @param {string | null} configPath
 */

 exports.hasAssertConfig = function hasAssertConfig(configPath) {
  if (!configPath) return false
  const rcFileObj = loadRcFile(configPath)
  return Boolean(get(rcFileObj, 'ci.assert'))
}
