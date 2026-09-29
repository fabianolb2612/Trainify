/**
 * TrainiFy - student-workout-days.js
 * Gerenciamento dos dias dos treinos.
 */

import WorkoutDay
    from "../../_common/classes/WorkoutDay.js";

import WorkoutDayService
    from "../../_common/services/WorkoutDayService.js";

import StudentWorkoutExercises
    from "./student-workout-exercises.js";


export default class StudentWorkoutDays {

    constructor({
        getWorkouts,
        getStudent,
        storage
    }) {
        this.getWorkouts = getWorkouts;
        this.getStudent = getStudent;
        this.storage = storage;

        this.workoutDayService =
            new WorkoutDayService();

        this.exercisesManager =
            new StudentWorkoutExercises({
                getWorkouts: this.getWorkouts,
                storage: this.storage
            });
    }


    configureServices(token) {
        this.workoutDayService.setAuthToken(token);
        this.exercisesManager.configureServices(token);
    }


    async load(workout) {
        try {
            const response =
                await this.workoutDayService.listByWorkout(
                    workout.id
                );

            if (
                !response ||
                (
                    response.status !== "success" &&
                    response.type !== "success"
                )
            ) {
                workout.days = [];
                return;
            }

            workout.days =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            for (const day of workout.days) {
                await this.exercisesManager.load(day);
            }

        } catch (error) {
            console.error(
                "ERRO AO CARREGAR DIAS:",
                error
            );

            workout.days = [];
        }
    }


    find(dayId) {
        for (const workout of this.getWorkouts()) {
            const days =
                Array.isArray(workout.days)
                    ? workout.days
                    : [];

            const day =
                days.find(
                    item =>
                        Number(item.id) ===
                        Number(dayId)
                );

            if (day) {
                return {
                    id: day.id,
                    workoutId: workout.id,
                    name: day.name,
                    displayOrder:
                        day.displayOrder ??
                        day.display_order ??
                        day.order ??
                        1,
                    exercises:
                        day.exercises || []
                };
            }
        }

        return null;
    }


    renderPreview(day) {
        const exercises =
            Array.isArray(day.exercises)
                ? day.exercises
                : [];

        return `
            <div class="workout-day">

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:12px;
                    "
                >

                    <div>

                        <div class="day-label">
                            ${escapeHtml(day.name)}
                        </div>

                        <div
                            style="
                                font-size:.75rem;
                                color:var(--clr-grey-500);
                                margin-top:3px;
                            "
                        >
                            ${exercises.length}
                            ${
                                exercises.length === 1
                                    ? "exercício"
                                    : "exercícios"
                            }
                        </div>

                    </div>

                </div>

                <div class="exercise-list">

                    ${
                        exercises.length === 0
                            ? `
                                <div
                                    style="
                                        padding:12px 0;
                                        color:var(--clr-grey-500);
                                    "
                                >
                                    Nenhum exercício cadastrado.
                                </div>
                            `
                            : exercises
                                .map(
                                    exercise =>
                                        this.exercisesManager.renderPreview(
                                            exercise
                                        )
                                )
                                .join("")
                    }

                </div>

            </div>
        `;
    }


    renderModal(day) {
        const exercises =
            Array.isArray(day.exercises)
                ? day.exercises
                : [];

        return `
            <section
                class="modal-workout-day"
                style="margin-bottom:20px;"
            >

                <div class="modal-day-header">

                    <div>

                        <div class="day-label">
                            ${escapeHtml(day.name)}
                        </div>

                        <p class="modal-day-note">
                            ${exercises.length}
                            ${
                                exercises.length === 1
                                    ? "exercício"
                                    : "exercícios"
                            }
                        </p>

                    </div>

                    <div
                        style="
                            display:flex;
                            gap:6px;
                        "
                    >

                        <button
                            class="btn btn-ghost btn-sm"
                            type="button"
                            data-action="edit-workout-day"
                            data-day-id="${day.id}"
                        >
                            ✏
                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            type="button"
                            data-action="remove-workout-day"
                            data-day-id="${day.id}"
                        >
                            ✕
                        </button>

                    </div>

                </div>

                <div class="modal-exercises">

                    ${
                        exercises.length === 0
                            ? `
                                <div
                                    style="
                                        padding:16px;
                                        color:var(--clr-grey-500);
                                    "
                                >
                                    Nenhum exercício neste dia.
                                </div>
                            `
                            : exercises
                                .map(
                                    exercise =>
                                        this.exercisesManager.renderModal(
                                            exercise
                                        )
                                )
                                .join("")
                    }

                </div>

                ${
                    this.exercisesManager.getInlineFormForDay
                        ? this.exercisesManager.getInlineFormForDay(day)
                        : ""
                }

                <button
                    class="btn btn-outline btn-sm"
                    type="button"
                    style="margin-top:10px;"
                    data-action="add-day-exercise"
                    data-day-id="${day.id}"
                >
                    + Adicionar exercício
                </button>

            </section>
        `;
    }


