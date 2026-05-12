import {DietaryRequirements, FoodPackage, StockStatus} from "../../entities/FoodPackage";
import {Repositories} from "../../datasource";
import {matchedData, validationResult} from "express-validator";
import path from "path";
import {renderErrorPage} from "./AdminDashboardErrorController";


/**
 * Render food package dashboard page
 * @param req
 * @param res
 */
export function renderFoodPackageDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-foodPackages'), {
        user: req.currentUser,
        title: 'Food Package',
        selected: 'food_packages',
        tableData: req.tableData ? req.tableData : false,
    })
}

/**
 * Render page for creating a food package
 * @param req
 * @param res
 */
export function renderCreateFoodPackagePage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-foodPackageCreate'), {
        user: req.currentUser,
        title: 'Create Food Package',
        selected: 'food_package',
        tableData: req.tableData ? req.tableData : false,
    })
}

/**
 * Render page for viewing a specific food package on the system
 * @param req
 * @param res
 */
export function renderSpecificFoodPackageDashboardPage(req: any, res: any) {
    const id = req.params.packageId;
    if(!id) res.redirect('/admin/dashboard/error');

    //Get the current food package
    Repositories.foodPackageRepository.findOneBy({id: id}).then((foodPackage) => {
        if(!foodPackage) throw new Error('The requested food package does not exist'); //If null or undefined, throw neww
        //Render page
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-foodPackageView'), {
            user: req.currentUser,
            title: 'View Food Package',
            selected: 'food_packages',
            tableData: req.tableData ? req.tableData : false,
            data: {
                FoodPackage: foodPackage
            }
        })
    }).catch((err) => {
        //If error is thrown, render the error page
        console.log(err);
        renderErrorPage(req, res, 'The food package requested does not exist. Please try again later.');
    })
}

/**
 * Render page for editing an existing food package on the esystem
 * @param req
 * @param res
 */
export function renderEditFoodPackageDashboardPage(req: any, res: any) {
    const id = req.params.packageId;
    if(!id) res.redirect('/admin/dashboard/error');

    Repositories.foodPackageRepository.findOneBy({id: id}).then((foodPackage) => {
        if(!foodPackage) throw new Error('The food package requested for the page doesn\'t exist');

        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-foodPackageEdit'), {
            user: req.currentUser,
            title: 'Edit Food Package',
            selected: 'food_packages',
            tableData: req.tableData ? req.tableData : false,
            data: {
                FoodPackage: foodPackage
            }
        })
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The food package you attempted to edit does not exist.')
    })
}

/**
 * Controller for managing the creation of food packages on the system
 * @param req
 * @param res
 */
export function createFoodPackageController(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) renderErrorPage(req, res, 'The food package could not be created');

    //Get the dietary requirements
    const dietaryRequirements = getDietaryRequirementsFromBody(data);

    //Create the food package entity and insert the details
    const newFoodPackage = new FoodPackage();
    newFoodPackage.name = data['food-package-name'];
    newFoodPackage.information = data['food-package-information'];
    newFoodPackage.contents = data['food-package-contents'];
    newFoodPackage.dietary_requirements = dietaryRequirements;

    Repositories.foodPackageRepository.save(newFoodPackage).then((result) => {
        if(result) {
            res.redirect('/admin/dashboard/food-packages');
        }else{
            throw new Error('The food package could not be saved')
        }
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The food package could not be created');
    })
}

/**
 * endpoint for deleting a food package from the system
 * @param req 
 * @param res 
 */
export function deleteFoodPackageController(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) renderErrorPage(req, res, 'The food package could not be deleted');

    if(data['id']){
        Repositories.foodPackageRepository.delete({id: data['id']}).then(() => {
            res.redirect('/admin/dashboard/food-packages');
        }).catch((err) => {
            console.log(err);
            renderErrorPage(req, res, 'Something went wrong when processing the request')
            //Check if the error occurs because of food package being used in a relationship with order.
            Repositories.orderRepository.findOneBy({food_package: {id: data['id']}}).then((result) => {
                //If an order was found with this food package, send -1 as the error for the frontend.
                renderErrorPage(req, res, 'The food package you attempted to delete has order(s) placed with it and therefore cannot be deleted at this time.' +
                    'Alternatively, you can set the food package to be Out of Stock which will remove the ability to order said package')
            })
        })
    }
}

/**
 *
 * @param req
 * @param res
 */
export function updateFoodPackageController(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) renderErrorPage(req, res, 'The food package could not be updated');

    Repositories.foodPackageRepository.findOneBy({id: data['food-package-id']}).then((foodPackage) => {
        if(!foodPackage) throw new Error('Something went wrong and the food package being updated could not be found.');
        const dietaryRequirements = getDietaryRequirementsFromBody(data);

        foodPackage.name = data['food-package-name'];
        foodPackage.information = data['food-package-information'];
        foodPackage.contents = data['food-package-contents'];
        foodPackage.dietary_requirements = dietaryRequirements;
        foodPackage.stock_status = StockStatus[data['food-package-status'].toUpperCase() as keyof typeof StockStatus];

        return Repositories.foodPackageRepository.save(foodPackage);

    }).then(() => {
        res.redirect('/admin/dashboard/food-packages');
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'The food package you attempted to update does not exist');
    })
}

/**
 *
 * @param body - the body object from the request.
 */
function getDietaryRequirementsFromBody(body: any): DietaryRequirements[] {
    const array: DietaryRequirements[] = [];

    const pushMap = new Map<string, DietaryRequirements>([
        ['dairy-free-check', DietaryRequirements.DAIRY_FREE],
        ['nut-free-check', DietaryRequirements.NUT_FREE],
        ['gluten-free-check', DietaryRequirements.GLUTEN_FREE],
        ['vegan-check', DietaryRequirements.VEGAN],
        ['vegetarian-check', DietaryRequirements.VEGETARIAN],
        ['pescatarian-check', DietaryRequirements.PESCATARIAN],
        ['fish-free-check', DietaryRequirements.FISH],
        ['halal-check', DietaryRequirements.HALAL]
    ]);

    for(const [key] of Object.entries(body)){
        if(pushMap.get(key)){
            array.push(pushMap.get(key)!); //We can explicit say it is not null as we have checked for it already.
        }
    }

    return array;
}