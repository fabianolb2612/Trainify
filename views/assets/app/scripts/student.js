import Student from "../../_common/classes/Student.js";
import StudentService from "../../_common/services/StudentService.js";

import Workout from "../../_common/classes/Workout.js";
import WorkoutService from "../../_common/services/WorkoutService.js";
import WorkoutDayExercise from "../../_common/classes/WorkoutDayExercise.js";

import WorkoutDayService from "../../_common/services/WorkoutDayService.js";
import ExerciseService from "../../_common/services/ExerciseService.js";
import WorkoutDayExerciseService from "../../_common/services/WorkoutDayExerciseService.js";

import WorkoutDayExercise
    from "../../_common/classes/WorkoutDayExercise.js";

import SessionStorage
    from "../../_common/scripts/storage.js";


const studentService =
    new StudentService();

const workoutService =
    new WorkoutService();

const workoutDayService =
    new WorkoutDayService();

const exerciseService =
    new ExerciseService();

const workoutDayExerciseService =
    new WorkoutDayExerciseService();

const storage =
    new SessionStorage();


let currentStudent = null;

let currentWorkouts = [];

let exerciseCatalog = [];


/**
 * Inicialização
 */
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const newStudent =
            params.get("new");

        const studentId =
            params.get("id");


        if (newStudent === "1") {

            renderNewStudentForm();

            initStudentActions();

            return;
        }


        if (studentId) {

            await loadStudent(studentId);

            initStudentActions();

            return;
        }


        window.location.href =
            "students.html";
    }
);


/**
 * Configura autenticação nos serviços.
 */
function configureServices() {

    const token =
        storage.getToken();

    if (!token) {

        window.location.href =
            "../public/login.html";

        return false;
    }


    studentService.setAuthToken(token);

    workoutService.setAuthToken(token);

    workoutDayService.setAuthToken(token);

    exerciseService.setAuthToken(token);

    workoutDayExerciseService.setAuthToken(token);

    return true;
}


/**
 * Carrega aluno e seus treinos.
 */
async function loadStudent(studentId) {

    try {

        if (!configureServices()) {
            return;
        }


        const response =
            await studentService.find(
                studentId
            );


        if (
            !response ||
            response.status !== "success"
        ) {

            alert(
                response?.message ||
                "Não foi possível carregar o aluno."
            );

            window.location.href =
                "students.html";

            return;
        }


        currentStudent =
            response.data;


        console.log(
            "ALUNO CARREGADO DA API:",
            currentStudent
        );


        renderStudentProfile(
            currentStudent
        );


        await loadStudentWorkouts(
            Number(studentId)
        );


    } catch (error) {

        console.error(
            "ERRO AO CARREGAR ALUNO:",
            error
        );

        alert(
            error.message ||
            "Erro ao carregar os dados do aluno."
        );

        window.location.href =
            "students.html";
    }
}


/**
 * Carrega os treinos do aluno.
 */
