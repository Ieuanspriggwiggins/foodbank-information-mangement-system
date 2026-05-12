/**
 * Logs the user out of their account by removing the login token they have.
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function LogoutController(req: any, res: any, next: any) {
    if(req.cookies.web_access_token){ //if the access token is set on the user browser
        res.clearCookie('web_access_token');
        res.redirect('/'); //Redirect to the homepage.
    }
}