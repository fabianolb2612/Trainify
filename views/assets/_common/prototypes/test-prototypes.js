import {
    createToast
} from "./Toast.js";

import {
    createFormController
} from "./FormController.js";


const toastA = createToast();
const toastB = createToast();

const formA = createFormController();
const formB = createFormController();


console.log(
    "Toast compartilha protótipo:",
    Object.getPrototypeOf(toastA) ===
    Object.getPrototypeOf(toastB)
);


console.log(
    "FormController compartilha protótipo:",
    Object.getPrototypeOf(formA) ===
    Object.getPrototypeOf(formB)
);