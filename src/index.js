const core = require('@actions/core')
const { join } = require('path')
const childProcess = require('child_process')
const lhciCliPath = require.resolve('@lhci/cli/src/cli')
const { getInput } = require('./config')
const { setOutput } = require('./utils/output')

async function main() {
  core.startGroup('Action config')
  const resultsPath = join(process.cwd(), '.lighthouseci')
  const input = getInput()
  core.info(`Input args: ${JSON.stringify(input, null, '  ')}`)
  core.endGroup() // Action config

  /******************************* 1. COLLECT ***********************************/
  core.startGroup(`Collecting`)
  const collectArgs = [`--numberOfRuns=1`]

  if (input.urls) {
    for (const url of input.urls) {
      collectArgs.push(`--url=${url}`)
    }
  } 
  const collectStatus = runChildCommand('collect', collectArgs)
  if (collectStatus !== 0) throw new Error(`LHCI 'collect' has encountered a problem.`)

  const uploadStatus = runChildCommand('upload', ['--target=filesystem', `--outputDir=${resultsPath}`])
  if (uploadStatus !== 0) throw new Error(`LHCI 'upload' failed to upload to fylesystem.`)

  core.info(`result: ${JSON.stringify(resultsPath, null, '  ')}`)

  core.endGroup() // Collecting

  await setOutput(resultsPath)
}

// run `main()`

main()
  .catch((err) => core.setFailed(err.message))
  .then(() => core.debug(`done in ${process.uptime()}s`))

/**
 * Run a child command synchronously.
 *
 * @param {'collect'|'assert'|'upload'} command
 * @param {string[]} [args]
 * @return {number}
 */

function runChildCommand(command, args = []) {
  const combinedArgs = [lhciCliPath, command, ...args]
  const { status = -1 } = childProcess.spawnSync(process.argv[0], combinedArgs, {
    stdio: 'inherit',
  })
  return status || 0
}
