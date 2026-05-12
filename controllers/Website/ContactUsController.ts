import path from "path";
import {matchedData, validationResult} from "express-validator";
import {Repositories} from "../../datasource";
import {ContactTicket, ContactTicketType} from "../../entities/ContactTicket";

/**
 * Responsible for rendering the contact page for the userr
 * @param req
 * @param res
 * @constructor
 */
export function RenderContactUsPage(req: any, res: any) {
    res.render(path.resolve('client-website/pages/contact-page'), {
        page: 'contact-us',
        logged_in: res.logged_in == 1,
        form_submit: req.query.success == 1,
    })
}

/**
 * Creates a contact ticket entity and submits it to the database based on the input from the user.
 * @param req
 * @param res
 * @constructor
 */
export function ContactUsFormController(req: any, res: any) {
    const errors = validationResult(req);
    const data = matchedData(req);

    if(errors['errors'].length){
        res.send('Something went wrong when submitting the form. Please try again later');
    }

    //Create the contact ticket
    const contactTicket = new ContactTicket();
    contactTicket.contact_email = data['email-input'];
    contactTicket.contact_number = data['phone-input'];
    contactTicket.name = data['name-input'];
    contactTicket.message = data['message-input'];
    contactTicket.date_received = new Date();
    contactTicket.ticket_type = ContactTicketType.CONTACT_FORM;
    contactTicket.organisation = 'none';

    //Save it in the database
    Repositories.contactTicketRepository.save(contactTicket).then((result) => {
        res.status(200).redirect('/contact-us?success=1');
    }).catch((err) => {
        console.log(err);
        res.send('Something went wrong when submitting the form');
    })

}