import path from "path";
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

import {matchedData, validationResult} from "express-validator";
import {DatabaseSource, Repositories} from "../../datasource";
import { AdminUser } from "../../entities/AdminUser";
import {renderErrorPage} from "./AdminDashboardErrorController";


/**
 * handles GET requests made to the route /admin/login
 *
 * @param req - Request object
 * @param res - Response object
 * @param next - Next middleware function
 */
export function renderAdminLogin(req: any, res: any, next: any) {
    res.render(path.resolve('client-admin/pages/login'), {
        show_success: req.query.create_success,
        show_setup_access_error: req.query.setup_error,
        password_fail: req.query.password_match == '1',
        email_fail: req.query.email_failure =='1',
        logout_success: req.query.logout_success == '1'
    });
}

//Handles post requests made to the /admin/api/login route.
export function adminLoginController(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if (errors['errors'].length > 0) {
        res.redirect('/admin/login?validation_error=1');
        return res.end();
    }

    //If the email or password are undefined, cancel the request and give an error
    const email: string = data['email'] as string;
    if(email === undefined || data['password'] === undefined) {
        res.redirect('/admin/login?validation_error=1');
        return res.end();
    }

    const getUserPromise = Repositories.adminUserRepository.findOneOrFail( {where: {email: email}})

    getUserPromise.then((adminUser) => {
        console.log(adminUser);
        //If the admin user doesn't exist, return to log in with error stating as such
        if (!adminUser) {
            res.redirect('/admin/login?email_failure=1');
        } else {
            return adminUser;
        }
    }).then((user) => {
        if (user) {
            console.log(user);
            bcrypt.compare(data.password, user.hashed_password, (err: any, response: any) => {
                if (response == false) { //If the comparison failed
                    res.redirect('/admin/login?password_match=1')
                } else {
                    const token = jwt.sign({user_id: user.id}, process.env.SECRET_TOKEN)
                    res.cookie('access_token', token, {
                        httpOnly: true,
                    }).redirect('/admin/dashboard');
                }
            })
        }
    })
}