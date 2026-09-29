/**
 * TrainiFy - student-workouts.js
 * Gerenciamento dos treinos do aluno.
 */

import Workout from "../../_common/classes/Workout.js";
import WorkoutService from "../../_common/services/WorkoutService.js";
import WorkoutDayService from "../../_common/services/WorkoutDayService.js";
import SessionStorage from "../../_common/scripts/storage.js";

import StudentWorkoutDays
    from "./student-workout-days.js";

import {
    createFormController
} from "../../_common/prototypes/FormController.js";

import {
    createToast
} from "../../_common/prototypes/Toast.js";


/*
 * Protótipos reutilizáveis.
 *
 * Os objetos são criados com Object.create(),
 * demonstrando programação prototipal.
 */
const workoutFormController =
    createFormController();

const workoutToast =
    createToast();


export default class StudentWorkouts {

    constructor({
        student,
        storage = new SessionStorage()
    }) {

        this.student = student;
        this.storage = storage;

        this.workoutService =
            new WorkoutService();

        this.workoutDayService =
            new WorkoutDayService();

        this.workouts = [];

        this.daysManager =
            new StudentWorkoutDays({
                getWorkouts: () => this.workouts,
                getStudent: () => this.student,
                storage: this.storage
            });

        this.configureServices();
    }


    configureServices() {

        const token =
            this.storage.getToken();

        if (!token) {

            window.location.href =
                "../public/login.html";

            return false;
        }

        this.workoutService
            .setAuthToken(token);

        this.workoutDayService
            .setAuthToken(token);

        this.daysManager
            .configureServices(token);

        return true;
    }


    async load() {

        const section =
            document.getElementById(
                "workoutSection"
            );

        if (!section) {
            return;
        }

        section.innerHTML = `
            <div class="card">
                <div
                    style="
                        text-align:center;
                        padding:32px;
                    "
                >
                    <span class="spinner"></span>

                    <p
                        style="
                            color:var(--clr-grey-500);
                            margin-top:12px;
                        "
                    >
                        Carregando treinos...
                    </p>
                </div>
            </div>
        `;

        try {

            const response =
                await this.workoutService.list();

            const responseStatus =
                String(
                    response?.status ||
                    response?.type ||
                    ""
                ).toLowerCase();

            const successStatuses = [
                "success",
                "ok"
            ];

            if (
                !response ||
                !successStatuses.includes(
                    responseStatus
                )
            ) {

                workoutToast.showResponse(
                    response,
                    "Não foi possível carregar os treinos."
                );

                const error =
                    new Error(
                        response?.message ||
                        "Não foi possível carregar os treinos."
                    );

                error.__toastDisplayed = true;

                throw error;
            }

            const workouts =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            this.workouts =
                workouts.filter(
                    workout =>
                        Number(workout.studentId) ===
                        Number(this.student.id)
                );

            for (const workout of this.workouts) {

                await this.daysManager.load(
                    workout
                );
            }

            this.render();

            const currentSection =
                document.getElementById(
                    "workoutSection"
                );

            if (currentSection) {

                currentSection
                    .__trainifyWorkoutManager =
                    this;
            }

        } catch (error) {

            console.error(
                "ERRO AO CARREGAR TREINOS:",
                error
            );

            if (
                !error.__toastDisplayed
            ) {

                workoutToast.showError(
                    error.message ||
                    "Erro ao carregar treinos."
                );
            }

            section.innerHTML = `
                <div class="card">
                    <p style="color:#f87171;">
                        ${escapeHtml(
                            error.message ||
                            "Erro ao carregar treinos."
                        )}
                    </p>
                </div>
            `;
        }
    }


    render() {

        const section =
            document.getElementById(
                "workoutSection"
            );

        if (!section) {
            return;
        }

        section.innerHTML = `
            <div class="workout-section">

                <div class="workout-section-header">

                    <div>

                        <h3
                            style="
                                font-size:1rem;
                                font-weight:700;
                            "
                        >
                            🏋 Treinos do aluno
                        </h3>

                        <div
                            style="
                                font-size:.8rem;
                                color:var(--clr-grey-500);
                                margin-top:2px;
                            "
                        >
                            ${this.workouts.length}

                            ${
                                this.workouts.length === 1
                                    ? "treino cadastrado"
                                    : "treinos cadastrados"
                            }
                        </div>

                    </div>


                    <button
                        class="btn btn-primary btn-sm"
                        type="button"
                        data-action="add-workout"
                    >
                        + Novo treino
                    </button>

                </div>


                ${
                    this.workouts.length === 0
                        ? this.emptyState()
                        : this.workouts
                            .map(workout =>
                                this.renderCard(workout)
                            )
                            .join("")
                }

            </div>
        `;
    }


