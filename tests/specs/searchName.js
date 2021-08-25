describe('Wheelmap Name Search', function() {
  it('should open the main url and verify the title', () => {
    browser.url('https://feature-elasticsearch.wheelmap.tech/');
    expect(browser).toHaveTitle('Wheelmap – Find wheelchair accessible places.');
  });
});
