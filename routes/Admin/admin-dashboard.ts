import express from 'express';
import {
    adminAuthenticate,
    doesAdminAccountExist,
    forceSetupComplete
} from '../../middleware/Admin/middleware';

import {renderDashboardHomepage} from "../../controllers/Admin/AdminDashboardHomepageController";
import {renderCreateOrderDashboardPage, renderOrdersDashboardPage, renderSpecificOrderDashboardPage} from "../../controllers/Admin/AdminDashboardOrdersController";
import {renderCreateFoodPackagePage, renderEditFoodPackageDashboardPage, renderFoodPackageDashboardPage, renderSpecificFoodPackageDashboardPage} from "../../controllers/Admin/AdminDashboardFoodPackageControllers";
import {renderCreateUsersDashboardPage, renderUsersPage, renderViewUsersDashboardPage} from "../../controllers/Admin/AdminDashboardUserController";
import {renderConfigurationDashboardPage} from "../../controllers/Admin/AdminDashboardConfigurationController";
import {
    renderDonationsDashboardPage,
    renderSpecificDonationDashboardPage
} from "../../controllers/Admin/AdminDashboardDonationsController";
import {renderContactTicketsDashboardPage, renderSpecificContactTicketsDashboardPage} from "../../controllers/Admin/AdminDashboardContactTicketsController";
import {renderAccountsDashboardPage, renderCreateAccountDashboardPage, renderSpecificAccountDashboardPage} from "../../controllers/Admin/AdminDashboardAccountController";

const router = express.Router();

router.use(adminAuthenticate);

router.get('*', doesAdminAccountExist, forceSetupComplete)

router.get('/', renderDashboardHomepage);
router.get('/orders', renderOrdersDashboardPage);
router.get('/orders/create', renderCreateOrderDashboardPage);
router.get('/orders/view/:orderId', renderSpecificOrderDashboardPage);
router.get('/food-packages', renderFoodPackageDashboardPage);
router.get('/food-packages/create',renderCreateFoodPackagePage);
router.get('/food-packages/view/:packageId', renderSpecificFoodPackageDashboardPage);
router.get('/food-packages/edit/:packageId', renderEditFoodPackageDashboardPage);
router.get('/users', renderUsersPage)
router.get('/users/create', renderCreateUsersDashboardPage);
router.get('/users/view/:userId', renderViewUsersDashboardPage);
router.get('/configuration', renderConfigurationDashboardPage);
router.get('/donations', renderDonationsDashboardPage);
router.get('/donations/view/:id', renderSpecificDonationDashboardPage)
router.get('/contact-tickets', renderContactTicketsDashboardPage);
router.get('/contact-tickets/view/:id', renderSpecificContactTicketsDashboardPage);
router.get('/accounts', renderAccountsDashboardPage);
router.get('/accounts/view/:accountId', renderSpecificAccountDashboardPage);
router.get('/accounts/create', renderCreateAccountDashboardPage);


export default router;