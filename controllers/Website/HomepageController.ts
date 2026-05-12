import express from 'express';
import path from "path";

/**
 * Renders the homepage
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RenderHomepage(req: any, res: any, next: any) {
    res.render(path.resolve('client-website/pages/homepage'), {
        page: 'home',
        logged_in: res.logged_in == 1
    });
}