async function loadStudentWorkouts(
    studentId
) {

    const section =
        document.getElementById(
            "workoutSection"
        );


    if (!section) {
        return;
    }


    section.innerHTML = `
        <div class="card">
            <div style="text-align:center;padding:32px;">
                <span class="spinner"></span>
                <p style="color:var(--clr-grey-500);margin-top:12px;">
                    Carregando treinos...
                </p>
            </div>
        </div>
    `;


    try {

        const response =
            await workoutService.list();


        if (
            !response ||
            response.status !== "success"
        ) {

            throw new Error(
                response?.message ||
                "Não foi possível carregar os treinos."
            );
        }


        const workouts =
            Array.isArray(response.data)
                ? response.data
                : [];


        currentWorkouts =
            workouts.filter(
                workout =>
                    Number(workout.studentId) ===
                    Number(studentId)
            );


        for (
            const workout
            of currentWorkouts
        ) {

            await loadWorkoutDays(
                workout
            );
        }


        renderWorkouts();


    } catch (error) {

        console.error(
            "ERRO AO CARREGAR TREINOS:",
            error
        );


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


/**
 * Carrega os dias de um treino.
 */
async function loadWorkoutDays(
    workout
) {

    try {

        const response =
            await workoutDayService
                .listByWorkout(
                    workout.id
                );


        if (
            !response ||
            response.status !== "success"
        ) {

            workout.days = [];

            return;
        }


        const days =
            Array.isArray(response.data)
                ? response.data
                : [];


        workout.days = days;


        for (
            const day
            of workout.days
        ) {

            await loadWorkoutDayExercises(
                day
            );
        }


    } catch (error) {

        console.error(
            "ERRO AO CARREGAR DIAS:",
            error
        );

        workout.days = [];
    }
}


/**
 * Carrega exercícios de um dia.
 */
async function loadWorkoutDayExercises(
    day
) {

    try {

        const response =
            await workoutDayExerciseService
                .listByWorkoutDay(
                    day.id
                );


        if (
            !response ||
            response.status !== "success"
        ) {

            day.exercises = [];

            return;
        }


        day.exercises =
            Array.isArray(response.data)
                ? response.data
                : [];


    } catch (error) {

        console.error(
            "ERRO AO CARREGAR EXERCÍCIOS:",
            error
        );

        day.exercises = [];
    }
}


/**
 * Renderiza perfil do aluno.
 */
function renderStudentProfile(
    student
) {

    document.title =
        `${student.name} — TrainiFy`;


    const titleEl =
        document.getElementById(
            "topbarTitle"
        );


    if (titleEl) {

        titleEl.textContent =
            student.name;
    }


    const container =
        document.getElementById(
            "studentContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="profile-hero">

            <div class="profile-avatar-lg">
                ${initials(student.name)}
            </div>


            <div class="profile-meta">

                <div class="profile-name">
                    ${escapeHtml(student.name)}
                </div>


                <div class="profile-tags">

                    <span class="badge badge-info">
                        ${escapeHtml(
                            student.trainingLevel ||
                            student.training_level ||
                            "—"
                        )}
                    </span>


                    ${
                        student.gym
                            ? `
                                <span class="badge badge-info">
                                    ${escapeHtml(
                                        student.gym
                                    )}
                                </span>
                            `
                            : ""
                    }


                    <span class="badge ${
                        Number(student.active) === 1
                            ? "badge-neon"
                            : "badge-warn"
                    }">

                        ${
                            Number(student.active) === 1
                                ? "Ativo"
                                : "Inativo"
                        }

                    </span>

                </div>

            </div>


            <div class="profile-actions">

                <button
                    class="btn btn-ghost btn-sm"
                    type="button"
                    data-action="edit-student"
                >
                    ✏ Editar
                </button>


                <button
                    class="btn btn-outline btn-sm"
                    type="button"
                    data-action="export-student-pdf"
                >
                    ↓ Exportar PDF
                </button>


                <button
                    class="btn btn-danger btn-sm"
                    type="button"
                    data-action="remove-student"
                >
                    ✕ Remover
                </button>

            </div>

        </div>


        <div class="info-grid">

            <div class="info-block">
                <div class="info-block-label">
                    Email
                </div>

                <div class="info-block-value">
                    ${escapeHtml(student.email || "—")}
                </div>
            </div>


            <div class="info-block">
                <div class="info-block-label">
                    Telefone
                </div>

                <div class="info-block-value">
                    ${escapeHtml(student.phone || "—")}
                </div>
            </div>


            <div class="info-block">
                <div class="info-block-label">
                    Data de Nascimento
                </div>

                <div class="info-block-value">
                    ${fmtDate(student.birthdate)}
                </div>
            </div>


            <div class="info-block">
                <div class="info-block-label">
                    Academia
                </div>

                <div class="info-block-value">
                    ${escapeHtml(student.gym || "—")}
                </div>
            </div>


            <div class="info-block">
                <div class="info-block-label">
                    Objetivo
                </div>

                <div class="info-block-value">
                    ${escapeHtml(
                        student.goal || "—"
                    )}
                </div>
            </div>

        </div>


        <div class="notes-card">

            <h3>
                📋 Observações / Lesões / Dificuldades
            </h3>


            <div class="notes-text">

                ${
                    student.notes
                        ? escapeHtml(student.notes)
                        : `
                            <span
                                style="
                                    color:var(--clr-grey-500)
                                "
                            >
                                Nenhuma observação registrada.
                            </span>
                        `
                }

            </div>

        </div>


        <div id="workoutSection"></div>
    `;
}


/**
 * Renderiza todos os treinos.
 */
function renderWorkouts() {

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
                            font-size:0.8rem;
                            color:var(--clr-grey-500);
                            margin-top:2px;
                        "
                    >
                        ${currentWorkouts.length}
                        ${
                            currentWorkouts.length === 1
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
                currentWorkouts.length === 0
                    ? `
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
                                Este aluno ainda não possui
                                nenhum treino.
                            </p>

                            <button
                                class="btn btn-primary"
                                type="button"
                                data-action="add-workout"
                            >
                                + Criar primeiro treino
                            </button>

                        </div>
                    `
                    : currentWorkouts
                        .map(
                            workout =>
                                renderWorkoutCard(
                                    workout
                                )
                        )
                        .join("")
            }

        </div>
    `;
}


/**
 * Renderiza um treino.
 */
function renderWorkoutCard(
    workout
) {

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

            <div
                class="workout-section-header"
            >

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
                            font-size:0.8rem;
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
                days.length === 0
                    ? `
                        <div
                            style="
                                padding:20px;
                                color:var(--clr-grey-500);
                            "
                        >
                            Nenhum dia de treino cadastrado.
                        </div>
                    `
                    : days
                        .map(
                            day =>
                                renderWorkoutDayPreview(
                                    day
                                )
                        )
                        .join("")
            }


            <div
                style="
                    margin-top:12px;
                    font-size:0.8rem;
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


/**
 * Renderiza preview de um dia.
 */
function renderWorkoutDayPreview(
    day
) {

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
                            font-size:0.75rem;
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
                                    renderExerciseRow(
                                        exercise
                                    )
                            )
                            .join("")
                }

            </div>

        </div>
    `;
}


/**
 * Renderiza uma linha de exercício.
 */
function renderExerciseRow(
    exercise
) {

    const name =
        exercise.exerciseName ||
        exercise.exercise?.name ||
        `Exercício #${exercise.exerciseId}`;


    return `

        <div class="exercise-row">

            <div class="exercise-name">
                ${escapeHtml(name)}
            </div>


            <div class="exercise-meta">
                <span>
                    ${exercise.sets}
                </span>
                Séries
            </div>


            <div class="exercise-meta">
                <span>
                    ${escapeHtml(exercise.reps)}
                </span>
                Reps
            </div>


            <div class="exercise-meta">
                <span>
                    ${exercise.restSeconds}s
                </span>
                Descanso
            </div>

        </div>
    `;
}