    emptyState() {

        return `
            <div
                class="card"
                style="
                    margin-top:16px;
                    text-align:center;
                "
            >

                <p
                    style="
                        color:var(--clr-grey-500);
                        margin-bottom:16px;
                    "
                >
                    Este aluno ainda não possui nenhum treino.
                </p>


                <button
                    class="btn btn-primary"
                    type="button"
                    data-action="add-workout"
                >
                    + Criar primeiro treino
                </button>

            </div>
        `;
    }


    renderCard(workout) {

        const days =
            Array.isArray(workout.days)
                ? workout.days
                : [];

        const exerciseCount =
            days.reduce(
                (total, day) =>
                    total +
                    (
                        Array.isArray(day.exercises)
                            ? day.exercises.length
                            : 0
                    ),
                0
            );

        return `
            <div
                class="workout-section"
                style="margin-top:16px;"
            >

                <div class="workout-section-header">

                    <div>

                        <h3
                            style="
                                font-size:1rem;
                                font-weight:700;
                            "
                        >
                            🏋
                            ${escapeHtml(workout.name)}
                        </h3>


                        <div
                            style="
                                font-size:.8rem;
                                color:var(--clr-grey-500);
                                margin-top:4px;
                            "
                        >
                            ${escapeHtml(
                                workout.description ||
                                "Sem descrição."
                            )}
                        </div>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:8px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            class="btn btn-ghost btn-sm"
                            type="button"
                            data-action="view-workout-details"
                            data-workout-id="${workout.id}"
                        >
                            Ver detalhes
                        </button>


                        <button
                            class="btn btn-outline btn-sm"
                            type="button"
                            data-action="edit-workout"
                            data-workout-id="${workout.id}"
                        >
                            ✏ Editar
                        </button>


                        <button
                            class="btn btn-danger btn-sm"
                            type="button"
                            data-action="remove-workout"
                            data-workout-id="${workout.id}"
                        >
                            ✕
                        </button>

                    </div>

                </div>


                ${
                    days.length
                        ? days
                            .map(day =>
                                this.daysManager
                                    .renderPreview(day)
                            )
                            .join("")
                        : `
                            <div
                                style="
                                    padding:20px;
                                    color:var(--clr-grey-500);
                                "
                            >
                                Nenhum dia de treino cadastrado.
                            </div>
                        `
                }


                <div
                    style="
                        margin-top:12px;
                        font-size:.8rem;
                        color:var(--clr-grey-500);
                    "
                >
                    ${days.length}

                    ${
                        days.length === 1
                            ? "dia"
                            : "dias"
                    }

                    ·

                    ${exerciseCount}

                    ${
                        exerciseCount === 1
                            ? "exercício"
                            : "exercícios"
                    }
                </div>

            </div>
        `;
    }


    find(id) {

        return this.workouts.find(
            workout =>
                Number(workout.id) ===
                Number(id)
        );
    }


    openForm(workoutId = null) {

        const workout =
            workoutId
                ? this.find(workoutId)
                : null;

        const modal =
            document.getElementById(
                "workoutModal"
            );

        const title =
            document.getElementById(
                "workoutModalTitle"
            );

        const subtitle =
            document.getElementById(
                "workoutModalSubtitle"
            );

        const body =
            document.getElementById(
                "workoutModalBody"
            );

        if (
            !modal ||
            !title ||
            !subtitle ||
            !body
        ) {
            return;
        }

        title.textContent =
            workout
                ? "Editar treino"
                : "Novo treino";

        subtitle.textContent =
            workout
                ? "Altere os dados do treino e gerencie seus dias."
                : "Cadastre um novo treino para o aluno.";

        body.innerHTML = `

            <form
                id="workoutForm"
                style="
                    display:grid;
                    gap:16px;
                "
            >

                <div class="form-group">

                    <label>
                        Nome do treino *
                    </label>

                    <input
                        class="form-control"
                        name="name"
                        required
                        value="${escapeAttribute(
                            workout?.name || ""
                        )}"
                        placeholder="Treino A — Hipertrofia"
                    />

                </div>


                <div class="form-group">

                    <label>
                        Descrição
                    </label>

                    <textarea
                        class="form-control"
                        name="description"
                        placeholder="Descreva o objetivo do treino..."
                    >${escapeHtml(
                        workout?.description || ""
                    )}</textarea>

                </div>


                <div class="form-group">

                    <label>
                        Frequência
                    </label>

                    <input
                        class="form-control"
                        name="frequency"
                        value="${escapeAttribute(
                            workout?.frequency || ""
                        )}"
                        placeholder="Ex.: 5x por semana"
                    />

                </div>


                ${
                    workout
                        ? this.renderWorkoutDaysEditor(workout)
                        : `
                            <div
                                class="card"
                                style="
                                    margin-top:8px;
                                    padding:20px;
                                    text-align:center;
                                "
                            >

                                <strong>
                                    Dias do treino
                                </strong>

                                <p
                                    style="
                                        color:var(--clr-grey-500);
                                        margin-top:6px;
                                    "
                                >
                                    Primeiro crie o treino.
                                    Depois você poderá adicionar
                                    os dias e exercícios.
                                </p>

                            </div>
                        `
                }


                <div
                    id="workoutFormMessage"
                    style="
                        display:none;
                        padding:12px;
                        border-radius:8px;
                        font-size:.85rem;
                    "
                ></div>


                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:8px;
                        margin-top:8px;
                    "
                >

                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="close-workout-modal"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        ${
                            workout
                                ? "Salvar alterações"
                                : "Criar treino"
                        }
                    </button>

                </div>

            </form>
        `;


        modal.classList.remove("hidden");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document
            .getElementById("workoutForm")
            ?.addEventListener(
                "submit",
                event =>
                    this.saveForm(
                        event,
                        workout
                    )
            );
    }


