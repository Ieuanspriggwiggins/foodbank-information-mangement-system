
import {DataSource, EntityTarget, ObjectLiteral} from 'typeorm';
import { FoodPackage } from './entities/FoodPackage';
import {AdminUser } from './entities/AdminUser';
import {User} from "./entities/User";
import {Order} from "./entities/Order";
import {RequiredItem} from "./entities/RequiredItem";
import {RestrictedLocation} from "./entities/RestrictedLocation";
import {ContactTicket} from "./entities/ContactTicket";
import {Donation} from "./entities/Donation";

const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_name = process.env.DB_NAME;

/**
 * Set up the database.
 */
export const DatabaseSource = new DataSource({
    type:'mysql',
    host: db_host,
    port: Number(db_port),
    username: db_user,
    password: db_pass,
    database: db_name,
    entities: ['entities/*.js'],
    synchronize: true
});

const orderRepository = DatabaseSource.getRepository(Order);
const adminUserRepository = DatabaseSource.getRepository(AdminUser);
const foodPackageRepository = DatabaseSource.getRepository(FoodPackage);
const locationRestrictionRepository = DatabaseSource.getRepository(RestrictedLocation);
const userRepository = DatabaseSource.getRepository(User);
const requiredItemRepository = DatabaseSource.getRepository(RequiredItem);
const contactTicketRepository = DatabaseSource.getRepository(ContactTicket);
const donationRepository = DatabaseSource.getRepository(Donation);

export const Repositories = {
    orderRepository,
    adminUserRepository,
    foodPackageRepository,
    locationRestrictionRepository,
    userRepository,
    requiredItemRepository,
    contactTicketRepository,
    donationRepository
}

//Initialize the database
export function initDatabase() {
    DatabaseSource.initialize()
        .then(() => {
            console.log('Data source initialized');
        })
        .catch((err) => {
            console.log(err);
        });
}

/**
 * Returns paginated data of an entity in json format. If pagination is not specified, then all data will be returned.
 * @param entity
 * @param pageNumber
 * @param showPerPage if -1 specified, get every record of that entity.
 * @param searchString String for searching the records that contain that string
 * @param sortByString
 * @param sortDirectionString
 * @returns
 */
export async function getEntityDataJson(
    entity: EntityTarget<ObjectLiteral>, 
    pageNumber: number = 1, 
    showPerPage: number = -1, 
    searchString: string | null = null,
    sortByString: string,
    sortDirectionString: string,
    ){

    //If the search string is specified, search through the returned objects and return those that contain the 
    //desired value
    if(searchString) {
        return DatabaseSource
        .getRepository(entity)
        .createQueryBuilder()
        .orderBy(sortByString, sortDirectionString as "DESC" | "ASC")
        .getMany()
        .then((data) => {
            let returnObj: Array<Object> = [];
            for(let i = 0; i < data.length; i++){
                if(JSON.stringify(data[i]).toLowerCase().includes(searchString.toLowerCase())){
                    returnObj.push(data[i]);
                }
            }
            
            const lowerBound = (pageNumber -1) * showPerPage;
            const upperBound = lowerBound + showPerPage;

            return returnObj.slice(lowerBound, upperBound);
        })
    }

    //If no pagination is specified for the request.
    if(showPerPage === -1){
        return DatabaseSource
        .getRepository(entity)
        .createQueryBuilder()
        .orderBy(sortByString, sortDirectionString as "DESC" | "ASC")
        .getMany()
    }

    return DatabaseSource
    .getRepository(entity)
    .createQueryBuilder()
    .offset((pageNumber -1) * showPerPage)
    .limit(showPerPage)
    .orderBy(sortByString, sortDirectionString as "DESC" | "ASC")
    .getMany();
}

/**
 *
 * @param entity
 * @param showPerPage
 * @param searchString
 * @param sortByString
 * @param sortDirectionString
 * @returns
 */
export async function getEntityDataCount(entity: EntityTarget<ObjectLiteral>, 
    showPerPage: number = 10,
    searchString: string,
    sortByString: string,
    sortDirectionString: string) {
    
    let total: number;
    
    if(searchString){
        total = await DatabaseSource
        .getRepository(entity)
        .createQueryBuilder()
        .orderBy(sortByString, sortDirectionString as "DESC" | "ASC")
        .getMany().then((data) => {
            let returnObj = [];
            for(let i = 0; i < data.length; i++){
                if(JSON.stringify(data[i]).toLowerCase().includes(searchString.toLowerCase())){
                    returnObj.push(data[i]);
                }
            }
            return returnObj.length;
        })
    }else{
        total = await DatabaseSource
        .getRepository(entity)
        .createQueryBuilder()
        .orderBy(sortByString, sortDirectionString as "DESC" | "ASC")
        .getCount();
    }

    const pageCount = Math.ceil(total / showPerPage);

    return {pageCount: pageCount, total: total}
}

export async function getRecordById(id: string, entity: EntityTarget<ObjectLiteral>) {
    return DatabaseSource
        .getRepository(entity)
        .createQueryBuilder('entity')
        .where('entity.id = :id', { id: id })
        .getOne();
}

export async function getAllRecordsByEntity(entity: EntityTarget<ObjectLiteral>) {
    return DatabaseSource.getRepository(entity)
        .createQueryBuilder('entity')
        .getMany();
}

export async function getWebsiteAccountByEmail(email: string) {
    return await DatabaseSource.getRepository(User)
        .createQueryBuilder('user')
        .where("user.account_type = 'Website'")
        .andWhere('user.email = :email', {email: email})
        .getOne()
}