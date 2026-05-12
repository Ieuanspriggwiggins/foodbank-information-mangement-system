import express from 'express';
import path from "path";

/**
 * Render 404 page not found
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function Render404Page(req: any, res: any, next: any) {
    res.render(path.resolve('client-website/pages/404'), {
        page: '404',
        logged_in: res.logged_in == 1
    });
}