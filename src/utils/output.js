const core = require('@actions/core')
const { getManifest, getAssertionResults } = require('./lhci-helpers')

/**
 * @param {string} resultsPath
*/

exports.setOutput = async function setOutput(resultsPath) {
  const manifestResults = await getManifest(resultsPath)
  const assertionResults = await getAssertionResults(resultsPath)

  core.setOutput('resultsPath', resultsPath)
  core.setOutput('assertionResults', assertionResults ? JSON.stringify(assertionResults) : '')
  core.setOutput('manifest', manifestResults ? JSON.stringify(manifestResults) : '')
}