/**
 * Ações gerais.
 */
function initStudentActions() {

    document.body.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            try {

                switch (action) {

                    case "edit-student":
                        editStudent();
                        break;


                    case "export-student-pdf":
                        alert(
                            "A exportação do PDF será integrada posteriormente."
                        );
                        break;


                    case "remove-student":
                        await confirmDelete();
                        break;


                    case "add-workout":
                        openWorkoutForm();
                        break;


                    case "view-workout-details":
                        await openWorkoutModal(
                            Number(
                                button.dataset.workoutId
                            )
                        );
                        break;


                    case "edit-workout":
                        openWorkoutForm(
                            Number(
                                button.dataset.workoutId
                            )
                        );
                        break;


                    case "remove-workout":
                        await removeWorkout(
                            Number(
                                button.dataset.workoutId
                            )
                        );
                        break;


                    case "close-workout-modal":
                        closeWorkoutModal();
                        break;


                    case "add-workout-day":
                        await addWorkoutDay(
                            Number(
                                button.dataset.workoutId
                            )
                        );
                        break;


                    case "edit-workout-day":
                        await editWorkoutDay(
                            Number(
                                button.dataset.dayId
                            )
                        );
                        break;


                    case "remove-workout-day":
                        await removeWorkoutDay(
                            Number(
                                button.dataset.dayId
                            )
                        );
                        break;


                    case "add-day-exercise":
                        await addDayExercise(
                            Number(
                                button.dataset.dayId
                            )
                        );
                        break;


                    case "edit-day-exercise":
                        await editDayExercise(
                            Number(
                                button.dataset.exerciseItemId
                            )
                        );
                        break;


                    case "remove-day-exercise":
                        await removeDayExercise(
                            Number(
                                button.dataset.exerciseItemId
                            )
                        );
                        break;


                    case "cancel-form":
                        window.location.href =
                            "students.html";
                        break;

                }

            } catch (error) {

                console.error(
                    "ERRO NA AÇÃO:",
                    error
                );

                alert(
                    error.message ||
                    "Não foi possível executar a ação."
                );
            }
        }
    );
}


/**
 * Edição do aluno.
 *
 * Por enquanto utiliza o mesmo formulário de cadastro,
 * preenchido com os dados atuais.
 */
function editStudent() {

    if (!currentStudent) {
        return;
    }


    renderEditStudentForm(
        currentStudent
    );
}


/**
 * Formulário de edição do aluno.
 */
