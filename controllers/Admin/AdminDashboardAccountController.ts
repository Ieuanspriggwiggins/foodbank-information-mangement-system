import {AdminRole, AdminUser} from "../../entities/AdminUser";
import {Repositories} from "../../datasource";
import {matchedData, validationResult} from "express-validator";
import validator from '../../validation';
import path from "path";
import {renderErrorPage} from "./AdminDashboardErrorController";
import {render} from "sass";

/**
 * Render the account dashboard page on route /admin/dashboard/accounts
 * @param req
 * @param res
 */
export function renderAccountsDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-accounts'), {
        user: req.currentUser,
        title: 'Accounts',
        selected: 'accounts',
        tableData: req.tableData ? req.tableData : false,
    });
}

/**
 * Renders a specific account view page on route /admin/dashboard/accounts/view/$id
 * @param req
 * @param res
 */
export function renderSpecificAccountDashboardPage(req: any, res: any) {
    const id = req.params.accountId;
    if(!id || id == '') renderErrorPage(req, res, 'The account could not be found')

    Repositories.adminUserRepository.findOneBy({id: id}).then((adminAccount) => {
        if(!adminAccount) throw new Error('The requested administrator account does not exist, Please try again later');
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-accountsView'), {
            user: adminAccount,
            title: 'View Account',
            selected: 'accounts',
            success: req.query.success == 1,
            password_fail: req.query.mismatch == 1
        });
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The requested administrator account does not exist. Please try again later');
    })
}

/**
 * Renders the page for creating a new staff account on the system
 * @param req
 * @param res
 */
export function renderCreateAccountDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-accountsCreate'), {
        user: req.currentUser,
        title: 'Create New Account',
        selected: 'accounts',
        tableData: req.tableData ? req.tableData : false,
        data: {
            created_success: req.query.created_success == 1,
            password_mismatch: req.query.password_match == 1, //TODO: fix
            email_in_use: req.query.email_in_use == 1
        }
    })


}

/**
 * Responsible for creating staff/admin accounts on the system
 * @param req
 * @param res
 * @param next
 */
export function createNewStaffAccount(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    //Check if any validation errors occurred
    if(errors['errors'].length){ 
        renderErrorPage(req, res, 'The account could not be created because some input was invalid. Please try again');
        return res.end();
    }

    //Check if the password and confirm password match correctly.
    if(data['input-password'] !== data['input-passwordConfirm']){
        res.redirect('/admin/dashboard/accounts/create?password_match=0');
    }else{
        const hashedPasswordPromise = validator.hashPassword(data['input-password']);

        hashedPasswordPromise.then((hash) => {
            if(hash){
                const adminUser = new AdminUser();
                adminUser.email = data['input-email'];
                adminUser.name = data['input-fullname'];
                adminUser.hashed_password = hash;
                adminUser.is_deletable = true;
                adminUser.user_role = AdminRole.EDITOR

                Repositories.adminUserRepository.save(adminUser).then((data) => {
                    if(data){
                        res.redirect('/admin/dashboard/accounts/create?created_success=1');
                    }
                }).catch((err) => {
                    console.log(err);
                    res.redirect('/admin/dashboard/accounts/create?email_in_use=1')
                })
            }
        }).catch((err) => {
            console.log(err);
            renderErrorPage(req, res, 'Something went wrong creating the account. Please try again later');
        })
    }
}

/**
 * Responsible for deletion of existing staff accounts on the system. Will result in an error in the case that
 * an account doesn't exist or can't be deleted.
 * @param req
 * @param res
 * @param next
 */
export function deleteStaffAccount(req: any, res: any, next: any) {
    const data = matchedData(req);
    if(!data['id']) renderErrorPage(req, res, 'The account you attempted to delete could not be found');

    Repositories.adminUserRepository.findOneBy({id: data['id'], is_deletable: true}).then((adminUser) => {
        if(!adminUser) throw new Error('The user could not be deleted, this could be because it is an administrator');
        return Repositories.adminUserRepository.delete({id: adminUser.id});
    }).then((result) => {
        if(result.affected && result.affected < 1) throw new Error('The user could not be deleted, this could be because it is an admin');
        res.redirect('/admin/dashboard/accounts');
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'Something went wrong when trying to delete the account. Please try again later');
    })
}

/**
 * Responsible for updating staff accounts on the system
 * @param req
 * @param res
 * @param next
 */
export function updateStaffAccount(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    //Get the user object to update
    Repositories.adminUserRepository.findOneBy({id: data['account-id']}).then((user) => {
        const errors = validationResult(req);
        if(!user) {
            renderErrorPage(req, res, 'The account you attempted to update does not exist');
            return res.end();
        }

        //Check if there is any password validation fails.
        for(let i = 0; i < errors['errors'].length; i++){
            if(errors['errors'][i].msg === 'inv-pass'){
                res.redirect(`/admin/dashboard/accounts/view/${user.id}?password_fail=1`);
                return res.end();
            }
        }

        user.email = data['input-email'] ? data['input-email'] : user.email;
        user.name = data['input-name'] ? data['input-name'] : user.name;

        //Update the user role if specified
        if(data['input-role']){
            if(data['input-role'].toString() === 'administrator'){
                user.user_role = AdminRole.ADMINISTRATOR;
            }else if(data['input-role'].toString() === 'editor'){
                user.user_role = AdminRole.EDITOR;
            }
        }

        if(user.user_role[0] !== AdminRole.ADMINISTRATOR && user.is_deletable === false) {
            renderErrorPage(req, res, 'You are unauthorized to change this information');
            return res.end();
        }

        //If the passwords are attempted to be updated, check if they match
        if(data['input-password'] && data['input-password'].toString() === data['input-passwordConfirm']){
            //Get the password hash
            validator.hashPassword(data['input-password']).then((hash) => {
                if(hash) {
                    user.hashed_password = hash;
                    Repositories.adminUserRepository.save(user).then((user) => {
                        res.redirect('/admin/dashboard/accounts/view/' + user.id + '?success=1');
                    })
                }else{
                    renderErrorPage(req, res, 'The password supplied is not valid');
                }
            });
        }else{
            Repositories.adminUserRepository.save(user).then((user) => {
                res.redirect('/admin/dashboard/accounts/view/' + user.id + '?success=1')
            })
        }
    })
}