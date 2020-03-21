const loadGlobalEnvironment = require('@sozialhelden/twelve-factor-dotenv/dist/cjs')
  .loadGlobalEnvironment;
const env = loadGlobalEnvironment();
module.exports = env;
