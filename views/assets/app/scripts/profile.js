import Users from "../../_common/classes/Users.js";
import StudentService from "../../_common/services/StudentService.js";
import WorkoutService from "../../_common/services/WorkoutService.js";
import SessionStorage from "../../_common/scripts/storage.js";


const users = new Users();
const studentService = new StudentService();
const workoutService = new WorkoutService();
const storage = new SessionStorage();


let originalProfile = null;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const token = storage.getToken();

    if (!token) {
        window.location.href = "../public/login.html";
        return;
    }

    users.setAuthToken(token);
    studentService.setAuthToken(token);
    workoutService.setAuthToken(token);

    initProfileActions();

    await loadProfile();
});


/* =========================================================
   CARREGAR PERFIL
========================================================= */

async function loadProfile() {

    try {

        const user = storage.getUser();

        if (!user) {
            window.location.href = "../public/login.html";
            return;
        }

        originalProfile = {
            id: user.id ?? null,
            type_id: user.type_id ?? user.typeId ?? 2,
            name: user.name || "",
            email: user.email || "",
            photo: user.photo || null,
            cref: user.cref || "",
            phone: user.phone || "",
            city: user.city || "",
            bio: user.bio || "",
            specialty: user.specialty || ""
        };

        populateProfile(originalProfile);

        await loadProfileStats();

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR PERFIL:",
            error
        );

        showToast(
            "Não foi possível carregar o perfil.",
            "error"
        );
    }
}


/* =========================================================
   PREENCHER PERFIL
========================================================= */

function populateProfile(profile) {

    setValue(
        "profileName",
        profile.name
    );

    setValue(
        "profileEmail",
        profile.email
    );

    setValue(
        "profilePhone",
        profile.phone
    );

    setValue(
        "profileCref",
        profile.cref
    );

    setValue(
        "profileCity",
        profile.city
    );

    setValue(
        "profileSpecialty",
        profile.specialty
    );

    setValue(
        "profileBio",
        profile.bio
    );


    const sidebarName =
        document.getElementById(
            "profileSidebarName"
        );

    if (sidebarName) {

        sidebarName.textContent =
            profile.name ||
            "Personal Trainer";
    }


    setAvatarInitials(
        profile.name
    );

    updateTopbar(
        profile.name
    );

    updateSidebar(
        profile.name
    );
}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

async function loadProfileStats() {

    try {

        const [
            studentsResponse,
            workoutsResponse
        ] = await Promise.all([

            studentService.list(),

            workoutService.list()

        ]);


        const students =
            Array.isArray(
                studentsResponse?.data
            )
                ? studentsResponse.data
                : [];


        const workouts =
            Array.isArray(
                workoutsResponse?.data
            )
                ? workoutsResponse.data
                : [];


        setValue(
            "statStudents",
            students.length
        );

        setValue(
            "statWorkouts",
            workouts.length
        );

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR ESTATÍSTICAS:",
            error
        );

        setValue(
            "statStudents",
            0
        );

        setValue(
            "statWorkouts",
            0
        );
    }
}


/* =========================================================
   AÇÕES DO PERFIL
========================================================= */

function initProfileActions() {

    const form =
        document.getElementById(
            "profileForm"
        );


    const cancelBtn =
        document.getElementById(
            "profileCancelBtn"
        );


    const deleteBtn =
        document.getElementById(
            "deleteAccountBtn"
        );


    form?.addEventListener(
        "submit",
        handleProfileSubmit
    );


    cancelBtn?.addEventListener(
        "click",
        handleProfileCancel
    );


    deleteBtn?.addEventListener(
        "click",
        handleAccountDelete
    );
}


/* =========================================================
   SALVAR ALTERAÇÕES
========================================================= */

