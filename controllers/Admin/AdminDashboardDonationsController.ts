import path from "path";
import {Repositories} from "../../datasource";

/**
 * Render the donation dashbboard page.
 * @param req
 * @param res
 */
export function renderDonationsDashboardPage(req: any, res: any) {
    res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-donations'), {
        user: req.currentUser,
        title: 'Donations',
        selected: 'donations',
    })
}

/**
 * Render the specific donation dashboard page
 * @param req
 * @param res
 */
export function renderSpecificDonationDashboardPage(req: any, res: any) {
    const donationId = req.params.id;

    //Get the donation object by the ID and parse it through to the view
    Repositories.donationRepository.findOneBy({id: donationId}).then((donationObject) => {
        res.render(path.resolve('client-admin/pages/dashboard-pages/dashboard-donationsView'), {
            user: req.currentUser,
            title: 'View Donation',
            selected: 'donations',
            donationObject: donationObject
        })
    })
}