function renderEditStudentForm(
    student
) {

    const titleEl =
        document.getElementById(
            "topbarTitle"
        );


    if (titleEl) {
        titleEl.textContent =
            "Editar Aluno";
    }


    const container =
        document.getElementById(
            "studentContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="card"
            style="max-width:700px;"
        >

            <h2
                style="
                    margin-bottom:var(--space-xl);
                "
            >
                Editar Aluno
            </h2>


            <div
                id="studentFormMessage"
                style="
                    margin-bottom:var(--space-md);
                "
            ></div>


            <form id="editStudentForm">

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:var(--space-md);
                    "
                >

                    <div
                        class="form-group"
                        style="grid-column:1/-1"
                    >

                        <label>
                            Nome Completo *
                        </label>

                        <input
                            class="form-control"
                            name="name"
                            required
                            value="${escapeAttribute(
                                student.name || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>Email</label>

                        <input
                            class="form-control"
                            name="email"
                            type="email"
                            value="${escapeAttribute(
                                student.email || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>Telefone</label>

                        <input
                            class="form-control"
                            name="phone"
                            value="${escapeAttribute(
                                student.phone || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>Academia</label>

                        <input
                            class="form-control"
                            name="gym"
                            value="${escapeAttribute(
                                student.gym || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>Nível de Treino *</label>

                        <select
                            class="form-control"
                            name="training_level_id"
                            required
                        >

                            <option value="1"
                                ${
                                    Number(
                                        student.trainingLevelId
                                    ) === 1
                                        ? "selected"
                                        : ""
                                }
                            >
                                Iniciante
                            </option>

                            <option value="2"
                                ${
                                    Number(
                                        student.trainingLevelId
                                    ) === 2
                                        ? "selected"
                                        : ""
                                }
                            >
                                Intermediário
                            </option>

                            <option value="3"
                                ${
                                    Number(
                                        student.trainingLevelId
                                    ) === 3
                                        ? "selected"
                                        : ""
                                }
                            >
                                Avançado
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Data de Nascimento
                        </label>

                        <input
                            class="form-control"
                            name="birthdate"
                            type="date"
                            value="${escapeAttribute(
                                student.birthdate || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            ID do Objetivo
                        </label>

                        <input
                            class="form-control"
                            name="goal_id"
                            type="number"
                            min="1"
                            value="${escapeAttribute(
                                student.goalId || ""
                            )}"
                        />

                    </div>


                    <div
                        class="form-group"
                        style="grid-column:1/-1"
                    >

                        <label>
                            Observações / Lesões / Dificuldades
                        </label>

                        <textarea
                            class="form-control"
                            name="notes"
                        >${escapeHtml(
                            student.notes || ""
                        )}</textarea>

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:var(--space-sm);
                        margin-top:var(--space-md);
                    "
                >

                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="cancel-edit-student"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="btn btn-primary"
                        id="updateStudentBtn"
                    >
                        Salvar alterações
                    </button>

                </div>

            </form>

        </div>
    `;


    document.body
        .querySelector(
            '[data-action="cancel-edit-student"]'
        )
        ?.addEventListener(
            "click",
            () => {

                renderStudentProfile(
                    currentStudent
                );

                renderWorkouts();
            }
        );


    document
        .getElementById("editStudentForm")
        ?.addEventListener(
            "submit",
            handleEditStudentSubmit
        );
}


/**
 * Salva edição do aluno.
 */
async function handleEditStudentSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const button =
        document.getElementById(
            "updateStudentBtn"
        );


    try {

        const formData =
            new FormData(form);


        const name =
            formData
                .get("name")
                ?.trim();


        if (!name) {

            showFormMessage(
                "Informe o nome do aluno.",
                "error"
            );

            return;
        }


        const student =
            new Student({

                name,

                email:
                    formData
                        .get("email")
                        ?.trim() || null,

                phone:
                    formData
                        .get("phone")
                        ?.trim() || null,

                birthdate:
                    formData.get(
                        "birthdate"
                    ) || null,

                gym:
                    formData
                        .get("gym")
                        ?.trim() || null,

                notes:
                    formData
                        .get("notes")
                        ?.trim() || null,

                trainingLevelId:
                    Number(
                        formData.get(
                            "training_level_id"
                        )
                    ),

                goalId:
                    formData.get("goal_id")
                        ? Number(
                            formData.get(
                                "goal_id"
                            )
                        )
                        : null
            });


        button.disabled = true;

        button.textContent =
            "Salvando...";


        const response =
            await studentService.update(
                currentStudent.id,
                student
            );


        if (
            !response ||
            response.status !== "success"
        ) {

            throw new Error(
                response?.message ||
                "Não foi possível atualizar o aluno."
            );
        }


        currentStudent =
            response.data ||
            student;


        alert(
            "Aluno atualizado com sucesso!"
        );


        renderStudentProfile(
            currentStudent
        );


        await loadStudentWorkouts(
            currentStudent.id
        );


    } catch (error) {

        console.error(
            "ERRO AO ATUALIZAR ALUNO:",
            error
        );


        showFormMessage(
            error.message ||
            "Erro ao atualizar aluno.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "Salvar alterações";
    }
}


/**
 * Formulário de novo treino.
 */
function openWorkoutForm(
    workoutId = null
) {

    const workout =
        workoutId
            ? findWorkout(
                workoutId
            )
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
            ? "Altere os dados do treino."
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


    modal.classList.remove(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document
        .getElementById(
            "workoutForm"
        )
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await saveWorkoutForm(
                    event,
                    workout
                );
            }
        );
}


/**
 * Salva treino.
 */
async function saveWorkoutForm(
    event,
    workout
) {

    const form =
        event.currentTarget;


    const data =
        new FormData(form);


    const name =
        data.get("name")
            ?.trim();


    if (!name) {

        alert(
            "Informe o nome do treino."
        );

        return;
    }


    try {

        const workoutObject =
            new Workout({

                id:
                    workout?.id ??
                    null,

                studentId:
                    currentStudent.id,

                goalId:
                    currentStudent.goalId ??
                    null,

                trainingLevelId:
                    currentStudent.trainingLevelId ??
                    null,

                name,

                description:
                    data
                        .get("description")
                        ?.trim() || "",

                frequency:
                    data
                        .get("frequency")
                        ?.trim() || ""
            });


        const response =
            workout
                ? await workoutService.update(
                    workout.id,
                    workoutObject
                )
                : await workoutService.create(
                    workoutObject
                );
console.log("RESPOSTA AO SALVAR TREINO:", response);

        if (
    !response ||
    response.type !== "success"
) {

    throw new Error(
        response?.message ||
        "Não foi possível salvar o treino."
    );
}


        alert(
            workout
                ? "Treino atualizado com sucesso!"
                : "Treino criado com sucesso!"
        );


        closeWorkoutModal();


        await loadStudentWorkouts(
            currentStudent.id
        );


    } catch (error) {

        console.error(
            "ERRO AO SALVAR TREINO:",
            error
        );

        alert(
            error.message ||
            "Erro ao salvar treino."
        );
    }
}


/**
 * Remove treino.
 */
async function removeWorkout(
    workoutId
) {

    const workout =
        findWorkout(
            workoutId
        );


    if (!workout) {
        return;
    }


    const confirmed =
        confirm(
            `Remover o treino "${workout.name}"?\n\n` +
            "Os dias e exercícios relacionados também serão afetados."
        );


    if (!confirmed) {
        return;
    }


    const response =
        await workoutService.remove(
            workoutId
        );


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível remover o treino."
        );
    }


    alert(
        "Treino removido com sucesso!"
    );


    await loadStudentWorkouts(
        currentStudent.id
    );
}


/**
 * Abre detalhes de um treino.
 */
async function openWorkoutModal(
    workoutId
) {

    const workout =
        findWorkout(
            workoutId
        );


    if (!workout) {
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
                workout.days.length === 0
                    ? `
                        <div
                            style="
                                text-align:center;
                                padding:30px;
                                color:var(--clr-grey-500);
                            "
                        >
                            Nenhum dia cadastrado.
                        </div>
                    `
                    : workout.days
                        .map(
                            day =>
                                renderWorkoutDayModal(
                                    day
                                )
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


/**
 * Renderiza dia dentro do modal.
 */
function renderWorkoutDayModal(
    day
) {

    const exercises =
        Array.isArray(day.exercises)
            ? day.exercises
            : [];


    return `

        <section
            class="modal-workout-day"
            style="
                margin-bottom:20px;
            "
        >

            <div
                class="modal-day-header"
            >

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
                        flex-wrap:wrap;
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
                                    renderModalExercise(
                                        exercise
                                    )
                            )
                            .join("")
                }

            </div>


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