async function handleProfileSubmit(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const name =
        form.profileName.value.trim();


    const email =
        form.profileEmail.value.trim();


    if (!name) {

        showToast(
            "O nome é obrigatório.",
            "error"
        );

        return;
    }


    if (!email) {

        showToast(
            "O email é obrigatório.",
            "error"
        );

        return;
    }


    try {

        const saveButton =
            document.getElementById(
                "profileSaveBtn"
            );


        setButtonLoading(
            saveButton,
            true,
            "Salvando..."
        );


        const data = {

            name,

            email,

            cref:
                form.profileCref.value.trim(),

            phone:
                form.profilePhone.value.trim(),

            city:
                form.profileCity.value.trim(),

            bio:
                form.profileBio.value.trim(),

            specialty:
                form.profileSpecialty.value.trim()
        };


        const response =
            await users.update(data);


        console.log(
            "RESPOSTA AO ATUALIZAR PERFIL:",
            response
        );


        if (
            response?.status !== "success"
        ) {

            showToast(
                response?.message ||
                "Não foi possível atualizar o perfil.",
                "error"
            );

            return;
        }


        /*
         * A API retorna os dados atualizados
         * do usuário.
         */
        const updatedUser =
            response.data;


        const token =
            storage.getToken();


        /*
         * Atualiza os dados da sessão
         * mantendo o token atual.
         */
        storage.saveSession(
            token,
            {
                id:
                    updatedUser.id,

                type_id:
                    updatedUser.type_id ??
                    updatedUser.typeId ??
                    originalProfile.type_id,

                name:
                    updatedUser.name || "",

                email:
                    updatedUser.email || "",

                photo:
                    updatedUser.photo || null,

                cref:
                    updatedUser.cref || "",

                phone:
                    updatedUser.phone || "",

                city:
                    updatedUser.city || "",

                bio:
                    updatedUser.bio || "",

                specialty:
                    updatedUser.specialty || ""
            }
        );


        /*
         * Atualiza o perfil usado
         * pelo botão Cancelar.
         */
        originalProfile = {

            id:
                updatedUser.id,

            type_id:
                updatedUser.type_id ??
                updatedUser.typeId ??
                originalProfile.type_id,

            name:
                updatedUser.name || "",

            email:
                updatedUser.email || "",

            photo:
                updatedUser.photo || null,

            cref:
                updatedUser.cref || "",

            phone:
                updatedUser.phone || "",

            city:
                updatedUser.city || "",

            bio:
                updatedUser.bio || "",

            specialty:
                updatedUser.specialty || ""
        };


        populateProfile(
            originalProfile
        );


        showToast(
            "Perfil atualizado com sucesso!",
            "success"
        );

    } catch (error) {

        console.error(
            "ERRO AO ATUALIZAR PERFIL:",
            error
        );


        showToast(
            error.message ||
            "Erro ao atualizar o perfil.",
            "error"
        );

    } finally {

        const saveButton =
            document.getElementById(
                "profileSaveBtn"
            );


        setButtonLoading(
            saveButton,
            false,
            "Salvar Alterações"
        );
    }
}


/* =========================================================
   CANCELAR ALTERAÇÕES
========================================================= */

function handleProfileCancel() {

    if (!originalProfile) {
        return;
    }


    populateProfile(
        originalProfile
    );


    showToast(
        "Alterações descartadas.",
        "info"
    );
}


/* =========================================================
   EXCLUIR CONTA
========================================================= */