    renderWorkoutDaysEditor(workout) {

        const days =
            Array.isArray(workout.days)
                ? workout.days
                : [];

        return `

            <div
                style="
                    margin-top:8px;
                    padding-top:20px;
                    border-top:1px solid var(--clr-border);
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:12px;
                        margin-bottom:16px;
                    "
                >

                    <div>

                        <h3
                            style="
                                font-size:1rem;
                                font-weight:700;
                            "
                        >
                            Dias do treino
                        </h3>

                        <p
                            style="
                                color:var(--clr-grey-500);
                                font-size:.8rem;
                                margin-top:4px;
                            "
                        >
                            Adicione os dias e os exercícios.
                        </p>

                    </div>


                    <button
                        class="btn btn-outline btn-sm"
                        type="button"
                        data-action="add-workout-day"
                        data-workout-id="${workout.id}"
                    >
                        + Adicionar dia
                    </button>

                </div>


                <div id="workoutDaysContainer">

                    ${
                        days.length === 0
                            ? `
                                <div
                                    class="card"
                                    style="
                                        padding:28px;
                                        text-align:center;
                                    "
                                >

                                    <p
                                        style="
                                            color:var(--clr-grey-500);
                                            margin-bottom:16px;
                                        "
                                    >
                                        Nenhum dia adicionado ainda.
                                    </p>


                                    <button
                                        class="btn btn-outline"
                                        type="button"
                                        data-action="add-workout-day"
                                        data-workout-id="${workout.id}"
                                    >
                                        + Adicionar primeiro dia
                                    </button>

                                </div>
                            `
                            : days
                                .map(day =>
                                    this.daysManager
                                        .renderModal(day)
                                )
                                .join("")
                    }

                </div>

            </div>
        `;
    }


    async saveForm(event, workout) {

        event.preventDefault();

        const form =
            event.currentTarget;


        /*
         * Utiliza o protótipo FormController
         * para transformar o formulário em objeto.
         */
        const data =
            workoutFormController.serialize(
                form
            );


        /*
         * Validação utilizando o protótipo.
         */
        if (
            !workoutFormController.validateRequired(
                form,
                ["name"]
            )
        ) {

            workoutToast.showWarning(
                "Informe o nome do treino."
            );

            return;
        }


        const name =
            data.name?.trim();


        try {

            const workoutObject =
                new Workout({

                    id:
                        workout?.id ??
                        null,

                    studentId:
                        this.student.id,

                    goalId:
                        this.student.goalId ??
                        null,

                    trainingLevelId:
                        this.student.trainingLevelId ??
                        null,

                    name,

                    description:
                        data.description?.trim() ||
                        "",

                    frequency:
                        data.frequency?.trim() ||
                        ""
                });


            const response =
                workout
                    ? await this.workoutService.update(
                        workout.id,
                        workoutObject
                    )
                    : await this.workoutService.create(
                        workoutObject
                    );


            console.log(
                "RESPOSTA AO SALVAR TREINO:",
                response
            );


            const responseStatus =
                String(
                    response?.status ||
                    response?.type ||
                    ""
                ).toLowerCase();


            const successStatuses = [
                "success",
                "created",
                "updated",
                "ok"
            ];


            if (
                !response ||
                !successStatuses.includes(
                    responseStatus
                )
            ) {

                workoutToast.showResponse(
                    response,
                    "Não foi possível salvar o treino."
                );

                return;
            }


            /*
             * Fecha o modal após a criação/edição.
             */
            this.closeModal();


            /*
             * Recarrega os treinos pela API.
             *
             * Isso atualiza a lista sem precisar
             * atualizar a página inteira.
             */
            await this.load();


            /*
             * Mostra a mensagem de sucesso.
             */
            workoutToast.showSuccess(
                workout
                    ? "Treino atualizado com sucesso!"
                    : "Treino criado com sucesso!"
            );


        } catch (error) {

            console.error(
                "ERRO AO SALVAR TREINO:",
                error
            );

            workoutToast.showError(
                error.message ||
                "Erro ao salvar treino."
            );
        }
    }


