// Checkout https://github.com/thomasdondorf/puppeteer-cluster
// for Chromium instance pooling.
const puppeteer = require("puppeteer");

class ImageRenderer {
  static async setup() {
    const browser = await puppeteer.launch();
    return new ImageRenderer(browser);
  }

  constructor(browser) {
    this.browser = browser;
  }

  async computeScrollHeight(page) {
    const aHandle = await page.evaluateHandle(() => document.body);
    const scrollHeightHandle = await page.evaluateHandle(
      body => body.scrollHeight,
      aHandle
    );
    return await scrollHeightHandle.jsonValue();
  }

  async render({ html, width, height }) {
    const page = await this.browser.newPage();

    const content = html.replace(/\\n/g, "").replace(/\\/g, "");
    await page.setContent(content);
    const scrollHeight = await this.computeScrollHeight(page);

    const imageData = await page.screenshot({
      encoding: "binary",
      clip: { x: 0, y: 0, width, height: height || scrollHeight }
    });
    return imageData;
  }

  async tearDown() {
    await this.browser.close();
  }
}

module.exports = ImageRenderer;
