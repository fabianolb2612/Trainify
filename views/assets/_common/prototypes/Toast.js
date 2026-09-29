/**
 * TrainiFy - Toast.js
 * Protótipo reutilizável para mensagens do sistema.
 *
 * Utiliza Object.create() em vez de class.
 */

const ToastPrototype = {

    show(message, type = "success", duration = 3500) {

        const validTypes = [
            "success",
            "warning",
            "error"
        ];

        if (!validTypes.includes(type)) {
            type = "error";
        }

        this.ensureContainer();

        const toast =
            document.createElement("div");

        toast.className =
            `trainify-toast trainify-toast-${type}`;

        const icon =
            this.getIcon(type);

        toast.innerHTML = `
            <div class="trainify-toast-icon">
                ${icon}
            </div>

            <div class="trainify-toast-content">
                ${this.escapeHtml(message)}
            </div>

            <button
                type="button"
                class="trainify-toast-close"
                aria-label="Fechar"
            >
                ×
            </button>
        `;

        const container =
            document.getElementById(
                "trainifyToastContainer"
            );

        if (!container) {
            return;
        }

        container.appendChild(toast);

        const closeButton =
            toast.querySelector(
                ".trainify-toast-close"
            );

        closeButton?.addEventListener(
            "click",
            () => this.remove(toast)
        );

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        if (duration > 0) {

            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }
    },


    showSuccess(message, duration = 3500) {

        this.show(
            message,
            "success",
            duration
        );
    },


    showWarning(message, duration = 3500) {

        this.show(
            message,
            "warning",
            duration
        );
    },


    showError(message, duration = 4500) {

        this.show(
            message,
            "error",
            duration
        );
    },


    showResponse(
        response,
        fallbackMessage = "Ocorreu um erro."
    ) {

        if (!response) {

            this.showError(
                fallbackMessage
            );

            return;
        }


        const status =
            String(
                response.status ||
                response.type ||
                ""
            ).toLowerCase();


        /*
         * Status de sucesso utilizados
         * pela API do TrainiFy.
         */
        const successStatuses = [
            "success",
            "created",
            "updated",
            "deleted",
            "ok"
        ];


        /*
         * Status de aviso.
         */
        const warningStatuses = [
            "warning",
            "pending"
        ];


        /*
         * Status de erro.
         */
        const errorStatuses = [
            "error",
            "failed",
            "failure"
        ];


        if (
            successStatuses.includes(
                status
            )
        ) {

            this.showSuccess(
                response.message ||
                "Operação realizada com sucesso."
            );

            return;
        }


        if (
            warningStatuses.includes(
                status
            )
        ) {

            this.showWarning(
                response.message ||
                "Atenção: verifique os dados informados."
            );

            return;
        }


        if (
            errorStatuses.includes(
                status
            )
        ) {

            this.showError(
                response.message ||
                fallbackMessage
            );

            return;
        }


        /*
         * Resposta inesperada:
         * nunca deixamos o erro desaparecer
         * silenciosamente.
         */
        this.showError(
            response.message ||
            fallbackMessage
        );
    },


    ensureContainer() {

        let container =
            document.getElementById(
                "trainifyToastContainer"
            );

        if (container) {
            return container;
        }


        container =
            document.createElement("div");

        container.id =
            "trainifyToastContainer";

        container.className =
            "trainify-toast-container";


        document.body.appendChild(
            container
        );


        this.injectStyles();


        return container;
    },


    injectStyles() {

        if (
            document.getElementById(
                "trainifyToastStyles"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "trainifyToastStyles";


        style.textContent = `
            .trainify-toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 99999;

                display: flex;
                flex-direction: column;
                gap: 12px;

                width: min(
                    380px,
                    calc(100vw - 32px)
                );

                pointer-events: none;
            }


            .trainify-toast {
                display: flex;
                align-items: center;
                gap: 12px;

                min-height: 56px;

                padding: 14px 16px;

                border: 1px solid;
                border-radius: 10px;

                background:
                    var(
                        --clr-bg-card,
                        #171717
                    );

                box-shadow:
                    0 10px 30px
                    rgba(0, 0, 0, .35);

                font-size: .9rem;
                line-height: 1.4;

                opacity: 0;

                transform:
                    translateX(30px);

                transition:
                    opacity .25s ease,
                    transform .25s ease;

                pointer-events: auto;
            }


            .trainify-toast.show {
                opacity: 1;

                transform:
                    translateX(0);
            }


            .trainify-toast-success {
                border-color:
                    rgba(34, 197, 94, .45);

                color:
                    #4ade80;
            }


            .trainify-toast-warning {
                border-color:
                    rgba(234, 179, 8, .45);

                color:
                    #facc15;
            }


            .trainify-toast-error {
                border-color:
                    rgba(239, 68, 68, .45);

                color:
                    #f87171;
            }


            .trainify-toast-icon {
                display: flex;
                align-items: center;
                justify-content: center;

                width: 28px;
                height: 28px;

                flex-shrink: 0;

                font-size: 1rem;
                font-weight: 700;
            }


            .trainify-toast-content {
                flex: 1;
            }


            .trainify-toast-close {
                border: 0;

                background: transparent;

                color: currentColor;

                font-size: 1.3rem;
                line-height: 1;

                cursor: pointer;

                opacity: .7;

                padding: 2px 4px;
            }


            .trainify-toast-close:hover {
                opacity: 1;
            }


            @media (max-width: 600px) {

                .trainify-toast-container {
                    top: 16px;
                    right: 16px;
                    left: 16px;

                    width: auto;
                }


                .trainify-toast {
                    width: 100%;
                }
            }
        `;


        document.head.appendChild(
            style
        );
    },


    remove(toast) {

        if (!toast) {
            return;
        }


        toast.classList.remove(
            "show"
        );


        setTimeout(() => {

            toast.remove();

        }, 250);
    },


    clear() {

        const container =
            document.getElementById(
                "trainifyToastContainer"
            );


        if (!container) {
            return;
        }


        container
            .querySelectorAll(
                ".trainify-toast"
            )
            .forEach(
                toast => {
                    this.remove(toast);
                }
            );
    },


    getIcon(type) {

        switch (type) {

            case "success":
                return "✓";

            case "warning":
                return "⚠";

            case "error":
                return "✕";

            default:
                return "!";
        }
    },


    escapeHtml(value = "") {

        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }
};


/**
 * Cria um novo objeto utilizando
 * ToastPrototype como protótipo.
 */
export function createToast() {

    return Object.create(
        ToastPrototype
    );
}


export default ToastPrototype;