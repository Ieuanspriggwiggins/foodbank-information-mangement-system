import path from "path";
import {DatabaseSource} from "../../datasource";
import {RequiredItem} from "../../entities/RequiredItem";
import {matchedData, validationResult} from "express-validator";
import {ContactTicket, ContactTicketType} from "../../entities/ContactTicket";

export function RenderHelpUsPage(req: any, res: any, next: any) {
    res.render(path.resolve('client-website/pages/help-us'), {
        page: 'help-us',
        logged_in: res.logged_in == 1
    })
}

export function RenderVolunteeringPage(req: any, res: any, next: any) {
    res.render(path.resolve('client-website/pages/help-us-volunteer'), {
        page: 'help-us',
        logged_in: res.logged_in == 1
    })
}

export function RenderDonateFoodPage(req: any, res: any, next: any) {
    const requiredFoodItems = DatabaseSource.getRepository(RequiredItem)
        .createQueryBuilder()
        .getMany()

    requiredFoodItems.then((items) => {
        res.render(path.resolve('client-website/pages/help-us-donateFood'), {
            page: 'help-us',
            logged_in: res.logged_in == 1,
            required_items: items,
            submissionSuccess: req.query.success == 1
        })
    })
}

/**
 * Form submission for donating food to the food bank
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export function DonateFoodFormSubmissionController(req: any, res: any, next: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length > 0){
        res.send('An error has occurred, please try again later');
        return res.end();
    }

    const insertContactTicketPromise = DatabaseSource.createQueryBuilder()
        .insert()
        .into(ContactTicket)
        .values([{
            name: data['name-input'],
            organisation: data['org-input'],
            contact_email: data['email-input'],
            contact_number: data['phone-input'],
            message: data['message-input'],
            ticket_type: ContactTicketType.FOOD_DONATION,
            date_received: new Date()
        }]).execute()

    insertContactTicketPromise.then(() => {
        res.redirect('/help-us/donate-food?success=1')
    }).catch((err) => {
        console.log('error');
        res.send('Error! Something went wrong');
    })
}