/**
 * Renderiza exercício no modal.
 */
function renderModalExercise(
    exercise
) {

    const name =
        exercise.exerciseName ||
        exercise.exercise?.name ||
        `Exercício #${exercise.exerciseId}`;


    return `

        <div
            class="modal-exercise-row"
            style="
                align-items:center;
            "
        >

            <div
                style="
                    flex:1;
                    min-width:150px;
                "
            >

                <strong>
                    ${escapeHtml(name)}
                </strong>


                ${
                    exercise.notes
                        ? `
                            <div
                                style="
                                    font-size:.75rem;
                                    color:var(--clr-grey-500);
                                    margin-top:3px;
                                "
                            >
                                ${escapeHtml(
                                    exercise.notes
                                )}
                            </div>
                        `
                        : ""
                }

            </div>


            <div class="exercise-meta">
                <span>
                    ${exercise.sets}
                </span>
                séries
            </div>


            <div class="exercise-meta">
                <span>
                    ${escapeHtml(
                        exercise.reps
                    )}
                </span>
                reps
            </div>


            <div class="exercise-meta">
                <span>
                    ${exercise.restSeconds}s
                </span>
                descanso
            </div>


            <div
                style="
                    display:flex;
                    gap:4px;
                "
            >

                <button
                    class="btn btn-ghost btn-sm"
                    type="button"
                    data-action="edit-day-exercise"
                    data-exercise-item-id="${exercise.id}"
                >
                    ✏
                </button>


                <button
                    class="btn btn-danger btn-sm"
                    type="button"
                    data-action="remove-day-exercise"
                    data-exercise-item-id="${exercise.id}"
                >
                    ✕
                </button>

            </div>

        </div>
    `;
}


/**
 * Fecha modal.
 */
function closeWorkoutModal() {

    const modal =
        document.getElementById("workoutModal");

    if (!modal) {
        return;
    }

    // Remove o foco do botão que abriu/enviou o formulário
    if (
        document.activeElement &&
        modal.contains(document.activeElement)
    ) {
        document.activeElement.blur();
    }

    modal.classList.add("hidden");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/**
 * Adiciona dia ao treino.
 */
async function addWorkoutDay(
    workoutId
) {

    const name =
        prompt(
            "Nome do dia de treino:",
            "Dia A"
        );


    if (!name?.trim()) {
        return;
    }


    const workout =
        findWorkout(
            workoutId
        );


    if (!workout) {
        return;
    }


    const nextOrder =
        workout.days.length + 1;


    const response =
        await workoutDayService.create({

            workoutId:
                workoutId,

            name:
                name.trim(),

            displayOrder:
                nextOrder
        });


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível criar o dia."
        );
    }


    alert(
        "Dia de treino criado com sucesso!"
    );


    await loadStudentWorkouts(
        currentStudent.id
    );


    await openWorkoutModal(
        workoutId
    );
}


