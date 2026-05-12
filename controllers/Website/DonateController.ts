import path from "path";
import {Donation} from "../../entities/Donation";
import {Repositories} from "../../datasource";

const stripe = require('stripe')(process.env.STRIPE_KEY);

/**
 * Render the donation page
 * @param req
 * @param res
 * @constructor
 */
export function RenderDonationPage(req: any, res: any) {
    res.render(path.resolve('client-website/pages/donation-page'), {
        page_title: 'Donate Today',
        logged_in: res.logged_in == 1,
        page: 'donation'
    });
}

/**
 * Creates a stripe session for the donation page stripe form
 * @param req
 * @param res
 * @constructor
 */
export function CreateDonateStripSession(req: any, res: any) {
    const fullUrl = req.protocol + "://" + req.get('host') + '/donate-return?session_id={CHECKOUT_SESSION_ID}'
    const session = stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [
            {
                price: 'price_1PD85LP5Nyhae4B5oeupjeR0',
                quantity: 1,
            }
        ],
        mode: 'payment',
        return_url: fullUrl,
        billing_address_collection: 'required',
    })

    session.then((session: any) => {
        if(session){
            res.send({clientSecret: session.client_secret})
        }
    })
}

/**
 * Render the donation complete page, used when a donation is successfully passed to the user
 * @param req
 * @param res
 * @constructor
 */
export function RenderDonationCompletePage(req: any, res: any) {
    const session = stripe.checkout.sessions.retrieve(req.query.session_id);

    session.then((session: any) => {
        if(!session) res.send('Something went wrong, please try again later');
        const userDetails = session.customer_details;
        const donationAddressDetails = userDetails.address;

        const donationObject = new Donation();
        donationObject.amount_total = session.amount_total;
        donationObject.donation_email = userDetails.email;
        donationObject.donation_name = userDetails.name;
        donationObject.donation_address_city = donationAddressDetails.city;
        donationObject.donation_address_country = donationAddressDetails.country;
        donationObject.donation_address_line_1 = donationAddressDetails.line1;
        donationObject.donation_address_line_2 = donationAddressDetails.line2 !== null ? donationAddressDetails.line2 : null;
        donationObject.donation_address_postcode = donationAddressDetails.postal_code;
        donationObject.donation_address_state = donationAddressDetails.state !== null ? donationAddressDetails.state : null;
        donationObject.donation_date = new Date();

        Repositories.donationRepository.save(donationObject).then((donation) => {
            res.render(path.resolve('client-website/pages/donation-page-success'), {
                page: 'donation',
                logged_in: res.logged_in == 1,
                donation_object: donation
            })
        }).catch((err) => {
            console.log(err);
            res.send('Something went wrong, please try again later');
        })
    })
}