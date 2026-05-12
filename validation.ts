/**
 * File contains validation rules for user input
 */

import {body, matchedData, validationResult} from 'express-validator';
import bcrypt from 'bcrypt';


const validateEmailInput = (field: string) =>
body(field, 'inv-email').notEmpty().trim().contains('@').isLength({min: 5}).escape().optional({values: "falsy"});

const validateTextInput = (field: string) =>
body(field, 'inv-text-field').notEmpty().trim().isLength({min: 1}).escape().optional({values: "falsy"});

const validateAllowEmptyTextInput = (field: string) =>
    body(field, 'inv-text-field').trim().escape().optional({values: "falsy"});

const validateNumberInput = (field: string) => 
body(field, 'int-number-field').notEmpty().trim().isLength({min: 1}).isNumeric().escape();

const validatePasswordInput = (field: string) =>
body(field, 'inv-pass').notEmpty().trim().escape().isLength({min: 8, max: 20})
.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/).optional({values: "falsy"});

async function hashPassword(password_string: string) {
    const saltRounds = 10;
    return bcrypt
        .genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(password_string, salt);
        })
        .catch(err => {
            console.log(err);
        });
}

export default {validateEmailInput, validateTextInput, validateNumberInput, validatePasswordInput, hashPassword, validateAllowEmptyTextInput}