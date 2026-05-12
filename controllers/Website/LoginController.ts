import express from 'express';
import path from "path";
import {matchedData, validationResult} from "express-validator";
import {DatabaseSource} from "../../datasource";
import {User} from "../../entities/User";
import bcrypt from "bcrypt";
import * as http from "http";
const jwt = require('jsonwebtoken');

/**
 * Renders the login page for the frontend website
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RenderLoginPage(req: any, res: any, next: any) {
    res.render(path.resolve('client-website/pages/login'), {
        page: 'login',
        registrationSuccess: req.query.register_success == 1,
        logged_in: res.logged_in == 1,
        account_updated: req.query.updated == 1
    });
}

/**
 * Handles login from the login form on the website
 * @param req
 * @param res
 * @param next
 */
export function loginRequestController(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    const getUserAccount = DatabaseSource.getRepository(User)
        .createQueryBuilder('user')
        .where('user.email = :user_email', {user_email: data['input-email']})
        .andWhere('user.account_type = "WEBSITE"')
        .getOne();
    
    getUserAccount.then((account) => {
        if(!account) {
            res.redirect('/login?not_exist=1');
        }else{
            bcrypt.compare(data['input-password'], account.hashed_password, (err: any, response: any) => {
                if(response) {
                    const token = jwt.sign({user_id: account.id}, process.env.SECRET_TOKEN)
                    res.cookie('web_access_token', token, {
                        httpOnly: true,
                    }).redirect('/')
                }
                else{
                    res.redirect('/login?password_mismatch=1')
                }
            })
        }
    })
}

