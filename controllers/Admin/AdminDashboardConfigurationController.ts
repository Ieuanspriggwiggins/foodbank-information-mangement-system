import {Repositories} from "../../datasource";
import path from "path";
import {renderErrorPage} from "./AdminDashboardErrorController";
import {AdminRole} from "../../entities/AdminUser";

/**
 * Renders the configuration page
 * @param req
 * @param res
 */
export function renderConfigurationDashboardPage(req: any, res: any) {
    const getRequiredItemsPromise = Repositories.requiredItemRepository.find();
    const getRestrictedLocationsPromise = Repositories.locationRestrictionRepository.find();

    //Once the promises are both returned, run the anonymous function
    Promise.all([getRequiredItemsPromise, getRestrictedLocationsPromise]).then((resultData) => {
        const requiredItems = resultData[0];
        const restrictedLocations = resultData[1];

        //If one of the promises returns null or undefined, through an error
        if(!requiredItems || !restrictedLocations) throw new Error('An error occurred when loading this page. Some or all of the data could not be received')

        //Render the past
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-configuration'), {
            user: req.currentUser,
            title: 'Configuration',
            selected: 'configuration',
            tableData: req.tableData ? req.tableData : false,
            data: {
                requiredItems: requiredItems,
                isAdmin: req.currentUser.user_role[0] === AdminRole.ADMINISTRATOR,
                restrictedLocations: restrictedLocations
            }
        })
    }).catch((err) => {
        console.log(err);
        //Redirect to the error page.
        renderErrorPage(req, res, 'Something went wrong when loading the configuration page. Please contact support');
    })
}