const core = require('@actions/core')
const { getManifest } = require('./lhci-helpers')

/**
 * @param {string} resultsPath
*/

exports.setOutput = async function setOutput(resultsPath) {
  const manifestResults = await getManifest(resultsPath)

  core.setOutput('resultsPath', resultsPath)
  core.setOutput('manifest', manifestResults ? JSON.stringify(manifestResults) : '')
}