/**
 * Edita dia.
 */
async function editWorkoutDay(
    dayId
) {

    const day =
        findWorkoutDay(
            dayId
        );


    if (!day) {
        return;
    }


    const name =
        prompt(
            "Nome do dia:",
            day.name
        );


    if (!name?.trim()) {
        return;
    }


    const response =
        await workoutDayService.update(
            dayId,
            {
                workoutId:
                    day.workoutId,

                name:
                    name.trim(),

                displayOrder:
                    day.displayOrder ??
                    day.order ??
                    1
            }
        );


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível atualizar o dia."
        );
    }


    alert(
        "Dia atualizado com sucesso!"
    );


    await refreshCurrentWorkoutModal(
        day.workoutId
    );
}


/**
 * Remove dia.
 */
async function removeWorkoutDay(
    dayId
) {

    const day =
        findWorkoutDay(
            dayId
        );


    if (!day) {
        return;
    }


    const confirmed =
        confirm(
            `Remover o dia "${day.name}"?\n\n` +
            "Os exercícios deste dia também serão removidos."
        );


    if (!confirmed) {
        return;
    }


    const response =
        await workoutDayService.remove(
            dayId
        );


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível remover o dia."
        );
    }


    alert(
        "Dia removido com sucesso!"
    );


    await refreshCurrentWorkoutModal(
        day.workoutId
    );
}


/**
 * Adiciona exercício a um dia.
 */
async function addDayExercise(
    dayId
) {

    const day =
        findWorkoutDay(
            dayId
        );


    if (!day) {
        return;
    }


    await loadExerciseCatalog();


    if (
        !exerciseCatalog.length
    ) {

        throw new Error(
            "Nenhum exercício disponível no catálogo."
        );
    }


    const options =
        exerciseCatalog
            .map(
                exercise =>
                    `${exercise.id} - ${exercise.name}`
            )
            .join("\n");


    const selected =
        prompt(
            "Digite o ID do exercício:\n\n" +
            options
        );


    if (!selected) {
        return;
    }


    const exerciseId =
        Number(selected);


    const exercise =
        exerciseCatalog.find(
            item =>
                Number(item.id) ===
                exerciseId
        );


    if (!exercise) {

        alert(
            "Exercício inválido."
        );

        return;
    }


    const sets =
        prompt(
            "Número de séries:",
            "3"
        );


    if (!sets) {
        return;
    }


    const reps =
        prompt(
            "Repetições:",
            "12"
        );


    if (!reps) {
        return;
    }


    const restSeconds =
        prompt(
            "Descanso em segundos:",
            "60"
        );


    if (restSeconds === null) {
        return;
    }


    const notes =
        prompt(
            "Observação do exercício:",
            ""
        );


    const nextOrder =
        day.exercises.length + 1;


    const item =
        new WorkoutDayExercise({

            workoutDayId:
                day.id,

            exerciseId:
                exercise.id,

            sets:
                Number(sets),

            reps:
                reps.trim(),

            restSeconds:
                Number(restSeconds),

            order:
                nextOrder,

            notes:
                notes?.trim() || null,

            exerciseName:
                exercise.name
        });


    const response =
        await workoutDayExerciseService
            .create(item);


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível adicionar o exercício."
        );
    }


    alert(
        "Exercício adicionado com sucesso!"
    );


    await refreshCurrentWorkoutModal(
        day.workoutId
    );
}


/**
 * Edita exercício de um dia.
 */
async function editDayExercise(
    exerciseItemId
) {

    const item =
        findWorkoutDayExercise(
            exerciseItemId
        );


    if (!item) {
        return;
    }


    const sets =
        prompt(
            "Número de séries:",
            item.sets
        );


    if (sets === null) {
        return;
    }


    const reps =
        prompt(
            "Repetições:",
            item.reps
        );


    if (reps === null) {
        return;
    }


    const restSeconds =
        prompt(
            "Descanso em segundos:",
            item.restSeconds
        );


    if (restSeconds === null) {
        return;
    }


    const notes =
        prompt(
            "Observação:",
            item.notes || ""
        );


    const updated =
        new WorkoutDayExercise({

            id:
                item.id,

            workoutDayId:
                item.workoutDayId,

            exerciseId:
                item.exerciseId,

            sets:
                Number(sets),

            reps:
                reps.trim(),

            restSeconds:
                Number(restSeconds),

            order:
                item.order,

            notes:
                notes?.trim() || null,

            exerciseName:
                item.exerciseName
        });


    const response =
        await workoutDayExerciseService
            .update(
                exerciseItemId,
                updated
            );


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível atualizar o exercício."
        );
    }


    alert(
        "Exercício atualizado com sucesso!"
    );


    const day =
        findWorkoutDay(
            item.workoutDayId
        );


    if (day) {

        await refreshCurrentWorkoutModal(
            day.workoutId
        );
    }
}


/**
 * Remove exercício.
 */
