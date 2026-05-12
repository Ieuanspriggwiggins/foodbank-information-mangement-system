"use strict";
let passwordInput = document.getElementById('password_input');
let passwordInputConfirm = document.getElementById('password_confirm_input');
let submitBtn = document.getElementById('submit-btn');
let errorText = document.getElementById('error');
//When either of the password fields change, compare the passwword and confirm entry to check if they match
const onPasswordChange = (event) => {
    if (passwordInput.value !== passwordInputConfirm.value) {
        errorText.innerHTML = 'Password does not match.';
        submitBtn.disabled = true;
    }
    else {
        errorText.innerHTML = '';
        submitBtn.disabled = false;
    }
};
//Add event listeners to the password fields if they exist on the page.
if (passwordInput && passwordInputConfirm) {
    passwordInput.addEventListener('input', onPasswordChange);
    passwordInputConfirm.addEventListener('input', onPasswordChange);
}
