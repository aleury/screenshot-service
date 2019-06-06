const computeScrollHeight = async page => {
  const aHandle = await page.evaluateHandle(() => document.body);
  const scrollHeightHandle = await page.evaluateHandle(
    body => body.scrollHeight,
    aHandle
  );
  return await scrollHeightHandle.jsonValue();
};

const renderHTMLToPNG = async ({ page, data: { html, width, height } }) => {
  await page.setContent(html);
  const scrollHeight = await computeScrollHeight(page);
  return await page.screenshot({
    encoding: "binary",
    clip: { x: 0, y: 0, width, height: height || scrollHeight }
  });
};

module.exports = renderHTMLToPNG;
