import express from 'express';
import path from 'path';
import bodyParser from "body-parser";
import {RenderHomepage} from "../../controllers/Website/HomepageController";
import {Render404Page} from "../../controllers/Website/PageNotFoundController";
import {loginRequestController, RenderLoginPage} from "../../controllers/Website/LoginController";
import {RegisterUserAccount, RenderRegisterPage} from "../../controllers/Website/RegisterController";
import validator from "../../validation"
import {GetUserAccount} from "../../middleware/Website/GetUserAccount";
import {RestrictToLoggedOutAccounts} from "../../middleware/Website/RestrictToLoggedOutAccounts";
import {LogoutController} from "../../controllers/Website/LogoutController";
import {
    DonateFoodFormSubmissionController,
    RenderDonateFoodPage,
    RenderHelpUsPage, RenderVolunteeringPage
} from "../../controllers/Website/HelpUsController";
import {
    createUserOrder,
    RenderFoodPackagesPage,
    RenderSingleFoodPackagePage
} from "../../controllers/Website/FoodPackageController";
import {
    CreateDonateStripSession, RenderDonationCompletePage,
    RenderDonationPage,
} from "../../controllers/Website/DonateController";
import {ContactUsFormController, RenderContactUsPage} from "../../controllers/Website/ContactUsController";
import {RenderAboutUsPage} from "../../controllers/Website/AboutController";
import {
    RenderManageAccountPage,
    RenderMyOrdersPage, UpdateAddressController,
    UpdateEmailController, UpdatePasswordController
} from "../../controllers/Website/MyAccountController";
import {RedirectLoggedOutAccounts} from "../../middleware/Website/RedirectLoggedOutAccounts";
const cookieParser = require('cookie-parser');

const router = express.Router();

router.use(express.json());
router.use(bodyParser.urlencoded({extended: true}));

router.use(express.static(path.resolve('client-website/public')));

router.use(cookieParser());

router.use(GetUserAccount);

router.get('/', RenderHomepage);
router.get('/login', RestrictToLoggedOutAccounts, RenderLoginPage);
router.get('/register', RestrictToLoggedOutAccounts, RenderRegisterPage);
router.get('/help-us', RenderHelpUsPage);
router.get('/help-us/donate-food', RenderDonateFoodPage);
router.get('/help-us/volunteer', RenderVolunteeringPage);
router.get('/help-us/donation', RenderDonationPage)
router.get('/food-packages/page/:page', RenderFoodPackagesPage);
router.get('/food-package/:id', RenderSingleFoodPackagePage);
router.get('/contact-us', RenderContactUsPage);
router.get('/about', RenderAboutUsPage);

//Redirect /my-account to orders page specifically
router.get('/my-account', RedirectLoggedOutAccounts, (req: any, res: any) => {
    res.redirect('/my-account/orders/1');
})
router.get('/my-account/orders/:page', RedirectLoggedOutAccounts, RenderMyOrdersPage)
router.get('/my-account/manage', RedirectLoggedOutAccounts, RenderManageAccountPage);


router.get('/logout', LogoutController);


/**
 * Post requests
 */
router.post('/register',
    validator.validateTextInput('first-name-input'),
    validator.validateTextInput('last-name-input'),
    validator.validateTextInput('postcode-input'),
    validator.validateEmailInput('email-input'),
    validator.validatePasswordInput('password-input'),
    validator.validatePasswordInput('password-confirm-input'),
    validator.validateTextInput('phone-number-input'),
    validator.validateTextInput('address-input'),
    RestrictToLoggedOutAccounts,
    RegisterUserAccount
);

router.post('/login',
    validator.validateTextInput('input-email'),
    validator.validateTextInput('input-password'),
    loginRequestController
);

router.post('/help-us/donate-food',
    validator.validateTextInput('name-input'),
    validator.validateTextInput('org-input'),
    validator.validateTextInput('email-input'),
    validator.validateTextInput('phone-input'),
    validator.validateTextInput('message-input'),
    DonateFoodFormSubmissionController
);

router.post('/food-package/order/:package_id',
    validator.validateNumberInput('food-package-input'),
    validator.validateTextInput('order-type-input'), //TODO: change to more robust enum checking
    createUserOrder,
)

router.post('/contact-us',
    validator.validateTextInput('name-input'),
    validator.validateTextInput('email-input'),
    validator.validateAllowEmptyTextInput('phone-input'),
    validator.validateTextInput('message-input'),
    ContactUsFormController
)

router.post('/my-account/update/email',
    validator.validateEmailInput('email-input'),
    validator.validateEmailInput('email-input-confirm'),
    UpdateEmailController
)

router.post('/my-account/update/address',
    validator.validateTextInput('input-postcode'),
    validator.validateTextInput('input-address'),
    UpdateAddressController
)

router.post('/my-account/update/password',
    validator.validatePasswordInput('input-password'),
    validator.validatePasswordInput('input-password-confirm'),
    UpdatePasswordController
)

router.post('/donate-session', CreateDonateStripSession);
router.get('/donate-return', RenderDonationCompletePage);

//if no other route is found
router.get('*/**', Render404Page);

export default router;