async function handleAccountDelete() {

    const confirmed =
        confirm(
            "Tem certeza que deseja excluir sua conta?\n\n" +
            "Essa ação é permanente e não poderá ser desfeita."
        );


    if (!confirmed) {
        return;
    }


    const secondConfirmation =
        confirm(
            "Confirme novamente: deseja realmente excluir sua conta?"
        );


    if (!secondConfirmation) {
        return;
    }


    try {

        const deleteButton =
            document.getElementById(
                "deleteAccountBtn"
            );


        setButtonLoading(
            deleteButton,
            true,
            "Excluindo..."
        );


        const response =
            await users.deleteAccount();


        console.log(
            "RESPOSTA AO EXCLUIR CONTA:",
            response
        );


        if (
            response?.status !== "success"
        ) {

            showToast(
                response?.message ||
                "Não foi possível excluir sua conta.",
                "error"
            );

            return;
        }


        /*
         * Remove a sessão local.
         */
        storage.clearSession();


        alert(
            "Sua conta foi excluída com sucesso."
        );


        /*
         * Volta para o login.
         */
        window.location.href =
            "../public/login.html";

    } catch (error) {

        console.error(
            "ERRO AO EXCLUIR CONTA:",
            error
        );


        showToast(
            error.message ||
            "Erro ao excluir a conta.",
            "error"
        );

    } finally {

        const deleteButton =
            document.getElementById(
                "deleteAccountBtn"
            );


        setButtonLoading(
            deleteButton,
            false,
            "Excluir minha conta"
        );
    }
}


/* =========================================================
   VALOR DOS CAMPOS
========================================================= */

function setValue(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    if (

        element.tagName === "INPUT" ||

        element.tagName === "TEXTAREA" ||

        element.tagName === "SELECT"

    ) {

        element.value =
            value ?? "";

    } else {

        element.textContent =
            value ?? "";
    }
}


/* =========================================================
   INICIAIS DO AVATAR
========================================================= */

function setAvatarInitials(name = "") {

    const element =
        document.getElementById(
            "profileAvatarInitials"
        );


    if (!element) {
        return;
    }


    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {

        element.textContent =
            "PT";

        return;
    }


    const initials =

        parts.length > 1

            ? parts[0][0] +
              parts[parts.length - 1][0]

            : parts[0].slice(0, 2);


    element.textContent =
        initials.toUpperCase();
}


/* =========================================================
   TOPBAR
========================================================= */

function updateTopbar(name = "") {

    const element =
        document.getElementById(
            "topbarUserName"
        );


    if (!element) {
        return;
    }


    const firstName =
        name
            .trim()
            .split(/\s+/)[0];


    element.textContent =
        firstName || "";
}


/* =========================================================
   SIDEBAR
========================================================= */

function updateSidebar(name = "") {

    const nameElement =
        document.getElementById(
            "sidebarUserName"
        );


    const initialsElement =
        document.getElementById(
            "sidebarUserInitials"
        );


    if (nameElement) {

        nameElement.textContent =
            name ||
            "Personal Trainer";
    }


    if (initialsElement) {

        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!parts.length) {

            initialsElement.textContent =
                "PT";

            return;
        }


        const initials =

            parts.length > 1

                ? parts[0][0] +
                  parts[parts.length - 1][0]

                : parts[0].slice(0, 2);


        initialsElement.textContent =
            initials.toUpperCase();
    }
}


/* =========================================================
   LOADING DOS BOTÕES
========================================================= */

function setButtonLoading(
    button,
    loading,
    loadingText
) {

    if (!button) {
        return;
    }


    if (loading) {

        /*
         * Guarda o texto original somente
         * na primeira vez.
         */
        if (!button.dataset.originalText) {

            button.dataset.originalText =
                button.textContent;
        }


        button.disabled = true;

        button.textContent =
            loadingText;

    } else {

        button.disabled = false;

        button.textContent =
            button.dataset.originalText ||
            loadingText;
    }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    let container =
        document.querySelector(
            ".toast-container"
        );


    if (!container) {

        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement("div");


    toast.className =
        `toast ${type}`;


    const icons = {

        success: "✓",

        error: "✕",

        info: "ℹ"
    };


    toast.innerHTML = `
        <span class="toast-icon">
            ${icons[type] || "•"}
        </span>

        <span>
            ${message}
        </span>
    `;


    container.appendChild(
        toast
    );


    setTimeout(() => {

        toast.classList.add(
            "hide"
        );


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);
}