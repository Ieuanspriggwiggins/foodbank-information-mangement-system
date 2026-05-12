import path from "path";

/**
 * Renders the about us page.
 * @param req
 * @param res
 * @constructor
 */
export function RenderAboutUsPage(req: any, res: any) {
    res.render(path.resolve('client-website/pages/about-us-page'), {
        page: 'about-us',
        logged_in: res.logged_in == 1,
    })
}