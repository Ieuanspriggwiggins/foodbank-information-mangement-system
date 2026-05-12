import path from "path";
import {Repositories} from "../../datasource";
import {matchedData, validationResult} from "express-validator";
import {UserType} from "../../entities/User";
import {isLocationValid} from "./RegisterController";
import validator from '../../validation'

/**
 * Renders the orders page for the user
 * @param req
 * @param res
 * @constructor
 */
export function RenderMyOrdersPage(req: any, res: any) {
    const currentPage: number = req.params.page;
    const perPage = 5;
    //Get the orders from the account (paginate by the current page).
    Repositories.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.food_package', 'food_package')
        .where('user.id = :id', {id: res.currentUser.id})
        .orderBy('order.date_created', 'DESC')
        .limit(perPage)
        .offset(perPage * (currentPage - 1))
        .getManyAndCount().then((orders) => {
            res.render(path.resolve('client-website/pages/my-account-orders'), {
                page: 'my-account',
                logged_in: res.logged_in == 1,
                hasOrders: orders !== null,
                orders: orders[0],
                maxPage: (Math.ceil(orders[1] / perPage)),
                currentPage: currentPage
            });
    })
}

/**
 * Render the manage account page
 * @param req
 * @param res
 * @constructor
 */
export function RenderManageAccountPage(req: any, res: any) {
    res.render(path.resolve('client-website/pages/my-account-manage'), {
        page: 'my-account',
        logged_in: res.logged_in == 1,
        email_fail: req.query.email_fail == 1,
        email_in_use: req.query.email_in_use == 1,
        address_updated: req.query.address_update == 1,
        location_invalid: req.query.location_restricted == 1,
        password_validation_fail: req.query.password_validation_fail == 1,
        password_mismatch: req.query.password_mismatch == 1,
        password_update_error: req.query.password_update_error == 1
    })
}

/**
 * Update email controller - Responsible for the form submission to update the users email address
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function UpdateEmailController(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(!res.currentUser){
        res.redirect('/login');
        return res.end();
    }
    if(errors['errors'].length){
        res.redirect('/my-account/manage?email_fail=1');
        return res.end();
    }
    if(data['email-input'].toString() !== data['email-input-confirm']){
        res.redirect('/my-account/manage?email_fail=1');
        return res.end();
    }

    //Check if a user account with that email already exists
    const userWithEmail = Repositories.userRepository.findOneBy({
        email: data['email-input'],
        account_type: UserType.WEBSITE
    });

    //Get the account object of the current logged-in user
    const loggedInUserAccount = Repositories.userRepository.findOneBy({
        id: res.currentUser.id
    });

    Promise.all([userWithEmail, loggedInUserAccount]).then((result) => {
        const userWithEmail = result[0];
        const currentLoggedInUser = result[1];

        //If a user with said email already exists
        if(userWithEmail) {
            res.redirect('/my-account/manage?email_in_use=1');
            return res.end();
        }

        //If the current user logged in exists
        if(currentLoggedInUser){
            currentLoggedInUser.email = data['email-input'];
            Repositories.userRepository.save(currentLoggedInUser).then((data) => {
                if(req.cookies.web_access_token){ //if the access token is set on the user browser
                    res.clearCookie('web_access_token');
                    res.redirect('/login?updated=1'); //Redirect to the homepage.
                }
            })
        }
    })
}

export function UpdateAddressController(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    //Check if any validation errors occurred
    if(errors['errors'].length) {
        res.redirect('/my-account/manage?address_error=1');
    }
    if(!res.currentUser) {
        res.redirect('/login');
    }

    isLocationValid(data['input-postcode']).then((result) => {
        //if no locations were found with this postcode within.
        if(result < 1){
            res.redirect('/my-account/manage?location_restricted=1');
            return res.end();
        }

        //return the current user to the next chain in the promise
        Repositories.userRepository.findOneBy({
            id: res.currentUser.id
        }).then((user) => {
            if(!user){
                res.redirect('/login');
            }else{
                user.postcode = data['input-postcode'].toUpperCase();
                user.address = data['input-address'];
                return Repositories.userRepository.save(user);
            }
        }).then((user) => {
            if(user){
                res.redirect('/my-account/manage?address_update=1')
            }
        })
    })
}

export function UpdatePasswordController(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    console.log(errors);
    //If any validation errors occur
    if(errors['errors'].length > 0){
        res.redirect('/my-account/manage?password_validation_fail=1');
        return res.end();
    }

    //If the passwords don't match. Redirect with error
    if(data['input-password'].toString() !== data['input-password-confirm'].toString()){
        res.redirect('/my-account/manage?password_mismatch=1');
    }

    //Generate promise to get the current user and the hashed password
    const hashPasswordPromise = validator.hashPassword(data['input-password']);
    const currentUserPromise = Repositories.userRepository.findOneBy({id: res.currentUser.id})

    //When the promises are finished
    Promise.all([hashPasswordPromise, currentUserPromise]).then((result) => {
        const hashedPassword = result[0];
        const currentUser = result[1];

        //If either the password or current user weren't received
        if(!hashedPassword || !currentUser) {
            res.redirect('/my-account/manage?password_update_error=1');
        }else{
            currentUser.hashed_password = hashedPassword;
            Repositories.userRepository.save(currentUser).then((user) => {
                if(req.cookies.web_access_token){ //if the access token is set on the user browser
                    res.clearCookie('web_access_token');
                    res.redirect('/login?updated=1'); //Redirect to the homepage.
                }
            })
        }
    });
}