    getFormMessage(form) {

        let message =
            form.querySelector(
                ".form-message"
            );

        if (!message) {

            message =
                document.createElement(
                    "div"
                );

            message.className =
                "form-message";

            form.prepend(
                message
            );
        }

        return message;
    }


    async remove(id) {

        const workout =
            this.find(id);

        if (!workout) {

            workoutToast.showWarning(
                "Treino não encontrado."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Remover o treino "${workout.name}"?\n\n` +
                "Os dias e exercícios relacionados também serão afetados."
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await this.workoutService.remove(
                    id
                );


            const responseStatus =
                String(
                    response?.status ||
                    response?.type ||
                    ""
                ).toLowerCase();


            const successStatuses = [
                "success",
                "deleted",
                "ok"
            ];


            if (
                !response ||
                !successStatuses.includes(
                    responseStatus
                )
            ) {

                workoutToast.showResponse(
                    response,
                    "Não foi possível remover o treino."
                );

                return;
            }


            await this.load();


            workoutToast.showSuccess(
                "Treino removido com sucesso."
            );

        } catch (error) {

            console.error(
                "ERRO AO REMOVER TREINO:",
                error
            );

            workoutToast.showError(
                error.message ||
                "Erro ao remover treino."
            );
        }
    }


    async openModal(id) {

        const workout =
            this.find(id);

        if (!workout) {

            workoutToast.showWarning(
                "Treino não encontrado."
            );

            return;
        }


        const modal =
            document.getElementById(
                "workoutModal"
            );

        const title =
            document.getElementById(
                "workoutModalTitle"
            );

        const subtitle =
            document.getElementById(
                "workoutModalSubtitle"
            );

        const body =
            document.getElementById(
                "workoutModalBody"
            );


        if (
            !modal ||
            !title ||
            !subtitle ||
            !body
        ) {
            return;
        }


        title.textContent =
            workout.name;


        subtitle.textContent =
            workout.description ||
            "Detalhes do treino";


        const days =
            Array.isArray(workout.days)
                ? workout.days
                : [];


        body.innerHTML = `

            <div>

                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        margin-bottom:16px;
                    "
                >

                    <button
                        class="btn btn-primary btn-sm"
                        type="button"
                        data-action="add-workout-day"
                        data-workout-id="${workout.id}"
                    >
                        + Adicionar dia
                    </button>

                </div>


                ${
                    days.length === 0
                        ? `
                            <div
                                style="
                                    text-align:center;
                                    padding:30px;
                                    color:var(--clr-grey-500);
                                "
                            >
                                Nenhum dia cadastrado.

                                <br><br>

                                <small>
                                    Adicione um dia para depois
                                    cadastrar os exercícios.
                                </small>
                            </div>
                        `
                        : days
                            .map(day =>
                                this.daysManager
                                    .renderModal(day)
                            )
                            .join("")
                }

            </div>
        `;


        modal.classList.remove(
            "hidden"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    closeModal() {

        const modal =
            document.getElementById(
                "workoutModal"
            );

        if (!modal) {
            return;
        }


        if (
            document.activeElement &&
            modal.contains(
                document.activeElement
            )
        ) {

            document
                .activeElement
                .blur();
        }


        modal.classList.add(
            "hidden"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    async refresh(id) {

        await this.load();

        await this.openModal(
            id
        );
    }


    async handleAction(
        action,
        data
    ) {

        switch (action) {

            case "add-workout":

                this.openForm();

                break;


            case "view-workout-details":

                await this.openModal(
                    Number(
                        data.workoutId
                    )
                );

                break;


            case "edit-workout":

                this.openForm(
                    Number(
                        data.workoutId
                    )
                );

                break;


            case "remove-workout":

                await this.remove(
                    Number(
                        data.workoutId
                    )
                );

                break;


            case "close-workout-modal":

                this.closeModal();

                break;


            default:

                await this.daysManager
                    .handleAction(
                        action,
                        data
                    );

                break;
        }
    }


    showMessage(
        message,
        type = "error"
    ) {

        const form =
            document.getElementById(
                "workoutForm"
            );

        if (!form) {
            return;
        }


        let messageBox =
            form.querySelector(
                ".form-message"
            );


        if (!messageBox) {

            messageBox =
                document.createElement(
                    "div"
                );

            messageBox.className =
                "form-message";

            form.prepend(
                messageBox
            );
        }


        messageBox.textContent =
            message;

        messageBox.className =
            `form-message ${type}`;
    }
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function escapeHtml(value = "") {

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


function escapeAttribute(value = "") {

    return escapeHtml(
        value
    );
}