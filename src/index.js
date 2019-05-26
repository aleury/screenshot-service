const { json } = require("micro");
const ImageRenderer = require("./imageRenderer");

let imageRenderer;

(async () => {
  imageRenderer = await ImageRenderer.setup();
})();

process.once("SIGUSR2", async () => {
  await imageRenderer.tearDown();
});

const catchErrors = fn => async (req, res) => {
  try {
    const result = await fn(req);
    res.end(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = catchErrors(async req => {
  const conf = await json(req);
  return await imageRenderer.render(conf);
});
