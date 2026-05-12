import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');

import {renderAdminSetupPage as renderAdminSetup} from "../../controllers/Admin/AdminSetupControllers";
import {adminAuthenticate, doesAdminAccountExist, forceSetupComplete} from "../../middleware/Admin/middleware";
import {renderAdminLogin} from "../../controllers/Admin/AdminLoginControllers";

import adminDashboardRouter from './admin-dashboard';
import adminApiRouter from './admin-api';
import AdminLogoutController from "../../controllers/Admin/AdminLogoutController";

const router = express.Router();

router.use(express.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(cookieParser());

router.use(express.static(path.resolve('client-admin/public')));

router.use('/dashboard', adminDashboardRouter);
router.use('/api', adminApiRouter);


router.get('*', doesAdminAccountExist, forceSetupComplete);

router.get('/setup',
    renderAdminSetup
);

router.get(
    '/login',
    renderAdminLogin,
);

router.get('/', (req: any, res: any) => {
    res.redirect('/admin/dashboard');
});

router.post('/logout', AdminLogoutController)

export default router;