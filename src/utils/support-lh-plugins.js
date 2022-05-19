const isWindows = require('is-windows')()
const { join } = require('path')

const nodePathDelim = isWindows ? ';' : ':'
const nodePathParts = [
  ...(process.env.NODE_PATH || '').split(nodePathDelim),
  join(__dirname, '../../node_modules'),
  process.env.GITHUB_WORKSPACE ? join(process.env.GITHUB_WORKSPACE, '/node_modules') : null,
].filter(Boolean)
process.env.NODE_PATH = nodePathParts.join(nodePathDelim)
