import {Repositories} from "../../datasource";
import {AdminRole} from "../../entities/AdminUser";
import {Repository} from "typeorm";
import {request} from "express";


/**
 * Map for the data elements to be returned on the admin data tables
 */

const DataSearchMap = {
    'food_package': {
        repository: Repositories.foodPackageRepository,
        queryFunction: foodPackageQueryData
    },
    'orders': {
        repository: Repositories.orderRepository,
        queryFunction: orderQueryData
    },
    'users': {
        repository: Repositories.userRepository,
        queryFunction: userQueryData
    },
    'donations': {
        repository: Repositories.donationRepository,
        queryFunction: donationQueryData
    },
    'contact_tickets': {
        repository: Repositories.contactTicketRepository,
        queryFunction: contactTicketQueryData
    },
    'accounts': {
        repository: Repositories.adminUserRepository,
        queryFunction: adminUserQueryData
    }
}

/**
 * Controller for getting all the data relevant to a given entity
 * @param req
 * @param res
 */
export function adminDataControllerGetAll(req: any, res: any) {
    if(!req.params.data_type) res.json({'fail': 1})//TODO: Return an error for failure

    const requestOptions = req.body;
    console.log(requestOptions);
    const entityObject: any = DataSearchMap[req.params.data_type as keyof typeof DataSearchMap]

    getAllAdminData(entityObject.repository, requestOptions.searchString).then((data) => {
        res.json(data);
    })
}


async function getAllAdminData(repository: Repository<any>, searchString: string) {
    if(repository === Repositories.foodPackageRepository) {
        return Repositories.foodPackageRepository.createQueryBuilder('food_package')
            .where('food_package.name LIKE :string', {string: `%${searchString}%`})
            .orWhere('food_package.contents LIKE :string', {string: `%${searchString}%`})
            .orWhere('food_package.information LIKE :string', {string: `%${searchString}%`})
            .getMany();
    }
    else if(repository === Repositories.userRepository){
        return Repositories.userRepository.createQueryBuilder('user')
            .where('user.first_name LIKE :string', {string: `%${searchString}%`})
            .orWhere('user.last_name LIKE :string', {string: `%${searchString}%`})
            .orWhere('user.address LIKE :string', {string: `%${searchString}%`})
            .orWhere('user.email LIKE :string', {string: `%${searchString}%`})
            .orWhere('user.phone_number LIKE :string', {string: `%${searchString}%`})
            .orWhere('user.postcode LIKE :string', {string: `%${searchString}%`})
            .orWhere('CAST(user.id AS CHAR(100)) LIKE :string', {string: `%${searchString}%`})
            .getMany();
    }
}

/**
 * Data cotnroller for getting paginated data based on filters and results
 * @param req
 * @param res
 * @constructor
 */
export function AdminDataController(req: any, res: any) {
    if(!req.params.data_type) res.json({'fail': 1})//TODO: Return an error for failure

    const requestOptions = req.body;
    const entityObject: any = DataSearchMap[req.params.data_type as keyof typeof DataSearchMap]

    if(entityObject === DataSearchMap['accounts'] && req.currentUser.user_role[0] !== AdminRole.ADMINISTRATOR){
        res.json({
            fail: 1,
            rejection: 1
        })
        return res.end();
    }

    entityObject.queryFunction(requestOptions).then((result: any) => {
        res.json({
            data: result[0],
            total: result[1],
            pageCount: Math.ceil(result[1] / requestOptions.showPerPage)
        });
    })
}

/**
 * food package pagination query for data table
 * @param requestOptions
 */
