import express from 'express';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { router as router } from './src/form.js';
dotenv.config();

const app = express();

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, './public')));
app.use(express.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(router);

function errorHandling(err, req, res, next) {
  console.log(err);
  res.send('error');
}

app.use(errorHandling);

const {
  PORT: port = 3000
} = process.env;

app.listen(port, () => {
  console.info(`App running on http://localhost:${port}`);
});