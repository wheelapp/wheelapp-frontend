module.exports = async function sendInput(selector, inputString, keyIndex = 0) {
  await browser.addValue(selector, inputString.substr(keyIndex, 1));
  await browser.waitUntil(() => {
    const value = browser.getValue(selector);
    return value === inputString.substr(0, keyIndex + 1);
  });
  if (keyIndex < inputString.length) {
    return sendInput(selector, inputString, keyIndex + 1);
  }
};
