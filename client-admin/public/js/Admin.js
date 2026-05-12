//Admin script for common functions used across the admin dashboard system, including requests and confirmations.

// function makeDeleteResourceRequest(event, targetUrl, warningString) {
//     const id = event.target.dataset.id;
//     const checkForDeletion = confirm (warningString);
//
//     if(checkForDeletion) {
//         const optionsBody = {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({id: id})
//         };
//
//         fetch(targetUrl, optionsBody).then((response) => {
//             return response.json();
//         }).then((data) => {
//             console.log(data);
//             if(data.success === 1){
//                 alert('Deleted Successfully');
//                 window.history.go(-1);
//             }else if(data.success === 0){
//                 alert('Something went wrong, please try again later');
//             }else if(data.success === -1){
//                 alert('This package cannot be deleted as it currently exists in an order. If you want the the food package to no longer appear on the website, set it to out of stock')
//             }
//         })
//     }
// }

function deleteStaffAccountRequest(event){
    makeDeleteResourceRequest(event, '/admin/api/admin-account', 'Are you sure you want to delete this account from the system?')
}

function deleteFoodPackageRequest(event) {
    makeDeleteResourceRequest(event, '/admin/api/food-package', 'Are you sure you want to delete this food package? It cannot be recovered');
}

function deleteServiceUserRequest(event) {
    makeDeleteResourceRequest(event, '/admin/api/users', 'Are you sure you want to delete this user account?');
}

function checkConfirmFormSubmit(questionString) {
    return confirm(questionString);
}