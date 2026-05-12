/**
 * Logs out the account by removing the cookie from their browser and redirecting them to the
 * login page. Will no longer allow access until logged into a valid administrator account
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default function AdminLogoutController(req: any, res: any, next: any) {
    if(req.cookies.access_token){ //if the access token is set on the user browser
        res.clearCookie('access_token');
        res.redirect('/admin/login?logout_success=1'); //Redirect to the homepage with message that logout was successful
    }
}