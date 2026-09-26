/**
 * TrainiFy - student.js
 * Perfil e cadastro de alunos integrado com a API.
 */

import Student from "../../_common/classes/Student.js";
import StudentService from "../../_common/services/StudentService.js";
import SessionStorage from "../../_common/scripts/storage.js";


const studentService = new StudentService();
const storage = new SessionStorage();


const LEVEL_LABEL = {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado"
};


// Mantemos o mock temporariamente para a parte de perfil/treino.
// O cadastro de NOVO ALUNO já utiliza a API real.
const MOCK_STUDENT = {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(51) 99111-0001",
    birthdate: "1992-03-15",
    gym: "SmartFit Centro",
    level: "intermediate",
    goal: "Hipertrofia",
    status: "active",
    createdAt: "2025-01-10",
    notes: "Observações do aluno."
};


const MOCK_WORKOUT = {
    id: "w1",
    name: "Treino A — Hipertrofia",
    description: "Foco em volume e intensidade moderada",
    days: [
        {
            name: "Dia A — Peito, Tríceps e Ombro",
            exercises: [
                {
                    name: "Supino Reto c/ Barra",
                    sets: 4,
                    reps: "10-12",
                    rest: 60
                },
                {
                    name: "Crucifixo no Banco",
                    sets: 3,
                    reps: "12-15",
                    rest: 45
                },
                {
                    name: "Desenvolvimento c/ Halteres",
                    sets: 4,
                    reps: "10",
                    rest: 60
                },
                {
                    name: "Tríceps Testa",
                    sets: 4,
                    reps: "10",
                    rest: 60
                }
            ]
        }
    ]
};


/**
 * Inicialização
 */
document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(window.location.search);

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

    window.location.href = "students.html";
});
async function loadStudent(studentId) {

    try {

        const token = storage.getToken();

        if (!token) {
            window.location.href =
                "../public/login.html";

            return;
        }

        studentService.setAuthToken(token);

        const response =
            await studentService.find(studentId);

        if (response?.status !== "success") {

            alert(
                response?.message ||
                "Não foi possível carregar o aluno."
            );

            window.location.href =
                "students.html";

            return;
        }

        const student = response.data;

        console.log(
            "ALUNO CARREGADO DA API:",
            student
        );

        renderStudentProfile(student);

        renderWorkout(MOCK_WORKOUT);

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR ALUNO:",
            error
        );

        alert(
            "Erro ao carregar os dados do aluno."
        );

        window.location.href =
            "students.html";
    }
}

/**
 * Renderiza perfil do aluno.
 */