async function removeDayExercise(
    exerciseItemId
) {

    const item =
        findWorkoutDayExercise(
            exerciseItemId
        );


    if (!item) {
        return;
    }


    const name =
        item.exerciseName ||
        `Exercício #${item.exerciseId}`;


    const confirmed =
        confirm(
            `Remover "${name}" do treino?`
        );


    if (!confirmed) {
        return;
    }


    const response =
        await workoutDayExerciseService
            .remove(
                exerciseItemId
            );


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível remover o exercício."
        );
    }


    alert(
        "Exercício removido com sucesso!"
    );


    const day =
        findWorkoutDay(
            item.workoutDayId
        );


    if (day) {

        await refreshCurrentWorkoutModal(
            day.workoutId
        );
    }
}


/**
 * Atualiza o modal após alteração.
 */
async function refreshCurrentWorkoutModal(
    workoutId
) {

    await loadStudentWorkouts(
        currentStudent.id
    );


    await openWorkoutModal(
        workoutId
    );
}


/**
 * Carrega catálogo de exercícios.
 */
async function loadExerciseCatalog() {

    if (
        exerciseCatalog.length > 0
    ) {
        return;
    }


    const response =
        await exerciseService.list();


    if (
        !response ||
        response.status !== "success"
    ) {

        throw new Error(
            response?.message ||
            "Não foi possível carregar os exercícios."
        );
    }


    exerciseCatalog =
        Array.isArray(response.data)
            ? response.data
            : [];
}


/**
 * Procura treino.
 */
function findWorkout(
    workoutId
) {

    return currentWorkouts.find(
        workout =>
            Number(workout.id) ===
            Number(workoutId)
    );
}


/**
 * Procura dia.
 */
function findWorkoutDay(
    dayId
) {

    for (
        const workout
        of currentWorkouts
    ) {

        const day =
            workout.days.find(
                item =>
                    Number(item.id) ===
                    Number(dayId)
            );


        if (day) {

            return {
                ...day,
                workoutId:
                    workout.id
            };
        }
    }


    return null;
}


/**
 * Procura exercício dentro de um dia.
 */
function findWorkoutDayExercise(
    exerciseItemId
) {

    for (
        const workout
        of currentWorkouts
    ) {

        for (
            const day
            of workout.days
        ) {

            const exercise =
                day.exercises.find(
                    item =>
                        Number(item.id) ===
                        Number(exerciseItemId)
                );


            if (exercise) {

                return {
                    ...exercise,
                    workoutId:
                        workout.id
                };
            }
        }
    }


    return null;
}


/**
 * FORMULÁRIO DE NOVO ALUNO
 */
