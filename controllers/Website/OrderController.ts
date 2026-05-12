import {Order, OrderStatus, OrderType} from "../../entities/Order";
import {DatabaseSource, getRecordById, Repositories} from "../../datasource";
import {User} from "../../entities/User";
import {FoodPackage} from "../../entities/FoodPackage";
import path from "path";


export async function createNewOrder(userId: string, packageId: string, orderType: OrderType) {
    const user = await getRecordById(userId, User); //Get the user object
    const foodPackage = await getRecordById(packageId, FoodPackage); //Get the food package

    if(user && foodPackage) {
        const order = new Order();
        order.food_package = foodPackage as FoodPackage;
        order.user = user as User;
        order.order_status = OrderStatus.AWAITING_APPROVAL;
        order.date_created = new Date();
        order.order_type = orderType
        order.date_completed = null

        try{
            await Repositories.orderRepository.save(order);
            return {success: 1, order: order}
        }catch(err) {
            return {success: 0};
        }

    }else{
        return {success: 0};
    }
}

export function renderOrderSuccessPage(req: any, res: any, next: any) {
    if(res.order){
        res.render(path.resolve('client-website/pages/order-success.ejs'), {
            logged_in: res.logged_in == 1,
            page: 'order-success',
            order: res.order,
        })
    }else{
        res.send('An error occurred');
    }
}