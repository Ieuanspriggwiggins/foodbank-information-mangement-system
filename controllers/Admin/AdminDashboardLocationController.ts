import {Repositories} from "../../datasource";
import {RestrictedLocation} from "../../entities/RestrictedLocation";
import {matchedData, validationResult} from "express-validator";
import {renderErrorPage} from "./AdminDashboardErrorController";

/**
 * Responsible for adding a new location. Responds with JSON telling the frontend whether the addition was successful or not.
 * @param req
 * @param res
 */
export function addNewLocation(req: any, res: any) {
    const location = new RestrictedLocation();
    location.minEasting = req.body.locationData['min_eastings'];
    location.maxEasting = req.body.locationData['max_eastings'];
    location.minNorthings = req.body.locationData['min_northings'];
    location.maxNorthings = req.body.locationData['max_northings'];
    location.place_name = req.body.locationData['name_1'];
    location.postcode = req.body.locationData['outcode'];
    location.county_name = req.body.locationData['county_unitary'];

    Repositories.locationRestrictionRepository.save(location).then(() => {
        res.json({success: 1});
    }).catch(() => {
        res.json({success: 0});
    })
}

/**
 * Responsible for deleting a location from the system. Responds with refreshing the configuration page if successful.
 * If not successful, go to the error page.
 * @param req
 * @param res
 */
export function deleteExistingLocation(req: any, res: any) {
    const locationId = req.params.locationId;

    Repositories.locationRestrictionRepository.findOneBy({id: locationId}).then((result) => {
        return result;
    }).then((existingLocation) => {
        if(existingLocation){
            return Repositories.locationRestrictionRepository.delete(existingLocation);
        }else{
            throw new Error('The location you attempted to delete does not exist');
        }
    }).then(() => {
        res.redirect('/admin/dashboard/configuration');
    }).catch(() => {
        renderErrorPage(req, res, 'The location you attempted to delete does not exist');
    })
}