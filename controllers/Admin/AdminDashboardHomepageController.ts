import path from "path";
import {Repositories} from "../../datasource";
import {OrderStatus} from "../../entities/Order";

/**
 * Responsible for rendering the dashboard homepage.
 * @param req
 * @param res
 */
export function renderDashboardHomepage(req: any, res: any){
    const orders = Repositories.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.food_package', 'food_package')
        .leftJoinAndSelect('order.user', 'user')
        .select(['order.id', 'user.first_name', 'user.last_name', 'food_package.name', 'order.date_created'])
        .where("order.order_status = :status", {status: OrderStatus.AWAITING_APPROVAL})
        .getMany();

    const recentContactTickets = Repositories.contactTicketRepository.createQueryBuilder('contact_ticket')
        .orderBy('contact_ticket.date_received', 'DESC')
        .limit(100)
        .getMany();

    Promise.all([orders, recentContactTickets]).then((result) => {
        const ordersResult = result[0];
        const contactTickets = result[1];
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-home'),
        {
            user: req.currentUser,
            title: 'Home',
            selected: 'dashboard',
            unconfirmedOrders: ordersResult,
            contactTickets: contactTickets
        })
    })
}