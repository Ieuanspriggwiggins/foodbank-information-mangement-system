import {matchedData, validationResult} from "express-validator";
import {DatabaseSource, Repositories} from "../../datasource";
import {RequiredItem} from "../../entities/RequiredItem";
import {renderErrorPage} from "./AdminDashboardErrorController";

/**
 * Responsible for adding a new required food item to the website. (These items appear on the frontend website).
 * @param req
 * @param res
 * @param next
 */
export function addNewRequiredFoodItem(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0) renderErrorPage(req, res, 'The required item you attempted to add is invalid')

    if(!data.new_item_input) res.redirect('/admin/dashboard/error');

    const requiredItem = new RequiredItem();
    requiredItem.itemString = data.new_item_input;

    Repositories.requiredItemRepository.save(requiredItem).then((result) => {
        if(result) {
            res.redirect(req.get('referer'));
        }
    }).catch((err) => {
        console.log(err);
        renderErrorPage(req, res, 'Something went wrong when processing the request.')
    })
}

/**
 * Responsible for remove a required food item from the list on the website.
 * @param req
 * @param res
 * @param next
 */
export function removeRequiredFoodItem(req: any, res: any, next: any) {
    const requiredItemId = req.params.itemId;

    //Get the required item from the id
    Repositories.requiredItemRepository.findOneBy({id: requiredItemId}).then((item) => {
        if(item){
            return Repositories.requiredItemRepository.delete(item);
        }else{
            throw new Error('Something went wrong and the item could not be deleted')
        }
    }).then((result) => {
        if(result.affected && result.affected < 1) throw new Error('The required item could not be deleted');
        res.redirect(req.get('referer'));
    }).catch(() => {
        renderErrorPage(req, res, 'The required item could not be deleted at this time.')
    })
}