    openForm(workoutId) {
        const modalBody =
            document.getElementById(
                "workoutModalBody"
            );

        if (!modalBody) return;

        const oldForm =
            document.getElementById(
                "workoutDayFormContainer"
            );

        if (oldForm) {
            oldForm.remove();
        }

        modalBody.insertAdjacentHTML(
            "beforeend",
            `
            <div
                class="inline-form"
                id="workoutDayFormContainer"
            >

                <div
                    id="workoutDayForm"
                    data-workout-id="${workoutId}"
                    style="
                        display:grid;
                        gap:16px;
                        padding:20px;
                        border:1px solid var(--clr-grey-200);
                        border-radius:12px;
                        margin-top:16px;
                    "
                >

                    <div>
                        <h3 style="margin:0 0 5px;">
                            Adicionar dia do treino
                        </h3>

                        <p
                            style="
                                margin:0;
                                color:var(--clr-grey-500);
                                font-size:.9rem;
                            "
                        >
                            Cadastre um novo dia para este treino.
                        </p>
                    </div>

                    <div class="form-group">

                        <label for="workoutDayName">
                            Nome do dia *
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="workoutDayName"
                            name="name"
                            placeholder="Ex.: Peito e Tríceps"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label for="workoutDayOrder">
                            Ordem do dia *
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="workoutDayOrder"
                            name="display_order"
                            value="1"
                            min="1"
                            required
                        >

                    </div>

                    <div class="form-message"></div>

                    <div
                        style="
                            display:flex;
                            justify-content:flex-end;
                            gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="btn btn-ghost"
                            data-action="cancel-workout-day"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            class="btn btn-primary"
                            id="saveWorkoutDayButton"
                        >
                            Criar dia
                        </button>

                    </div>

                </div>

            </div>
            `
        );

        const button =
            document.getElementById(
                "saveWorkoutDayButton"
            );

        if (!button) return;

        button.addEventListener(
            "click",
            async () => {
                await this.saveForm();
            }
        );
    }


    async saveForm() {
        const form =
            document.getElementById(
                "workoutDayForm"
            );

        if (!form) return;

        const workoutId =
            Number(form.dataset.workoutId);

        const name =
            form.querySelector(
                "#workoutDayName"
            )?.value.trim();

        const displayOrder =
            Number(
                form.querySelector(
                    "#workoutDayOrder"
                )?.value || 1
            );

        const message =
            this.getFormMessage(form);

        if (!name) {
            message.textContent =
                "Informe o nome do dia de treino.";

            message.className =
                "form-message error";

            return;
        }

        try {
            const day =
                new WorkoutDay({
                    workoutId,
                    name,
                    displayOrder
                });

            console.log(
                "ENVIANDO DIA:",
                day.toPayload()
            );

            const response =
                await this.workoutDayService.create(
                    day
                );

            console.log(
                "RESPOSTA AO CRIAR DIA:",
                response
            );

            if (
                !response ||
                (
                    response.type !== "success" &&
                    response.status !== "success"
                )
            ) {
                throw new Error(
                    response?.message ||
                    "Não foi possível criar o dia de treino."
                );
            }

            message.textContent =
                response.message ||
                "Dia de treino cadastrado com sucesso.";

            message.className =
                "form-message success";

            await this.reloadWorkout(
                workoutId
            );

        } catch (error) {
            console.error(
                "ERRO AO CRIAR DIA:",
                error
            );

            message.textContent =
                error.message ||
                "Erro ao criar dia de treino.";

            message.className =
                "form-message error";
        }
    }


