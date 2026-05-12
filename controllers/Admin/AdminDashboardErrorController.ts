import path from "path";

/**
 * Responsible for rendering an error page
 * @param req
 * @param res
 * @param errorMessage
 * @param statusCode
 */
export function renderErrorPage(req: any, res: any, errorMessage: string, statusCode: number = 404) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-error'), {
        error: errorMessage,
        title: 'Error'
    })
}