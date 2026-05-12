/**
 * If the account is logged in, they should not be allowed to access the route with this middleware attached. For example, the login page.
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RestrictToLoggedOutAccounts(req: any, res: any, next: any) {

    if(res.logged_in === 1){
        res.redirect('/');
        return res.end();
    }else{
        next();
    }
}