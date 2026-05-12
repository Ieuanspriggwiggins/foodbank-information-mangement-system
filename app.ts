//Third-party dependencies
import express from 'express';
import dotenv from 'dotenv';
const ejs = require('ejs');
import path from 'path';

ejs.delimiter = '?';

dotenv.configDotenv();

//Internal dependencies
import adminRouter from './routes/Admin/admin';
import adminDashboardRouter from './routes/Admin/admin-dashboard';
import adminApiRouter from './routes/Admin/admin-api';

import {initDatabase} from "./datasource";
import websiteRoutes from "./routes/Website/website-routes";

const port = process.env.PORT || 8050;

const app = express();

app.set('view engine', 'ejs');

app.use('/admin', adminRouter);
app.use('/', websiteRoutes);


app.listen(port, () => {
    console.log('Server listening on port: ' + port);
    initDatabase()
});