function renderNewStudentForm() {

    document.title =
        "Novo Aluno — TrainiFy";


    const titleEl =
        document.getElementById(
            "topbarTitle"
        );


    if (titleEl) {

        titleEl.textContent =
            "Novo Aluno";
    }


    const container =
        document.getElementById(
            "studentContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="card"
            style="max-width:700px;"
        >

            <h2
                style="
                    margin-bottom:var(--space-xl);
                "
            >
                Cadastrar Novo Aluno
            </h2>


            <div
                id="studentFormMessage"
                style="
                    margin-bottom:var(--space-md);
                "
            ></div>


            <form id="newStudentForm">

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:var(--space-md);
                    "
                >

                    <div
                        class="form-group"
                        style="grid-column:1/-1"
                    >

                        <label>
                            Nome Completo *
                        </label>

                        <input
                            class="form-control"
                            name="name"
                            required
                            placeholder="João da Silva"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            class="form-control"
                            name="email"
                            type="email"
                            placeholder="joao@email.com"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            Telefone
                        </label>

                        <input
                            class="form-control"
                            name="phone"
                            placeholder="(51) 99999-0000"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            Academia
                        </label>

                        <input
                            class="form-control"
                            name="gym"
                            placeholder="SmartFit Centro"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            Nível de Treino *
                        </label>

                        <select
                            class="form-control"
                            name="training_level_id"
                            required
                        >

                            <option value="">
                                Selecionar...
                            </option>

                            <option value="1">
                                Iniciante
                            </option>

                            <option value="2">
                                Intermediário
                            </option>

                            <option value="3">
                                Avançado
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Data de Nascimento
                        </label>

                        <input
                            class="form-control"
                            name="birthdate"
                            type="date"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            ID do Objetivo
                        </label>

                        <input
                            class="form-control"
                            name="goal_id"
                            type="number"
                            min="1"
                            placeholder="Ex.: 1"
                        />

                    </div>


                    <div
                        class="form-group"
                        style="grid-column:1/-1"
                    >

                        <label>
                            Observações / Lesões / Dificuldades
                        </label>

                        <textarea
                            class="form-control"
                            name="notes"
                            placeholder="Descreva lesões, limitações ou qualquer informação importante..."
                        ></textarea>

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:var(--space-sm);
                        margin-top:var(--space-md);
                    "
                >

                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="cancel-form"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="btn btn-primary"
                        id="saveStudentBtn"
                    >
                        Cadastrar Aluno
                    </button>

                </div>

            </form>

        </div>
    `;


    const form =
        document.getElementById(
            "newStudentForm"
        );


    form?.addEventListener(
        "submit",
        handleNewStudentSubmit
    );
}


/**
 * Envia novo aluno.
 */
async function handleNewStudentSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const button =
        document.getElementById(
            "saveStudentBtn"
        );


    try {

        const token =
            storage.getToken();


        if (!token) {

            showFormMessage(
                "Sua sessão expirou. Faça login novamente.",
                "error"
            );

            setTimeout(
                () => {

                    window.location.href =
                        "../public/login.html";

                },
                1000
            );

            return;
        }


        studentService.setAuthToken(
            token
        );


        const formData =
            new FormData(form);


        const name =
            formData
                .get("name")
                ?.trim();


        const email =
            formData
                .get("email")
                ?.trim() || null;


        const phone =
            formData
                .get("phone")
                ?.trim() || null;


        const birthdate =
            formData.get(
                "birthdate"
            ) || null;


        const gym =
            formData
                .get("gym")
                ?.trim() || null;


        const notes =
            formData
                .get("notes")
                ?.trim() || null;


        const trainingLevelId =
            formData.get(
                "training_level_id"
            );


        const goalId =
            formData.get(
                "goal_id"
            );


        if (!name) {

            showFormMessage(
                "Informe o nome do aluno.",
                "error"
            );

            return;
        }


        if (!trainingLevelId) {

            showFormMessage(
                "Selecione o nível de treino.",
                "error"
            );

            return;
        }


        const student =
            new Student({

                name,

                email,

                phone,

                birthdate,

                gym,

                notes,

                trainingLevelId:
                    Number(
                        trainingLevelId
                    ),

                goalId:
                    goalId
                        ? Number(goalId)
                        : null
            });


        button.disabled = true;

        button.textContent =
            "Cadastrando...";


        const response =
            await studentService.create(
                student
            );


        if (
            !response ||
            response.status !== "success"
        ) {

            throw new Error(
                response?.message ||
                "Não foi possível cadastrar o aluno."
            );
        }


        showFormMessage(
            "Aluno cadastrado com sucesso!",
            "success"
        );


        button.textContent =
            "Aluno cadastrado!";


        setTimeout(
            () => {

                window.history.back();

            },
            1000
        );


    } catch (error) {

        console.error(
            "ERRO AO CADASTRAR ALUNO:",
            error
        );


        showFormMessage(
            error.message ||
            "Erro ao cadastrar aluno.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "Cadastrar Aluno";
    }
}


/**
 * Remove aluno.
 */
async function confirmDelete() {

    const confirmed =
        confirm(
            "Remover este aluno? Esta ação não pode ser desfeita."
        );


    if (!confirmed) {
        return;
    }


    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const studentId =
            params.get("id");


        if (!studentId) {

            alert(
                "Não foi possível identificar o aluno."
            );

            return;
        }


        if (!configureServices()) {
            return;
        }


        const response =
            await studentService.remove(
                studentId
            );


        if (
            !response ||
            response.status !== "success"
        ) {

            alert(
                response?.message ||
                "Não foi possível remover o aluno."
            );

            return;
        }


        alert(
            "Aluno removido com sucesso!"
        );


        window.location.href =
            "students.html";


    } catch (error) {

        console.error(
            "ERRO AO REMOVER ALUNO:",
            error
        );


        alert(
            error.message ||
            "Erro ao remover aluno."
        );
    }
}


/**
 * Mensagem do formulário.
 */
function showFormMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "studentFormMessage"
        );


    if (!element) {
        return;
    }


    const isSuccess =
        type === "success";


    element.innerHTML = `

        <div
            style="
                padding:12px 16px;
                border-radius:8px;
                background:${
                    isSuccess
                        ? "rgba(34,197,94,.12)"
                        : "rgba(239,68,68,.12)"
                };
                color:${
                    isSuccess
                        ? "#4ade80"
                        : "#f87171"
                };
            "
        >
            ${escapeHtml(message)}
        </div>
    `;
}


/**
 * Auxiliar: data.
 */
function fmtDate(date) {

    if (!date) {
        return "—";
    }


    try {

        return new Date(
            date +
            (
                /^\d{4}-\d{2}-\d{2}$/.test(date)
                    ? "T00:00:00"
                    : ""
            )
        ).toLocaleDateString(
            "pt-BR"
        );

    } catch {

        return date;
    }
}


/**
 * Auxiliar: iniciais.
 */
function initials(
    name = ""
) {

    const parts =
        name
            .trim()
            .split(/\s+/);


    if (!parts[0]) {
        return "??";
    }


    return (
        parts.length > 1
            ? parts[0][0] +
              parts[parts.length - 1][0]
            : parts[0].slice(0, 2)
    ).toUpperCase();
}


/**
 * Segurança para HTML.
 */
function escapeHtml(
    value = ""
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/**
 * Segurança para atributos HTML.
 */
function escapeAttribute(
    value = ""
) {

    return escapeHtml(
        value
    );
}