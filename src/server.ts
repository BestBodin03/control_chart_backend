import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRouter from './routes/apis'
import  connectMongoDB, { chooseMongoCollection } from './databases/mongoDb';
import { API_V1_PREFIX } from './config/constans';
import { furnaceMaterialCacheService } from './services/furnaceMaterialCacheService';


const app = express();
const router = express.Router();
const port = 14000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit: '150mb',
  extended: true
}));
app.use(cors());
app.use('/', apiRouter);

connectMongoDB();
furnaceMaterialCacheService.init();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}${API_V1_PREFIX}`);
});