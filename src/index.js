const { json } = require("micro");
const { Cluster } = require("puppeteer-cluster");

require("events").EventEmitter.defaultMaxListeners = 10;

const computeScrollHeight = async page => {
  const aHandle = await page.evaluateHandle(() => document.body);
  const scrollHeightHandle = await page.evaluateHandle(
    body => body.scrollHeight,
    aHandle
  );
  return await scrollHeightHandle.jsonValue();
};

let cluster;

(async () => {
  cluster = await Cluster.launch({
    maxConcurrency: 5,
    concurrency: Cluster.CONCURRENCY_BROWSER
  });

  await cluster.task(async ({ page, data: { html, width, height } }) => {
    await page.setContent(html);
    const scrollHeight = await computeScrollHeight(page);
    return await page.screenshot({
      encoding: "binary",
      clip: { x: 0, y: 0, width, height: height || scrollHeight }
    });
  });

  process.once("SIGUSR2", async () => {
    await cluster.idle();
    await cluster.close();
  });
})();

const catchErrors = fn => async (req, res) => {
  try {
    const result = await fn(req);
    res.end(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = catchErrors(async req => {
  const { html, ...rest } = await json(req);
  return await cluster.execute({
    ...rest,
    html: html.replace(/\\n/g, "").replace(/\\/g, "")
  });
});