function renderStudentProfile(student) {

    document.title =
        `${student.name} — TrainiFy`;

    const titleEl =
        document.getElementById("topbarTitle");

    if (titleEl) {
        titleEl.textContent = student.name;
    }


    const container =
        document.getElementById("studentContent");

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
                    ${student.name}
                </div>

                <div class="profile-tags">

                    <span class="badge badge-info">
                       ${student.trainingLevel || "—"}
                    </span>

                    ${
                        student.gym
                            ? `
                                <span class="badge badge-info">
                                    ${student.gym}
                                </span>
                            `
                            : ""
                    }

                        <span class="badge ${
                            student.active === 1
                            ? "badge-neon"
                            : "badge-warn"
                        }">
                        ${
                            student.active === 1
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
                <div class="info-block-label">Email</div>
                <div class="info-block-value">
                    ${student.email}
                </div>
            </div>

            <div class="info-block">
                <div class="info-block-label">Telefone</div>
                <div class="info-block-value">
                    ${student.phone}
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
                    ${student.gym}
                </div>
            </div>

            <div class="info-block">
                <div class="info-block-label">
                    Objetivo
                </div>

                <div class="info-block-value">
                    ${student.goal}
                </div>
            </div>
        </div>


        <div class="notes-card">

            <h3>
                📋 Observações / Lesões / Dificuldades
            </h3>

            <div class="notes-text">
                ${
                    student.notes ||
                    `
                        <span style="color:var(--clr-grey-500)">
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
 * Renderiza treino.
 */
function renderWorkout(workout) {

    const section =
        document.getElementById("workoutSection");

    if (!section) {
        return;
    }


    const daysHtml =
        workout.days.map(day => `

            <div class="workout-day">

                <div class="day-label">
                    ${day.name}
                </div>

                <div class="exercise-list">

                    ${day.exercises.map(exercise => `

                        <div class="exercise-row">

                            <div class="exercise-name">
                                ${exercise.name}
                            </div>

                            <div class="exercise-meta">
                                <span>${exercise.sets}</span>
                                Séries
                            </div>

                            <div class="exercise-meta">
                                <span>${exercise.reps}</span>
                                Reps
                            </div>

                            <div class="exercise-meta">
                                <span>${exercise.rest}s</span>
                                Descanso
                            </div>

                        </div>

                    `).join("")}

                </div>

            </div>

        `).join("");


    section.innerHTML = `

        <div class="workout-section">

            <div class="workout-section-header">

                <div>

                    <h3 style="font-size:1rem;font-weight:700;">
                        🏋 ${workout.name}
                    </h3>

                    <div
                        style="
                            font-size:0.8rem;
                            color:var(--clr-grey-500);
                            margin-top:2px;
                        "
                    >
                        ${workout.description}
                    </div>

                </div>

                <div style="display:flex;gap:8px;">

                    <button
                        class="btn btn-ghost btn-sm"
                        type="button"
                        data-action="view-workout-details"
                    >
                        Ver Detalhes
                    </button>

                    <button
                        class="btn btn-outline btn-sm"
                        type="button"
                        data-action="export-workout-pdf"
                    >
                        ↓ PDF
                    </button>

                </div>

            </div>

            ${daysHtml}

        </div>
    `;
}


/**
 * FORMULÁRIO DE NOVO ALUNO
 */
function renderNewStudentForm() {

    document.title =
        "Novo Aluno — TrainiFy";


    const titleEl =
        document.getElementById("topbarTitle");

    if (titleEl) {
        titleEl.textContent = "Novo Aluno";
    }


    const container =
        document.getElementById("studentContent");

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
                style="margin-bottom:var(--space-md);"
            ></div>


            <form id="newStudentForm">

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:var(--space-md);
                    "
                >

                    <!-- NOME -->

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


                    <!-- EMAIL -->

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


                    <!-- TELEFONE -->

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


                    <!-- ACADEMIA -->

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


                    <!-- NÍVEL -->

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


                    <!-- DATA -->

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


                    <!-- OBJETIVO -->

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


                    <!-- OBSERVAÇÕES -->

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
        document.getElementById("newStudentForm");

    form?.addEventListener(
        "submit",
        handleNewStudentSubmit
    );
}


/**
 * Envia o novo aluno para a API.
 */
async function handleNewStudentSubmit(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const button =
        document.getElementById("saveStudentBtn");

    try {

        // ================================
        // 1. Recupera o token da sessão
        // ================================

        const token = storage.getToken();

        if (!token) {

            showFormMessage(
                "Sua sessão expirou. Faça login novamente.",
                "error"
            );

            setTimeout(() => {
                window.location.href =
                    "../public/login.html";
            }, 1000);

            return;
        }


        // ================================
        // 2. Configura autenticação
        // ================================

        studentService.setAuthToken(token);


        // ================================
        // 3. Obtém os dados do formulário
        // ================================

        const formData =
            new FormData(form);

        const name =
            formData.get("name")?.trim();

        const email =
            formData.get("email")?.trim() || null;

        const phone =
            formData.get("phone")?.trim() || null;

        const birthdate =
            formData.get("birthdate") || null;

        const gym =
            formData.get("gym")?.trim() || null;

        const notes =
            formData.get("notes")?.trim() || null;

        const trainingLevelId =
            formData.get("training_level_id");

        const goalId =
            formData.get("goal_id");


        // ================================
        // 4. Validação
        // ================================

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


        // ================================
        // 5. Cria objeto Student
        // ================================

        const student = new Student({

            name,

            email,

            phone,

            birthdate,

            gym,

            notes,

            trainingLevelId:
                Number(trainingLevelId),

            goalId:
                goalId
                    ? Number(goalId)
                    : null

        });


        console.log(
            "OBJETO STUDENT:",
            student
        );


        console.log(
            "PAYLOAD ENVIADO:",
            student.toPayload()
        );


        // ================================
        // 6. Loading
        // ================================

        button.disabled = true;

        button.textContent =
            "Cadastrando...";


        // ================================
        // 7. Envia para API
        // ================================

        const response =
            await studentService.create(
                student
            );


        console.log(
            "RESPOSTA DA API - CADASTRO:",
            response
        );


        // ================================
        // 8. Verifica resposta
        // ================================

        if (
            !response ||
            response.status !== "success"
        ) {

            throw new Error(
                response?.message ||
                "Não foi possível cadastrar o aluno."
            );
        }


        // ================================
        // 9. Cadastro realizado
        // ================================

        showFormMessage(
            "Aluno cadastrado com sucesso!",
            "success"
        );

        button.textContent =
            "Aluno cadastrado!";


        // ================================
        // 10. Volta para lista
        // ================================

       setTimeout(() => {
        window.history.back();
        }, 1000);

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
            ${message}
        </div>

    `;
}


/**
 * Ações gerais da página.
 */
function initStudentActions() {

    document.body.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );

            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            if (
                action === "edit-student" ||
                action === "export-student-pdf" ||
                action === "export-workout-pdf"
            ) {

                alert(
                    "Funcionalidade disponível após integração com backend."
                );

                return;
            }


            if (action === "remove-student") {

                confirmDelete();

                return;
            }


            if (action === "view-workout-details") {

                openWorkoutModal();

                return;
            }


            if (action === "close-workout-modal") {

                closeWorkoutModal();

                return;
            }


            if (action === "toggle-workout-edit") {

                toggleWorkoutEditMode();

                return;
            }


            if (action === "save-workout-changes") {

                saveWorkoutChanges();

                return;
            }


            if (action === "add-workout-exercise") {

                addWorkoutExercise();

                return;
            }


            if (action === "cancel-form") {

                window.location.href =
                    "students.html";

                return;
            }
        }
    );
}


