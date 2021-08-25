var assert = require('assert')

/**
 * See: https://www.browserstack.com/docs/automate/selenium/getting-started/nodejs/webdriverio/local-testing
 */

// Before starting local set BROWSERSTACK_LOCAL to 1
// 

describe('BrowserStack Local Testing', function() {
  it('can check tunnel working', async function () {
    browser
      .url('http://bs-local.com:45691/check');
      await browser.url('/');
      const out = await browser.getPageSource();
      console.log(await out); 

      const body = await $('body=Up and running')
      
      const bodytext = await body.getText()
      console.log(await bodytext + " <<< the text") 
      
      const bodytag = await body.getTagName()
      console.log(await bodytag + " <<< the tag")
      
      assert(await bodytext.match(/Up and running/i));
  });
});

