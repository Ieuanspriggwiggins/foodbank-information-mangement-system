import path from "path";
import {DietaryRequirements, FoodPackage, StockStatus} from "../../entities/FoodPackage";
import {DatabaseSource, getRecordById} from "../../datasource";
import * as URLStringFormatter from '../../libraries/URLStringFormatter';
import {RequiredItem} from "../../entities/RequiredItem";
import {matchedData, validationResult} from "express-validator";
import {createNewOrder, renderOrderSuccessPage} from "./OrderController";
import {Order, OrderType} from "../../entities/Order";

/**
 * Responsible for rendering food package page
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RenderFoodPackagesPage(req: any, res: any, next: any) {
    const searchString: string = req.query.search;
    let dietaryFilters = null;

    if(req.query.diet){ dietaryFilters = getDietaryRequirementsAsObjectFromString(req.query.diet.toString()); }

    const urlQueryString = URLStringFormatter.generateURLWithQueries(req.query);
    const urlQueryStringWithoutSearch = URLStringFormatter.generateURLWithQueries(req.query, ['search']);

    const paginationFoodPackagesPromise = getPaginatedFoodPackages(req.params.page, 5, searchString, dietaryFilters);
    const foodPackageInformationPromise = getFoodPackageCountObject(5, searchString, dietaryFilters);

    Promise.all([paginationFoodPackagesPromise, foodPackageInformationPromise]).then((result) => {
        const FoodPackages = result[0];
        const foodPackageInformation = result[1];
        const currentPage: number = req.params.page as number;
        const nextPage = Number(currentPage) + 1;
        const prevPage = currentPage -1;

        getPaginatedFoodPackages(req.params.page, 5).then((data) => {
            res.render(path.resolve('client-website/pages/food-package'), {
                page:                       'food-package',
                logged_in:                  res.logged_in == 1,
                foodPackages:               FoodPackages,
                paginationObject:           foodPackageInformation,
                pageNumber:                 currentPage,
                nextPage:                   nextPage,
                prevPage:                   prevPage,
                queryString:                urlQueryString,
                searchString:               searchString,
                queryStringWithoutSearch:   urlQueryStringWithoutSearch,
                dietary_requirements_obj:   DietaryRequirements,
                dietaryFilters:             dietaryFilters,
            })
        })
    })
}

/**
 * Gets a count of amount of pages the food packages would have for a given show per page.
 * @param showPerPage
 * @param searchQuery
 */
async function getFoodPackageCountObject(showPerPage: number, searchQuery: string | null = null, dietaryFilters: any = '') {
    let returnObject = {
        totalPackages: 0,
        totalPages: 0,
    }

    let data = DatabaseSource.getRepository(FoodPackage)
        .createQueryBuilder('foodPackage')

    if(searchQuery) data = data.where('foodPackage.name LIKE :search', {search: `%${searchQuery}%`})

    if(dietaryFilters){
        for(const filters in dietaryFilters){
            data = data.andWhere('FIND_IN_SET(:filter, dietary_requirements)', {filter: filters})
        }
    }

    data.andWhere('foodPackage.stock_status = :stockStatus', {stockStatus: StockStatus.IN_STOCK})

    returnObject.totalPackages = await data.getCount();

    returnObject.totalPages = Math.ceil(returnObject.totalPackages / showPerPage);
    return returnObject;
}

/**
 * Gets a set of food packages based on a given page number and the amount to show per page.
 * @param pageNumber
 * @param perPage
 * @param searchQuery
 * @param dietaryFilters
 */
async function getPaginatedFoodPackages(pageNumber: number, perPage: number, searchQuery: string | null = null, dietaryFilters: any = null) {
    if(pageNumber < 1){
        return []; //Return an array to inform the controller that no data was returned.
    }

    let data = DatabaseSource.getRepository(FoodPackage)
        .createQueryBuilder('foodPackage')
        .offset((pageNumber - 1) * (perPage - 1))
        .limit(perPage);

    if(searchQuery){
        data = data
            .where('foodPackage.name LIKE :search', {search: `%${searchQuery}%`})
            .orWhere('foodPackage.contents LIKE :search', {search: `%${searchQuery}%`})
            .orWhere('foodPackage.information LIKE :search', {search: `%${searchQuery}%`})
    }

    if(dietaryFilters){
        for(const filters in dietaryFilters){
            data = data.andWhere('FIND_IN_SET(:filter, dietary_requirements)', {filter: filters})
        }
    }

    data.andWhere('foodPackage.stock_status = :stockStatus', {stockStatus: StockStatus.IN_STOCK})

    return await data.getMany();
}

/**
 * Gets the dietary requirements object from the string
 * @param parameterObject
 */
function getDietaryRequirementsAsObjectFromString(parameterObject: string) {
    if(!parameterObject){
        return {};
    }

    let returnObj: any = {};

    const stringAsArray = parameterObject.split(',');
    for(let i = 0; i < stringAsArray.length; i++){
        returnObj[DietaryRequirements[stringAsArray[i] as keyof typeof DietaryRequirements]] = 1;
    }

    return returnObj
}

// ************** SINGLE FOOD PACKAGE PAGE *****************
/**
 * Render page for a single food package
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function RenderSingleFoodPackagePage(req: any, res: any, next: any) {
    getRecordById(req.params.id, FoodPackage).then((foodPackage) => {
        if(foodPackage){
            res.render(path.resolve('client-website/pages/food-package-single'), {
                food_package: foodPackage,
                page: 'food-package-single',
                user: res.currentUser,
                logged_in: res.logged_in == 1,
            })
        }else{
            res.send('An error ocurred');
        }
    })
}

/**
 * Creates a new order with data inputted from the form
 * @param req
 * @param res
 * @param next
 */
export function createUserOrder(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    console.log(req.body);
    console.log(data);
    createNewOrder(res.currentUser.id, data['food-package-input'], OrderType[data['order-type-input'].toUpperCase() as keyof typeof OrderType])
        .then((result) => {
            if(result.success === 1 && result.order){
                res.order = result.order;
                renderOrderSuccessPage(req, res, next);
            }else{
                res.send('fail, nah');
            }
        })

}