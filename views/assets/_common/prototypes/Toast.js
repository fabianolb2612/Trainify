const FormControllerPrototype = {

    serialize(form) {

        if (!(form instanceof HTMLFormElement)) {
            throw new TypeError(
                "O objeto informado não é um formulário."
            );
        }

        const formData = new FormData(form);

        return Object.fromEntries(formData.entries());
    },


    validateRequired(form, fields = []) {

        const data = this.serialize(form);

        for (const field of fields) {

            const value = data[field];

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {
                return false;
            }
        }

        return true;
    },


    clear(form) {

        if (!(form instanceof HTMLFormElement)) {
            throw new TypeError(
                "O objeto informado não é um formulário."
            );
        }

        form.reset();
    }
};


export function createFormController() {

    return Object.create(
        FormControllerPrototype
    );
}


export default FormControllerPrototype;