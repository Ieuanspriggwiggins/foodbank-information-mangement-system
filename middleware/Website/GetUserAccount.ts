import {DatabaseSource, Repositories} from "../../datasource";
import {User} from "../../entities/User";

const jwt = require('jsonwebtoken');

/**
 * Retrieves the user account from the database using the token parsed from cookies and parses it in the request object for all controllers to acknowledge a logged in user
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function GetUserAccount(req: any, res: any, next: any) {
    //Get the access token
    const token = req.cookies.web_access_token;

    //If the token doesn't exist. Tell the future controllers that the user is not logged in
    if(token) {
        jwt.verify(token, process.env.SECRET_TOKEN as string, (err: any, user_id: any) => {
            if(err){
                res.logged_in = 0;
                next();
            }
            else{
                Repositories.userRepository.findOneBy({id: user_id.user_id}).then((user) => {
                    if(!user) throw new Error('The user account could not be found.')

                    res.currentUser = user;
                    res.logged_in = 1;
                    next();
                }).catch((err) => {
                    console.log(err);
                    res.currentUser = null;
                    res.logged_in = 0;
                    next();
                })
            }
        })
    }else{
        res.logged_in = 0;
        next();
    }

}