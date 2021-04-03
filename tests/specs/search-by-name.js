const IdPropertyName = 'element-6066-11e4-a52e-4f735466cecf';
const saveScreenshot = require('../lib/saveScreenshot');
const getCurrentUrl = require('../lib/getCurrentUrl');
const acceptLocationAlertOnMobilesIfPresent = require('../lib/acceptLocationAlertOnMobilesIfPresent');

// See the WebDriver API documentation for a list of possible actions.
// https://webdriver.io/docs/api.html
// https://github.com/webdriverio/expect-webdriverio/blob/HEAD/docs/API.md

// See the Mocha API for test structure: https://mochajs.org/

describe('Searching a place by name', function() {
  it('delivers results', async function() {
    await browser.url('/');

    await acceptLocationAlertOnMobilesIfPresent();

    const $button = await $('button=Okay, let’s go!');
    await $button.click();

    const { capabilities } = browser;

    const $searchButton = await $('.omnisearchbar-button');
    await $searchButton.waitForExist();
    await $searchButton.click();

    // const $search = await $('.bp3-input'); // may not work in chrome ?? 
    const $search = await (await (await $('.bp3-omnibar')).shadow$('.bp3-input-group')).shadow$('.bp3-input')
    await $search.addValue('bilderbuch');
    const $results = await $('.bp3-menu');
    expect($results).toBeVisible();
    const $result = await $results.$('header=Café Bilderbuch'); 
    await saveScreenshot('Search results are displayed');

    await $result.waitForClickable();
    await $result.click();
    
    const $filterPanel = await $('.toolbar[aria-label~="Bilderbuch"');
    
    const $placeName = await $filterPanel.$('h1*=Café Bilderbuch');
    expect($placeName).toBeVisibleInViewport();
    await browser.waitUntil(async () => (await getCurrentUrl()).match(/\/nodes\//));
    await saveScreenshot('After click on single search result');
    
    const $closeDialog = await $('[aria-label="Close"]');
    await $closeDialog.click();
    const $filter = await $('.filter-button');
    await $filter.click();
    await browser.waitUntil(async () => {
      const el = await browser.findElement('css selector', '[class^="CategoryMenu"]');
      return el && el[IdPropertyName];
    });
    await saveScreenshot('Category and accessibility filter is shown');

  });
});
