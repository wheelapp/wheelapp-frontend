// ['BROWSERSTACK_USERNAME', 'BROWSERSTACK_ACCESS_KEY', 'BROWSERSTACK_APP_ID']
//   .forEach(variableName => {
//     if (!process.env[variableName]) {
//       throw new Error(`Please define ${variableName} as environment variable.`);
//     }
//   });

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  updateJob: false,
  specs: [
    './test/specs/generateScreenshots.js'
  ],
  exclude: [],

  maxInstances: 10,
  commonCapabilities: {
    name: 'parallel_appium_test',
    build: 'webdriver-browserstack',
    app: process.env.BROWSERSTACK_APP_ID,
    'browserstack.debug': true
  },

  capabilities: [
    {
      "device": "iPhone 6S"
    },
    {
      "device": "iPhone 6"
    },
    {
      'device': 'iPhone 8',
    },
    {
      'device': 'iPhone X',
    },
    {
      'device': 'iPad 6th',
    },
  ],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './test/screenshots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 40000
  }
};

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps){
  for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});