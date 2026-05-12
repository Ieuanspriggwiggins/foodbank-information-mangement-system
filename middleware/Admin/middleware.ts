/**
 * File contains custom middleware written for certain routes
 */
import {DatabaseSource, Repositories} from "../../datasource";
import {AdminRole, AdminUser} from "../../entities/AdminUser";
//Maps the parsed options to entities that are fetched using the API


const jwt = require('jsonwebtoken');

/**
 * Deny access to an endpoint if an administrator account already exists
 * @param res
 * @param req
 * @param next
 *
 * If an admin account already exists, add this to the locals variable to inform any future middleware in the chain.
 */
export function doesAdminAccountExist(req: any, res: any, next: any) {
    Repositories.adminUserRepository.count().then((result) => {
        if(result > 0) {
            res.locals.account_exists = true;
            next();
        }else{
            next();
        }
    })
}

export function adminAuthenticate(req: any, res: any , next: any) {
    const token = req.cookies.access_token;
    //If the token doesn't exist, they are not signed in.
    if(!token){
        res.redirect('/admin/login');
        return res.end();
    }

    jwt.verify(token, process.env.SECRET_TOKEN as string, (err: any, user_id: any) => {
        //If the verification of the user isn't successful, redirect to the login page.
        if(err){
            res.redirect('/admin/login');
            return res.end();
        }
        else{
            //Put the user object in the request body so further middleware can access it.
            Repositories.adminUserRepository.findOneBy({id: user_id.user_id}).then((adminUser) => {
                if(!adminUser) throw new Error('Account could not be found')

                req.currentUser = adminUser;
                req.isAdministrator = adminUser.user_role === AdminRole.ADMINISTRATOR
                next();
            }).catch((err) => {
                console.log(err);
                next();
            })
        }
    });
}

/**
 * Checks if the user has the role required to access a certain page. If not, will give a message stating they are not allowed to access the resource
 * @param req
 * @param res
 * @param next
 */
export function administratorAccessOnly(req: any, res: any, next: any ) {
    if(req.currentUser.user_role == AdminRole.ADMINISTRATOR){
        next();
    }else{
        res.redirect('/admin/error');
    }
}


/**
 * First checks if the setup has been completed, if it has not been completed, will redirect all requests to the /admin endpoint to the setup page for the admin dashboard.
 */
export function forceSetupComplete(req: any, res: any, next: any) {
    if (!res.locals.account_exists && req.originalUrl !== '/admin/setup') {
        res.redirect('/admin/setup');
    } else {
        next();
    }
}