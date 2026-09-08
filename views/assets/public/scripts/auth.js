import Users from "../../_common/classes/Users.js";
import SessionStorage from "../../_common/scripts/storage.js";

const users = new Users();
const storage = new SessionStorage();

document.addEventListener("DOMContentLoaded", () => {
    initLoginForm();
    initRegisterForm();
    initPasswordToggle();
});


function initLoginForm() {
    const form = document.getElementById("loginForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('[type="submit"]');
        const alertEl = document.getElementById("loginAlert");

        hideAlert(alertEl);

        const email = form.email.value.trim();
        const password = form.password.value;

        if (!email || !password) {
            showAlert(
                alertEl,
                "Preencha o email e a senha.",
                "error"
            );

            return;
        }

        button.disabled = true;
        button.textContent = "Entrando...";

        try {
            /*
             * Chamada para:
             * POST /users/login
             */
            let result;

        if (email === "admin@trainify.com.br") {
            result = await users.loginAdmin(email, password);
        } else {
            result = await users.login(email, password);
    }

            if (result?.status !== "success") {
                showAlert(
                    alertEl,
                    result?.message || "Email ou senha inválidos.",
                    "error"
                );

                return;
            }

            const token = result?.data?.token;

            if (!token) {
                showAlert(
                    alertEl,
                    "A API não retornou um token de autenticação.",
                    "error"
                );

                return;
            }

    
            const user = {
                id: result.data.id,
                type_id: result.data.type_id,
                name: result.data.name,
                email: result.data.email,
                photo: result.data.photo
            };

            storage.saveSession(token, user);

            if (Number(user.type_id) === 1) {
                window.location.href = "../admin/dashboard.html";
            } else {
                window.location.href = "../app/dashboard.html";
            }
        } catch (error) {
            console.error(error);

            showAlert(
                alertEl,
                "Não foi possível conectar ao servidor. Tente novamente.",
                "error"
            );

        } finally {
            button.disabled = false;
            button.textContent = "Entrar";
        }
    });
}


function initRegisterForm() {
    const form = document.getElementById("registerForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('[type="submit"]');
        const alertEl = document.getElementById("registerAlert");

        hideAlert(alertEl);

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const cref = form.cref.value.trim();
        const password = form.password.value;
        const passwordConfirm = form.passwordConfirm.value;

        /* =========================================
           Validações frontend
           ========================================= */

        if (!name || !email || !password || !passwordConfirm) {
            showAlert(
                alertEl,
                "Preencha todos os campos obrigatórios.",
                "error"
            );

            return;
        }

        if (password.length < 8) {
            showAlert(
                alertEl,
                "A senha deve ter pelo menos 8 caracteres.",
                "error"
            );

            return;
        }

        if (password !== passwordConfirm) {
            showAlert(
                alertEl,
                "As senhas não coincidem.",
                "error"
            );

            return;
        }

        /*
         * passwordConfirm NÃO é enviado para a API.
         *
         * Ele existe somente para a validação
         * do formulário no frontend.
         */

        const data = {
            name,
            email,
            password,
            phone: phone || null,
            cref: cref || null
        };

        button.disabled = true;
        button.textContent = "Criando conta...";

        try {
            /*
             * Chamada para:
             *
             * POST /users/register
             */
            const result = await users.register(data);

            if (
                result?.status !== "success" &&
                result?.status !== "created"
            ) {
                showAlert(
                    alertEl,
                    result?.message || "Não foi possível criar a conta.",
                    "error"
                );

                return;
            }

            showAlert(
                alertEl,
                "Conta criada com sucesso! Redirecionando para o login...",
                "success"
            );

            /*
             * Depois do cadastro, vai para o login.
             */
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);

        } catch (error) {
            console.error(error);

            showAlert(
                alertEl,
                "Não foi possível conectar ao servidor. Tente novamente.",
                "error"
            );

        } finally {
            button.disabled = false;
            button.textContent = "Criar conta grátis";
        }
    });
}

function initPasswordToggle() {
    document.querySelectorAll(".toggle-password").forEach((button) => {

        button.addEventListener("click", () => {

            const wrapper = button.closest(".input-wrapper");
            const input = wrapper?.querySelector("input");

            if (!input) {
                return;
            }

            const isPassword = input.type === "password";

            input.type = isPassword
                ? "text"
                : "password";

            button.textContent = isPassword
                ? "🙈"
                : "👁";

            button.setAttribute(
                "aria-label",
                isPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
            );
        });

    });
}




function showAlert(element, message, type) {

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `alert alert-${type} show`;
}


function hideAlert(element) {

    if (!element) {
        return;
    }

    element.textContent = "";
    element.className = "alert";
}