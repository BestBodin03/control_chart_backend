import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import apiRouter from './routes/apis';
import connectMongoDB from './databases/mongoDb';
import { API_V1_PREFIX } from './config/constans';
import { furnaceMaterialCacheService } from './services/furnaceMaterialCacheService';
import { startDailyJobScheduler } from './services/cron/cronJob';

const app = express();
const port = 14000;

app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/', apiRouter);

(async () => {
  await connectMongoDB();

  furnaceMaterialCacheService.init();

  await startDailyJobScheduler();     

  app.listen(port, () => {
    console.log(`Server listening: http://localhost:${port}${API_V1_PREFIX}`);
  });
})();
