import {matchedData, validationResult} from "express-validator";
import {Repositories} from "../../datasource";
import {User, UserType} from "../../entities/User";
import path from "path";
import {renderErrorPage} from "./AdminDashboardErrorController";

/**
 * Render users dashboard page
 * @param req
 * @param res
 */
export function renderUsersPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-users'),
        {
            user: req.currentUser,
            title: 'Users',
            selected: 'users',
            tableData: req.tableData ? req.tableData : false,
        }
    )
}

/**
 * Render page for creating new service user on the system
 * @param req
 * @param res
 */
export function renderCreateUsersDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-usersCreate'),
        {
            user: req.currentUser,
            title: 'Create New User',
            selected: 'users',
            tableData: req.tableData ? req.tableData : false,
            data: {
                success: req.query.created == 1
            }
        }
    )
}

export function renderViewUsersDashboardPage(req: any, res: any) {
    const id = req.params.userId;
    if(!id) res.redirect('/admin/dashboard/error');

    Repositories.userRepository.findOneBy({id: id}).then((user) => {
        if(!user) throw new Error('User does not exist or is not valid');

        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-usersView'), {
            user: req.currentUser,
            title: 'View User',
            selected: 'users',
            tableData: req.tableData ? req.tableData : false,
            data: {
                user: user
            }
        });

    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The user you requested does not exist');
    })
}

/**
 * Creates a new service user on the administrative dashboard system. All service users are specifically not accounts
 * @param req
 * @param res
 * @param next
 */
export function createNewServiceUser(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) {
        renderErrorPage(req, res, 'The service user could not be created');
    }

    const serviceUser = new User();
    serviceUser.first_name = data['firstname-input'];
    serviceUser.last_name = data['surname-input'];
    serviceUser.email = data['email-input'];
    serviceUser.postcode = data['postcode-input'];
    serviceUser.address = data['address-input'];
    serviceUser.phone_number = data['phone-input'];
    serviceUser.account_type = UserType.SERVICE;

    Repositories.userRepository.save(serviceUser).then((result) => {
        if(!result) throw new Error('The user could not be created.')
        res.redirect('/admin/dashboard/users/create?created=1');
    }).catch((err) => {
        console.log(err);
        res.redirect('/admin/dashboard/users/create?created=0');
    })
}

/**
 * Updates the details of an existing service user on the system. Only achievable if the ID passed through is the ID of an account
 * of type service user. Reject the request otherwise.
 * @param req
 * @param res
 */
export function updateServiceUser(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0){
        renderErrorPage(req, res, 'The information provided is not valid');
    }

    Repositories.userRepository.findOneBy({id: data['user-id'], account_type: UserType.SERVICE}).then((user) => {
        //Throw error if the user object returned was null (could have been deleted while another user attempted to update).
        if(!user) throw new Error('The user could not be updated as the user you attempted to update could not be found');
        user.first_name = data['input-firstname'];
        user.last_name = data['input-surname'];
        user.email = data['input-email'];
        user.phone_number = data['input-phone'];
        user.postcode = data['input-postcode'];
        user.address = data['input-address'];
        return Repositories.userRepository.save(user);
    }).then((result) => {
        if(!result) throw new Error('The user object could not be updated. Please try again');
        res.redirect('/admin/dashboard/users');
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The user could not be updated.');
    })
}

/**
 * Removes an existing service user from the website. Checks if the account exists before running the deletion function to save
 * server resources and avoid potential situations in which an account is deleted before this request finishes by another user.
 * @param req
 * @param res
 */
export function deleteServiceUser(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) {
        renderErrorPage(req, res, 'The user could not be deleted')
        return res.end();
    }

    Repositories.userRepository.findOneBy({id: data['id'], account_type: UserType.SERVICE}).then((user) => {
        if(!user) throw new Error('The user you attempted to update could not be found');
        return Repositories.userRepository.delete({id: data['id'], account_type: UserType.SERVICE});
    }).then((deleteResult) => {
        if(deleteResult.affected && deleteResult.affected < 1){
            throw new Error('The item could not be deleted');
        }
        res.status(200).redirect('/admin/dashboard/users');
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'You do not have permission to delete this resource')
    })
}