/**
 * Modal de treino.
 */
function openWorkoutModal() {

    renderWorkoutModal(MOCK_WORKOUT);

    const modal =
        document.getElementById(
            "workoutModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeWorkoutModal() {

    const modal =
        document.getElementById(
            "workoutModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


function renderWorkoutModal(workout) {

    const body =
        document.getElementById(
            "workoutModalBody"
        );

    const title =
        document.getElementById(
            "workoutModalTitle"
        );

    const subtitle =
        document.getElementById(
            "workoutModalSubtitle"
        );


    if (
        !body ||
        !title ||
        !subtitle
    ) {
        return;
    }


    title.textContent =
        workout.name;

    subtitle.textContent =
        workout.description;


    body.innerHTML =
        workout.days.map(day => `

            <section class="modal-workout-day">

                <div class="modal-day-header">

                    <div>

                        <div class="day-label">
                            ${day.name}
                        </div>

                        <p class="modal-day-note">
                            ${day.exercises.length}
                            exercícios
                        </p>

                    </div>

                </div>

                <div class="modal-exercises">

                    ${day.exercises.map(exercise => `

                        <div class="modal-exercise-row">

                            <input
                                class="modal-input modal-input-name"
                                value="${exercise.name}"
                                disabled
                            />

                            <input
                                class="modal-input modal-input-meta"
                                value="${exercise.sets}"
                                disabled
                            />

                            <input
                                class="modal-input modal-input-meta"
                                value="${exercise.reps}"
                                disabled
                            />

                            <input
                                class="modal-input modal-input-meta"
                                value="${exercise.rest}"
                                disabled
                            />

                        </div>

                    `).join("")}

                </div>

            </section>

        `).join("");
}


function toggleWorkoutEditMode() {

    const modal =
        document.getElementById(
            "workoutModal"
        );

    if (!modal) {
        return;
    }


    const isEditing =
        modal.classList.toggle(
            "editing"
        );


    modal
        .querySelectorAll(".modal-input")
        .forEach(input => {

            input.disabled =
                !isEditing;
        });
}


function saveWorkoutChanges() {

    const modal =
        document.getElementById(
            "workoutModal"
        );

    if (
        modal &&
        modal.classList.contains("editing")
    ) {
        toggleWorkoutEditMode();
    }

    alert(
        "As alterações ficam visíveis após integração com o backend."
    );
}


function addWorkoutExercise() {

    const firstDay =
        document.querySelector(
            "#workoutModalBody .modal-workout-day .modal-exercises"
        );

    if (!firstDay) {
        return;
    }


    firstDay.insertAdjacentHTML(
        "beforeend",
        `
            <div class="modal-exercise-row">

                <input
                    class="modal-input modal-input-name"
                    value="Novo exercício"
                />

                <input
                    class="modal-input modal-input-meta"
                    value="3"
                />

                <input
                    class="modal-input modal-input-meta"
                    value="12"
                />

                <input
                    class="modal-input modal-input-meta"
                    value="60"
                />

            </div>
        `
    );
}


/**
 * Remoção ainda será integrada depois.
 */
async function confirmDelete() {

    const confirmed = confirm(
        "Remover este aluno? Esta ação não pode ser desfeita."
    );

    if (!confirmed) {
        return;
    }

    try {

        const params =
            new URLSearchParams(window.location.search);

        const studentId =
            params.get("id");

        if (!studentId) {

            alert(
                "Não foi possível identificar o aluno."
            );

            return;
        }

        const token =
            storage.getToken();

        if (!token) {

            window.location.href =
                "../public/login.html";

            return;
        }

        studentService.setAuthToken(token);

        const response =
            await studentService.remove(studentId);

        console.log(
            "RESPOSTA AO REMOVER ALUNO:",
            response
        );

        if (response?.status !== "success") {

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
            "Erro ao remover o aluno."
        );
    }
}


/**
 * Auxiliares
 */
function initials(name = "") {

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

function fmtDate(date) {

    if (!date) {
        return "—";
    }

    try {

        return new Date(
            date + (
                /^\d{4}-\d{2}-\d{2}$/.test(date)
                    ? "T00:00:00"
                    : ""
            )
        ).toLocaleDateString("pt-BR");

    } catch {

        return date;
    }
}