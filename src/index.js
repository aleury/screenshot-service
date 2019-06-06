const { json, send } = require("micro");
const { Cluster } = require("puppeteer-cluster");
const renderHTMLToPNG = require("./render");

require("events").EventEmitter.defaultMaxListeners = 10;

let cluster;

(async () => {
  cluster = await Cluster.launch({
    maxConcurrency: 5,
    concurrency: Cluster.CONCURRENCY_BROWSER
  });

  await cluster.task(renderHTMLToPNG);

  process.once("SIGUSR2", async () => {
    await cluster.idle();
    await cluster.close();
  });
})();

const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req);
  } catch (err) {
    console.error(err.stack);
    send(res, 500, "An error occurred.");
  }
};

module.exports = handleErrors(async req => {
  const { html, ...rest } = await json(req);
  return await cluster.execute({
    ...rest,
    html: html.replace(/\\n/g, "").replace(/\\/g, "")
  });
});
