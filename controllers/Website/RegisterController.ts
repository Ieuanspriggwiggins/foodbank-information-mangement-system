import express from 'express';
import path from "path";
import {matchedData, validationResult} from "express-validator";
import validator from '../../validation';
import {
    DatabaseSource, getAllRecordsByEntity,
    getWebsiteAccountByEmail, Repositories
} from "../../datasource";
import {User, UserType} from "../../entities/User";
import {RestrictedLocation} from "../../entities/RestrictedLocation";

/**
 * Render the register page
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RenderRegisterPage(req: any, res: any, next: any) {
    const locationRequest = getAllRecordsByEntity(RestrictedLocation)
    locationRequest.then((locations) => {
        res.render(path.resolve('client-website/pages/register'),
            {
                showLogin: true,
                page: 'register',
                passwordMismatch: req.query.password_match_error == 1,
                locationRestricted: req.query.location_restricted == 1,
                accountExists: req.query.account_already_exists == 1,
                restrictedLocations: locations,
                logged_in: res.logged_in == 1
            })
    })
}

/**
 * Takes in a postcode string and confirms whether the postcode is within the allowed geographical area
 * @param postcode
 */
export async function isLocationValid(postcode: string){
    const request = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await request.json();

    return await DatabaseSource.getRepository(RestrictedLocation)
        .createQueryBuilder()
        .where(':easting BETWEEN minEasting AND maxEasting', {easting: data.result.eastings})
        .andWhere(':northing BETWEEN minNorthings AND maxNorthings', {northing: data.result.northings})
        .getCount()
}

/**
 * Controller for registering user accounts
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RegisterUserAccount(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0){
        res.redirect('/register?error=1');
        return res.end();
    }

    if(data['password-input'].toString() !== data['password-confirm-input'].toString()){
        res.redirect('/register?password_match_error=1');
        return res.end();
    }

    const existingWebsiteAccount = getWebsiteAccountByEmail(data['email-input']);
    const locationValid = isLocationValid(data['postcode-input']);

    Promise.all([existingWebsiteAccount, locationValid]).then((result) => {
        const websiteAccount = result[0];
        const locationResult = result[1];

        if(websiteAccount){
            res.redirect('/register?account_already_exists=1')
            return res.end();
        }

        //If the location validation fails (they are not within a serviced area) parse an error to the front-end
        if(locationResult < 1){
            res.redirect('/register?location_restricted=1');
            return res.end();
        }else{
            //Create the user account with the hash created
            validator.hashPassword(data['password-input']).then((hash) => {
                if(hash){
                    const user = new User();
                    user.first_name = data['first-name-input'];
                    user.last_name = data['last-name-input'];
                    user.postcode = data['postcode-input'];
                    user.email = data['email-input'];
                    user.hashed_password = hash;
                    user.phone_number = data['phone-number-input'];
                    user.address = data['address-input'];
                    user.account_type = UserType.WEBSITE;

                    Repositories.userRepository.save(user).then((user) => {
                        if(!user) throw new Error('The user account could not be created');

                        res.status(200).redirect('/login?register_success=1');
                    }).catch((err) => {
                        console.log(err);
                        res.redirect('/register')
                    })
                }
            })
        }
    })
}