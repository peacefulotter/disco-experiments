const { readFile } = require('fs/promises')
const express = require('express');
const bodyParser = require('body-parser');
const expressip = require('express-ip');
const { getDataset } = require('./dataset');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressip().getIpInfoMiddleware);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.use('/api', async (req, res) => {  
  const dataset = await getDataset('./openwebtext')
  console.log(dataset);
  const losses = await readFile('./losses-3-dummy.json') 
  res.json(JSON.parse(losses))
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('server is running on port', server.address().port);
});