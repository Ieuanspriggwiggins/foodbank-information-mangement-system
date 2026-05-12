import express from 'express';
import validator from '../../validation';
import methodOverride from 'method-override';
import { adminLoginController } from '../../controllers/Admin/AdminLoginControllers';
import {adminAuthenticate, administratorAccessOnly, doesAdminAccountExist} from '../../middleware/Admin/middleware';
import { setupAdminAccountPost } from '../../controllers/Admin/AdminSetupControllers';
import {createFoodPackageController, deleteFoodPackageController, updateFoodPackageController} from "../../controllers/Admin/AdminDashboardFoodPackageControllers";
import {createNewStaffAccount, deleteStaffAccount, updateStaffAccount} from '../../controllers/Admin/AdminDashboardAccountController';
import {createNewServiceUser, deleteServiceUser, updateServiceUser} from "../../controllers/Admin/AdminDashboardUserController";
import {createNewOrder, updateExistingOrderStatus} from "../../controllers/Admin/AdminDashboardOrdersController";
import {addNewRequiredFoodItem, removeRequiredFoodItem} from "../../controllers/Admin/AdminDashboardRequiredFoodItemController";
import {addNewLocation, deleteExistingLocation} from "../../controllers/Admin/AdminDashboardLocationController";
import {AdminDataController, adminDataControllerGetAll} from "../../controllers/Admin/AdminDataController";

const router = express.Router();
router.use(express.json());
router.use(methodOverride('_method'));

/**
 * Post requests sent to the admin/login route.
 */
router.post(
    '/login',
    validator.validateEmailInput('email'),
    validator.validatePasswordInput('password'),
    adminLoginController
)

/**
 * Post requests sent to admin/setup-account route. Will not work once an initial account has
 * been created on the system.
 */
router.post(
    '/setup-account',
    doesAdminAccountExist,
    validator.validateEmailInput('email_input'),
    validator.validateTextInput('name_input'),
    validator.validatePasswordInput('password_input'),
    validator.validatePasswordInput('password_confirm_input'),
    setupAdminAccountPost
);

router.post(
    '/admin-account', 
    adminAuthenticate, 
    administratorAccessOnly,
    validator.validateTextInput('input-fullname'),
    validator.validateEmailInput('input-email'),
    validator.validatePasswordInput('input-password'),
    validator.validatePasswordInput('input-passwordConfirm'),
    createNewStaffAccount
);

router.put(
    '/admin-account',
    administratorAccessOnly,
    validator.validateTextInput('account-id'),
    validator.validateTextInput('input-name'),
    validator.validateEmailInput('input-email'),
    validator.validatePasswordInput('input-password'),
    validator.validatePasswordInput('input-passwordConfirm'),
    validator.validateTextInput('input-role'),
    updateStaffAccount
)

/**
 * Route to delete a staff account from the system.
 */
router.delete('/admin-account',
    adminAuthenticate,
    administratorAccessOnly,
    validator.validateTextInput('id'),
    deleteStaffAccount
);

/**
 * Handles requests to create food packages on the website
 */
router.post('/food-package',
    adminAuthenticate, //check if the account is logged in. //TODO: add validation
    validator.validateTextInput('food-package-name'),
    validator.validateTextInput('food-package-information'),
    validator.validateTextInput('food-package-contents'),
    validator.validateTextInput('dairy-free-check'),
    validator.validateTextInput('nut-free-check'),
    validator.validateTextInput('gluten-free-check'),
    validator.validateTextInput('vegan-check'),
    validator.validateTextInput('vegetarian-check'),
    validator.validateTextInput('pescatarian-check'),
    validator.validateTextInput('fish-free-check'),
    validator.validateTextInput('halal-check'),
    createFoodPackageController
);

router.delete('/food-package',
    adminAuthenticate,
    validator.validateTextInput('id'),
    deleteFoodPackageController
);

router.put('/food-package',
    adminAuthenticate,
    validator.validateNumberInput('food-package-id'),
    validator.validateTextInput('food-package-name'),
    validator.validateTextInput('food-package-information'),
    validator.validateTextInput('food-package-contents'),
    validator.validateTextInput('dairy-free-check'),
    validator.validateTextInput('nut-free-check'),
    validator.validateTextInput('gluten-free-check'),
    validator.validateTextInput('vegan-check'),
    validator.validateTextInput('vegetarian-check'),
    validator.validateTextInput('pescatarian-check'),
    validator.validateTextInput('fish-free-check'),
    validator.validateTextInput('halal-check'),
    validator.validateTextInput('food-package-status'),
    updateFoodPackageController
)

/**
 * Handle requests for users
 */
router.post('/users',
    adminAuthenticate,
    validator.validateTextInput('firstname-input'),
    validator.validateTextInput('surname-input'),
    validator.validateEmailInput('email-input'),
    validator.validateTextInput('postcode-input'),
    validator.validateTextInput('address-input'),
    validator.validateTextInput('phone-input'),
    createNewServiceUser
)

router.post('/orders',
    adminAuthenticate,
    validator.validateTextInput('food-package-selected'),
    validator.validateTextInput('user-selected'),
    validator.validateTextInput('order-type'),
    createNewOrder
)

router.put('/orders',
    adminAuthenticate,
    validator.validateTextInput('order-id'),
    validator.validateTextInput('order-status'),
    updateExistingOrderStatus
)

router.delete('/users',
    adminAuthenticate,
    administratorAccessOnly,
    validator.validateTextInput('id'),
    deleteServiceUser
)

router.put('/users',
    adminAuthenticate,
    validator.validateTextInput('input-firstname'),
    validator.validateTextInput('input-surname'),
    validator.validateEmailInput('input-email'),
    validator.validateTextInput('input-phone'),
    validator.validateTextInput('input-postcode'),
    validator.validateTextInput('input-address'),
    validator.validateTextInput('user-id'),
    updateServiceUser
)

router.post('/required_item',
    adminAuthenticate,
    validator.validateTextInput('new_item_input'),
    addNewRequiredFoodItem
)

router.get('/required_item/delete/:itemId', adminAuthenticate, removeRequiredFoodItem)


router.post('/location',
    adminAuthenticate,
    administratorAccessOnly,
    addNewLocation,
)

router.get('/location/remove/:locationId',
    adminAuthenticate,
    administratorAccessOnly,
    deleteExistingLocation
)

router.post('/admin-data/:data_type',
    adminAuthenticate,
    AdminDataController
)

router.post('/data/all/:data_type',
    adminAuthenticate,
    adminDataControllerGetAll,
)


export default router;