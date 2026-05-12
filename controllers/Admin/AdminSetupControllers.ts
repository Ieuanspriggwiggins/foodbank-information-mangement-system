import {matchedData, validationResult} from "express-validator";
import validator from '../../validation';
import {DatabaseSource} from "../../datasource";
import {AdminRole, AdminUser} from "../../entities/AdminUser";
import path from "path";

/**
 * Handles GET requests made to the admin setup page /admin/setup
 * - The page is no longer accessible once at least one account exists on the system. Page is only intended for initial setup of the system
 * @param req 
 * @param res
 * @param next 
 *
 */
export function renderAdminSetupPage(req: any, res: any, next:any ){
    //Check if account exists, if so, redirect to the login page.
    if(res.locals.account_exists == true){
        res.redirect('/admin/login?setup_error=1');
        next();
    }else{
        //If the system doesn't have an account, allow access to the setup page.
        res.render(path.resolve('client-admin/pages/setup'), {display_error: req.query.error})
    }
}

/**
 * Handles POST requests made to the /admin/api/setup-account
 * - Should deny any requests made once an account exists on the system.
 * @param req 
 * @param res 
 * @param next 
 */
export function setupAdminAccountPost(req: any, res: any, next: any){
    const errors = validationResult(req);
    const data = matchedData(req);

    if(res.locals.account_exists == true){
        res.status(403);
        next();
    }

    const hashedPasswordPromise = validator.hashPassword(data.password_input);

    hashedPasswordPromise.then((hash) => {
        return DatabaseSource
            .createQueryBuilder()
            .insert()
            .into(AdminUser)
            .values([
                {
                    email: data.email_input,
                    name: data.name_input,
                    hashed_password: hash as string,
                    user_role: AdminRole.ADMINISTRATOR,
                    date_created: new Date(),
                    is_deletable: false //This account cannot be deleted
                }
            ]).execute();
    }).then(() => {
        res.redirect('/admin/login?create_success=1');
    }).catch((err) => {
        res.send('Error - something went wrong');
    })
}
