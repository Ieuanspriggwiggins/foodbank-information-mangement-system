export function RedirectLoggedOutAccounts(req: any, res: any, next: any) {
    if(res.logged_in != 1){
        res.redirect('/login');
    }else{
        next();
    }
}