    edit(dayId) {
        const day =
            this.find(dayId);

        if (!day) return;

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
            "Editar dia";

        subtitle.textContent =
            "Altere o nome deste dia de treino.";

        body.innerHTML = `
            <form
                id="editWorkoutDayForm"
                style="
                    display:grid;
                    gap:16px;
                "
            >

                <div class="form-group">

                    <label>
                        Nome do dia *
                    </label>

                    <input
                        class="form-control"
                        name="name"
                        required
                        value="${escapeAttribute(day.name)}"
                    />

                </div>

                <div class="form-message"></div>

                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:8px;
                    "
                >

                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="back-workout-modal"
                        data-workout-id="${day.workoutId}"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Salvar
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
            .getElementById(
                "editWorkoutDayForm"
            )
            ?.addEventListener(
                "submit",
                async event => {
                    event.preventDefault();

                    const form =
                        event.currentTarget;

                    const name =
                        new FormData(form)
                            .get("name")
                            ?.trim();

                    const message =
                        this.getFormMessage(form);

                    if (!name) {
                        message.textContent =
                            "Informe o nome do dia.";

                        message.className =
                            "form-message error";

                        return;
                    }

                    try {
                        const response =
                            await this.workoutDayService.update(
                                day.id,
                                {
                                    workoutId:
                                        day.workoutId,
                                    name,
                                    displayOrder:
                                        day.displayOrder
                                }
                            );

                        if (
                            !response ||
                            (
                                response.status !== "success" &&
                                response.type !== "success"
                            )
                        ) {
                            throw new Error(
                                response?.message ||
                                "Não foi possível atualizar o dia."
                            );
                        }

                        await this.reloadWorkout(
                            day.workoutId
                        );

                    } catch (error) {
                        message.textContent =
                            error.message ||
                            "Erro ao atualizar o dia.";

                        message.className =
                            "form-message error";
                    }
                }
            );
    }


    async remove(dayId) {
        const day =
            this.find(dayId);

        if (!day) return;

        const confirmed =
            window.confirm(
                `Remover o dia "${day.name}"?\n\n` +
                "Os exercícios deste dia também serão removidos."
            );

        if (!confirmed) return;

        try {
            const response =
                await this.workoutDayService.remove(
                    dayId
                );

            if (
                !response ||
                (
                    response.status !== "success" &&
                    response.type !== "success"
                )
            ) {
                throw new Error(
                    response?.message ||
                    "Não foi possível remover o dia."
                );
            }

            await this.reloadWorkout(
                day.workoutId
            );

        } catch (error) {
            console.error(
                "ERRO AO REMOVER DIA:",
                error
            );

            alert(
                error.message ||
                "Erro ao remover dia."
            );
        }
    }


    async reloadWorkout(workoutId) {
        const workout =
            this.getWorkouts().find(
                item =>
                    Number(item.id) ===
                    Number(workoutId)
            );

        if (!workout) return;

        await this.load(workout);

        const manager =
            this.getWorkoutManager();

        if (!manager) return;

        manager.render();

        await manager.openModal(
            workoutId
        );
    }


    getWorkoutManager() {
        const section =
            document.getElementById(
                "workoutSection"
            );

        return section
            ? section.__trainifyWorkoutManager || null
            : null;
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

            form.prepend(message);
        }

        return message;
    }


    async handleAction(action, data) {
        switch (action) {

            case "add-workout-day":
                this.openForm(
                    Number(data.workoutId)
                );
                break;


            case "cancel-workout-day": {
                const form =
                    document.getElementById(
                        "workoutDayFormContainer"
                    );

                if (form) {
                    form.remove();
                }

                break;
            }


            case "edit-workout-day":
                this.edit(
                    Number(data.dayId)
                );
                break;


            case "remove-workout-day":
                await this.remove(
                    Number(data.dayId)
                );
                break;


            case "back-workout-modal": {
                const manager =
                    this.getWorkoutManager();

                if (manager) {
                    await manager.openModal(
                        Number(data.workoutId)
                    );
                }

                break;
            }


            case "add-day-exercise":
            case "edit-day-exercise":
            case "remove-day-exercise":
            case "confirm-remove-day-exercise":
            case "cancel-exercise-form":

                await this.exercisesManager.handleAction(
                    action,
                    data
                );

                break;


            default:
                console.warn(
                    "Ação não reconhecida em StudentWorkoutDays:",
                    action,
                    data
                );
                break;
        }
    }
}


function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value = "") {
    return escapeHtml(value);
}