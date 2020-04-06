// Dependencies
const Router = require('@koa/router');
const router = new Router();
const { Client } = require('pg');

// Database connection

const URL = 'postgres://postgres:postgres@localhost:5432/postgres';
const client = new Client(URL);

(async () => {
  try {
    await client.connect();
  } catch (err) {}
})();

// Declarations

router.get('/search/:keyword', async (ctx) => {
  var keyword = ctx.request.url.substring(8);
  keyword = keyword.split('%20').join(' ').split(`'`).join(`''`);
  console.log(keyword);

  try {
    // Timer start
    let start = process.hrtime.bigint();

    const data = await client.query(
      `SELECT * FROM data WHERE data @> '{"collections": ["${keyword}"]}' OR data->>'type' LIKE '%${keyword}%' LIMIT 50;`
    );

    const dataSet = [];

    for (var item of data.rows) {
      dataSet.push(item.data);
    }

    // Reponse back to client
    ctx.body = dataSet;

    // Timer end
    let end = process.hrtime.bigint();
    console.log(
      `Finished in: ${(parseInt(end - start, 10) / 1e6).toFixed(2)} ms`
    );
  } catch (err) {
    ctx.body = err;
  }
});

module.exports = router;