async function foodPackageQueryData(requestOptions: any) {
    return await Repositories.foodPackageRepository.createQueryBuilder('food_package')
        .select(['food_package.id', 'food_package.name', 'food_package.contents', 'food_package.dietary_requirements', 'food_package.stock_status'])
        .where('food_package.name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('food_package.information LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('food_package.contents LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('CAST(food_package.id AS CHAR(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('CAST(food_package.dietary_requirements AS char(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orderBy(requestOptions.orderBy, requestOptions.orderDirection.toUpperCase())
        .limit(requestOptions.showPerPage)
        .offset((requestOptions.pageNumber -1) * (requestOptions.showPerPage))
        .getManyAndCount()
}

/**
 * Order query for dashboard data table
 * @param requestOptions
 */
async function orderQueryData(requestOptions: any) {
    const data = await Repositories.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.food_package', 'food_package')
        .leftJoinAndSelect('order.user', 'user')
        .select(['order.id', 'order.date_created', 'order.order_type', 'order.order_status', 'user.first_name', 'user.last_name', 'food_package.name'])
        .where('user.first_name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('user.last_name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('food_package.name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('CAST(order.date_created AS CHAR(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orderBy(requestOptions.orderBy, requestOptions.orderDirection.toUpperCase())
        .limit(requestOptions.showPerPage)
        .offset((requestOptions.pageNumber -1) * (requestOptions.showPerPage))
        .getManyAndCount()

    let returnArray = [];
    returnArray[1] = data[1];

    let objectArray: any[] = [];

    //Mutate the order object for the front end to manage easier
    for(let i = 0; i < data[0].length; i++){
        let currentOrder = data[0][i];
        let orderObject = {
            id: currentOrder.id,
            user_name: currentOrder.user.first_name + ' ' + currentOrder.user.last_name,
            food_package_name: currentOrder.food_package.name,
            date_created: currentOrder.date_created,
            order_type: currentOrder.order_type,
            order_status: currentOrder.order_status,
        }
        objectArray.push(orderObject);
    }

    returnArray[0] = objectArray
    return returnArray; //Return the mutated data and count
}

/**
 * Query controller for user table on admin dashboard
 * @param requestOptions
 */
async function userQueryData(requestOptions: any) {
    return await Repositories.userRepository.createQueryBuilder('user')
        .select(['user.id', 'user.first_name', 'user.last_name', 'user.email', 'user.phone_number', 'user.account_type'])
        .where('CAST(user.id AS CHAR(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('user.first_name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('user.last_name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('user.phone_number LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('user.email LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('CAST(user.account_type AS CHAR(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orderBy(requestOptions.orderBy, requestOptions.orderDirection.toUpperCase())
        .limit(requestOptions.showPerPage)
        .offset((requestOptions.pageNumber -1) * (requestOptions.showPerPage))
        .getManyAndCount()
}

/**
 * Donation query function for admin dashboard donation page
 * @param requestOptions
 */
async function donationQueryData(requestOptions: any) {
    return await Repositories.donationRepository.createQueryBuilder('donation')
        .where('donation.donation_email LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('donation.donation_name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('donation.donation_address_city LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('donation.donation_address_line_1 LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('CAST(donation.amount_total AS CHAR(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orderBy(requestOptions.orderBy, requestOptions.orderDirection.toUpperCase())
        .limit(requestOptions.showPerPage)
        .offset((requestOptions.pageNumber -1) * (requestOptions.showPerPage))
        .getManyAndCount()
}

/**
 * Contact ticket query data for contact ticket dashboard page
 * @param requestOptions
 */
async function contactTicketQueryData(requestOptions: any) {
    return await Repositories.contactTicketRepository.createQueryBuilder('contact_ticket')
        .select(['contact_ticket.id', 'contact_ticket.name', 'contact_ticket.contact_email', 'contact_ticket.contact_number', 'contact_ticket.organisation', 'contact_ticket.date_received'])
        .where('contact_ticket.name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('contact_ticket.contact_email LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('contact_ticket.contact_number LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('contact_ticket.organisation LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orderBy(requestOptions.orderBy, requestOptions.orderDirection.toUpperCase())
        .limit(requestOptions.showPerPage)
        .offset((requestOptions.pageNumber -1) * (requestOptions.showPerPage))
        .getManyAndCount()
}

/**
 * admin user query data for admin dashboard data table.
 * @param requestOptions
 */
async function adminUserQueryData(requestOptions: any) {
    return await Repositories.adminUserRepository.createQueryBuilder('admin_user')
        .select(['admin_user.id', 'admin_user.email', 'admin_user.name', 'admin_user.user_role', 'admin_user.date_created'])
        .where('CAST(admin_user.id AS CHAR(100)) LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('admin_user.email LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('admin_user.name LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orWhere('admin_user.user_role LIKE :search', {search: `%${requestOptions.searchString}%`})
        .orderBy(requestOptions.orderBy, requestOptions.orderDirection.toUpperCase())
        .limit(requestOptions.showPerPage)
        .offset((requestOptions.pageNumber -1) * (requestOptions.showPerPage))
        .getManyAndCount()
}