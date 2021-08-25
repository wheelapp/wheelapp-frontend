const saveScreenshot = require('../lib/saveScreenshot');

describe('Nearby-button', () => {
  it('clicks on nearby button', async () => {
    await browser.url('/');

    const $dialog = await browser.$('section.modal-dialog');
    const $button = await browser.$('button=Okay, let’s go!');
    await $button.click();

    expect($dialog).not.toBeVisible();
    const $searchButton = await browser.$('.omnisearchbar-button');

    expect($searchButton).toBeVisible();
    await $searchButton.click();
    await saveScreenshot('omnibarIsOpen');
  });
});
