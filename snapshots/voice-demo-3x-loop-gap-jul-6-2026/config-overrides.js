const { addWebpackAlias, override } = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')
const path = require('path')

module.exports = override(
  addWebpackAlias({
    three$: path.resolve('./src/utils/three.js'),
    '../../../build/three.module.js': path.resolve('./src/utils/three.js')
  }),
  addReactRefresh()
)
