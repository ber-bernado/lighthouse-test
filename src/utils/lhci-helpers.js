const { join } = require('path')
const fs = require('fs').promises
const { existsSync } = require('fs')

/** @typedef {{ url: string, isRepresentativeRun: boolean, jsonPath: string, htmlPath: string, summary: {
                performance: number, accessibility: number, 'best-practices': number, seo: number, pwa: number} }} LHCIManifest */

/**
 * @param {string} resultsPath
*/

exports.getManifest = async function getManifest(resultsPath) {
  const manifestPath = join(resultsPath, 'manifest.json')
  if (!existsSync(manifestPath)) return null
  return /** @type {LHCIManifest[]} **/ (JSON.parse(await fs.readFile(manifestPath, 'utf8')))
}
