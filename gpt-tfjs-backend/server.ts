import { readFile } from 'fs/promises';
import express from 'express';
import bodyParser from 'body-parser';
import expressip from 'express-ip';
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
  const benchmark = await readFile('./benchmark/losses-3-dummy.json', { encoding: 'utf-8' }) 
  res.json(JSON.parse(benchmark))
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('server is running on port', server.address().port);
});