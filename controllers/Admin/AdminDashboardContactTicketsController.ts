import path from "path";
import {Repositories} from "../../datasource";
import {renderErrorPage} from "./AdminDashboardErrorController";

/**
 * Render contact ticket dashboard page
 * @param req
 * @param res
 */
export function renderContactTicketsDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-contactTickets'), {
        user: req.currentUser,
        title: 'Contact Tickets',
        selected: 'contact_tickets',
        tableData: req.tableData ? req.tableData : false,
    })
}

/**
 * Render dashboard page for viewing a specific contact ticket
 * @param req
 * @param res
 */
export function renderSpecificContactTicketsDashboardPage(req: any, res: any) {
    const id = req.params.id;

    //Get the contact ticket object currently being viewed
    Repositories.contactTicketRepository.findOneBy({id: id}).then((contactTicket) => {
        if(!contactTicket) throw new Error('The requested contactTicket does not exist');

        //Render the page
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-contactTicketsView'), {
            user: req.currentUser,
            title: 'View Contact Ticket',
            selected: 'contact_tickets',
            tableData: req.tableData ? req.tableData : false,
            data: {
                contactTicket: contactTicket
            }
        })
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The requested contact ticket does not exist');
    })
}