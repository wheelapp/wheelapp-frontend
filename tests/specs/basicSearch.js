const saveScreenshot = require('../lib/saveScreenshot');

describe('Wheelmap Search', function() {
  it('should open the main url and verify the title', async function() {
    // browser.url('https://feature-elasticsearch.wheelmap.tech/');
    // expect(browser).toHaveTitle('Wheelmap – Find wheelchair accessible places.');
    await browser.url('/');
    const title = await browser.getTitle();
    expect(title).toMatch(/Wheelmap – Find wheelchair accessible places./i);
  });

  it('should open the omnibar searchbar', async function() {
    const $dialog = await browser.$('section.modal-dialog');
    const $button = await browser.$('button=Okay, let’s go!');
    await $button.click();

    expect($dialog).not.toBeVisible();
    const $searchButton = await browser.$('.omnisearchbar-button');

    browser.acceptAlert();
    expect($searchButton).toBeVisible();
    await $searchButton.click();
    await saveScreenshot('omnibarIsOpen');
  });
});
