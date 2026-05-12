import {matchedData, validationResult} from "express-validator";
import {DatabaseSource, Repositories} from "../../datasource";
import {Order, OrderStatus, OrderType} from "../../entities/Order";
import {User} from "../../entities/User";
import path from "path";
import {renderErrorPage} from "./AdminDashboardErrorController";

const orderStatusEnumStringMap = new Map();
orderStatusEnumStringMap.set('in_progress', OrderStatus.IN_PROGRESS);
orderStatusEnumStringMap.set('awaiting_approval', OrderStatus.AWAITING_APPROVAL);
orderStatusEnumStringMap.set('ready_for_collection', OrderStatus.READY_FOR_COLLECTION);
orderStatusEnumStringMap.set('delivery', OrderStatus.DELIVERY);
orderStatusEnumStringMap.set('completed', OrderStatus.COMPLETED);
orderStatusEnumStringMap.set('cancelled', OrderStatus.CANCELLED);


export function renderOrdersDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-orders'), {
        user: req.currentUser,
        title: 'Orders',
        selected: 'orders',
        tableData: req.tableData ? req.tableData : false,
    })
}

export function renderCreateOrderDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-ordersCreate'), {
        user: req.currentUser,
        title: 'Create Order',
        selected: 'orders',
        tableData: req.tableData ? req.tableData : false,
        data: {
            validation_error: req.query.validation_fail == 1
        }
    })
}

/**
 * Render a specific order dashboard page
 * @param req
 * @param res
 */
export function renderSpecificOrderDashboardPage(req: any, res: any) {
    //Query to get the order object. Joins the food package and users table in the query
    Repositories.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.food_package', 'food_package')
        .where('order.id=:orderId', {orderId: req.params.orderId})
        .getOne().then((order) => {
        if(!order) throw new Error('The requested order does not exist');

        //Render the page with the order object
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-ordersView'), {
            user: req.currentUser,
            title: 'View Order',
            selected: 'orders',
            tableData: req.tableData ? req.tableData : false,
            data: {
                order: order,
                updated_successfully: req.query.updated_status == 1,
            }
        })
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The requested order does not exist');
    })
}

/**
 * Updates the order status. If the order status is changed to completed, set the completed date to the current time.
 * @param req
 * @param res
 * @param next
 */
export function updateExistingOrderStatus(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) renderErrorPage(req, res, 'The requested order does not exist');

    //Get the current order
    Repositories.orderRepository.findOneBy({id: data['order-id']}).then((order) => {
        if(!order) { throw new Error('The order you attempted to update could not be found') }
        order.order_status = orderStatusEnumStringMap.get(data['order-status']);
        order.date_completed = orderStatusEnumStringMap.get(data['order-status']) == OrderStatus.COMPLETED ? new Date() : null;
        return Repositories.orderRepository.save(order);
    }).then((order) => {
        if(order){
            res.redirect('/admin/dashboard/orders/view/' + order.id + '?updated_status=1');
        }else{
            throw new Error('The order could not be updated');
        }
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The requested order does not exist');
    })
}

/**
 * Creates a new order on the system. Gets the user and food package objects and attaches them to the order once they are received
 * in the promise
 * @param req
 * @param res
 * @param next
 */
export function createNewOrder(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) {renderErrorPage(req, res, 'The order could not be created');}

    if (!data['food-package-selected'] || !data['user-selected']) {
        res.redirect('/admin/dashboard/error');
    }

    const getUserPromise = Repositories.userRepository.findOneBy({id: data['user-selected']});
    const getFoodPackagePromise = Repositories.foodPackageRepository.findOneBy({id: data['food-package-selected']});

    Promise.all([getUserPromise, getFoodPackagePromise]).then((result) => {
        const selectedUser = result[0];
        const selectedFoodPackage = result[1];

        if (selectedUser && selectedFoodPackage) {
            const order = new Order();
            order.order_type = data['order-type'].toString() === 'type-collection' ? OrderType.COLLECTION : OrderType.DELIVERY;
            order.food_package = selectedFoodPackage;
            order.user = selectedUser;
            order.order_status = OrderStatus.AWAITING_APPROVAL;
            order.date_created = new Date();
            order.date_completed = null;
            return Repositories.orderRepository.save(order);
        }
    }).then((order) => {
        res.redirect('/admin/dashboard/orders');
    }).catch(() => {
        renderErrorPage(req, res, 'The order could not be created. Please try again later');
    })
}

//TODO: add method for deleting an order from the system.