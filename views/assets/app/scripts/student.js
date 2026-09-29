/**
 * TrainiFy - student.js
 * Página individual do aluno.
 */

import Student from "../../_common/classes/Student.js";
import StudentService from "../../_common/services/StudentService.js";
import SessionStorage from "../../_common/scripts/storage.js";

import StudentWorkouts from "./student-workouts.js";


const studentService = new StudentService();
const storage = new SessionStorage();

let currentStudent = null;
let workoutsManager = null;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);

    const newStudent = params.get("new");
    const studentId = params.get("id");

    if (!configureServices()) {
        return;
    }

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


/* =========================================================
   SERVIÇOS
========================================================= */

function configureServices() {

    const token = storage.getToken();

    if (!token) {
        window.location.href = "../public/login.html";
        return false;
    }

    studentService.setAuthToken(token);

    return true;
}


/* =========================================================
   ALUNO
========================================================= */

async function loadStudent(studentId) {

    try {

        const response = await studentService.find(studentId);

        if (!response || response.status !== "success") {

            alert(
                response?.message ||
                "Não foi possível carregar o aluno."
            );

            window.location.href = "students.html";
            return;
        }

        currentStudent = response.data;

        renderStudentProfile(currentStudent);

        workoutsManager = new StudentWorkouts({
            student: currentStudent,
            storage
        });

        await workoutsManager.load();

    } catch (error) {

        console.error("ERRO AO CARREGAR ALUNO:", error);

        alert(
            error.message ||
            "Erro ao carregar os dados do aluno."
        );

        window.location.href = "students.html";
    }
}


function renderStudentProfile(student) {

    document.title = `${student.name} — TrainiFy`;

    const titleEl = document.getElementById("topbarTitle");

    if (titleEl) {
        titleEl.textContent = student.name;
    }

    const container = document.getElementById("studentContent");

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
                                    ${escapeHtml(student.gym)}
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

            ${infoBlock("Email", student.email)}

            ${infoBlock("Telefone", student.phone)}

            <div class="info-block">
                <div class="info-block-label">
                    Data de Nascimento
                </div>
                <div class="info-block-value">
                    ${fmtDate(student.birthdate)}
                </div>
            </div>

            ${infoBlock("Academia", student.gym)}

            ${infoBlock("Objetivo", student.goal)}

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


function infoBlock(label, value) {

    return `
        <div class="info-block">
            <div class="info-block-label">
                ${label}
            </div>

            <div class="info-block-value">
                ${escapeHtml(value || "—")}
            </div>
        </div>
    `;
}


/* =========================================================
   AÇÕES
========================================================= */

function initStudentActions() {

    document.body.addEventListener("click", async event => {

        const button = event.target.closest(
            "button[data-action]"
        );

        if (!button) {
            return;
        }

        const action = button.dataset.action;

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

                case "cancel-form":
                    window.location.href = "students.html";
                    break;

                case "cancel-edit-student":
                    renderStudentProfile(currentStudent);

                    if (workoutsManager) {
                        await workoutsManager.load();
                    }
                    break;

                default:

                    if (workoutsManager) {
                        await workoutsManager.handleAction(
                            action,
                            button.dataset
                        );
                    }

                    break;
            }

        } catch (error) {

            console.error("ERRO NA AÇÃO:", error);

            alert(
                error.message ||
                "Não foi possível executar a ação."
            );
        }
    });
}


/* =========================================================
   EDIÇÃO DO ALUNO
========================================================= */

function editStudent() {

    if (!currentStudent) {
        return;
    }

    renderEditStudentForm(currentStudent);
}


function renderEditStudentForm(student) {

    const titleEl = document.getElementById("topbarTitle");

    if (titleEl) {
        titleEl.textContent = "Editar Aluno";
    }

    const container = document.getElementById("studentContent");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="card" style="max-width:700px;">

            <h2 style="margin-bottom:var(--space-xl);">
                Editar Aluno
            </h2>

            <div
                id="studentFormMessage"
                style="margin-bottom:var(--space-md);"
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
                        <label>Nome Completo *</label>

                        <input
                            class="form-control"
                            name="name"
                            required
                            value="${escapeAttribute(student.name || "")}"
                        />
                    </div>

                    <div class="form-group">
                        <label>Email</label>

                        <input
                            class="form-control"
                            name="email"
                            type="email"
                            value="${escapeAttribute(student.email || "")}"
                        />
                    </div>

                    <div class="form-group">
                        <label>Telefone</label>

                        <input
                            class="form-control"
                            name="phone"
                            value="${escapeAttribute(student.phone || "")}"
                        />
                    </div>

                    <div class="form-group">
                        <label>Academia</label>

                        <input
                            class="form-control"
                            name="gym"
                            value="${escapeAttribute(student.gym || "")}"
                        />
                    </div>

                    <div class="form-group">
                        <label>Nível de Treino *</label>

                        ${trainingLevelSelect(student.trainingLevelId)}
                    </div>

                    <div class="form-group">
                        <label>Data de Nascimento</label>

                        <input
                            class="form-control"
                            name="birthdate"
                            type="date"
                            value="${escapeAttribute(student.birthdate || "")}"
                        />
                    </div>

                    <div class="form-group">
                        <label>ID do Objetivo</label>

                        <input
                            class="form-control"
                            name="goal_id"
                            type="number"
                            min="1"
                            value="${escapeAttribute(student.goalId || "")}"
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
                        >${escapeHtml(student.notes || "")}</textarea>
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

    document
        .getElementById("editStudentForm")
        ?.addEventListener(
            "submit",
            handleEditStudentSubmit
        );
}


function trainingLevelSelect(selected) {

    return `
        <select
            class="form-control"
            name="training_level_id"
            required
        >
            ${[
                [1, "Iniciante"],
                [2, "Intermediário"],
                [3, "Avançado"]
            ]
                .map(([id, label]) => `
                    <option
                        value="${id}"
                        ${Number(selected) === id ? "selected" : ""}
                    >
                        ${label}
                    </option>
                `)
                .join("")}
        </select>
    `;
}


async function handleEditStudentSubmit(event) {

    event.preventDefault();

    const form = event.currentTarget;
    const button = document.getElementById("updateStudentBtn");

    try {

        const data = new FormData(form);
        const name = data.get("name")?.trim();

        if (!name) {
            showFormMessage(
                "Informe o nome do aluno.",
                "error"
            );
            return;
        }

        const student = new Student({
            name,
            email: data.get("email")?.trim() || null,
            phone: data.get("phone")?.trim() || null,
            birthdate: data.get("birthdate") || null,
            gym: data.get("gym")?.trim() || null,
            notes: data.get("notes")?.trim() || null,
            trainingLevelId: Number(
                data.get("training_level_id")
            ),
            goalId: data.get("goal_id")
                ? Number(data.get("goal_id"))
                : null
        });

        button.disabled = true;
        button.textContent = "Salvando...";

        const response = await studentService.update(
            currentStudent.id,
            student
        );

        if (!response || response.status !== "success") {
            throw new Error(
                response?.message ||
                "Não foi possível atualizar o aluno."
            );
        }

        currentStudent = response.data || student;

        alert("Aluno atualizado com sucesso!");

        renderStudentProfile(currentStudent);

        workoutsManager = new StudentWorkouts({
            student: currentStudent,
            storage
        });

        await workoutsManager.load();

    } catch (error) {

        console.error("ERRO AO ATUALIZAR ALUNO:", error);

        showFormMessage(
            error.message || "Erro ao atualizar aluno.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Salvar alterações";
    }
}


/* =========================================================
   NOVO ALUNO
========================================================= */

function renderNewStudentForm() {

    document.title = "Novo Aluno — TrainiFy";

    const titleEl = document.getElementById("topbarTitle");

    if (titleEl) {
        titleEl.textContent = "Novo Aluno";
    }

    const container = document.getElementById("studentContent");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="card" style="max-width:700px;">

            <h2 style="margin-bottom:var(--space-xl);">
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

                    <div
                        class="form-group"
                        style="grid-column:1/-1"
                    >
                        <label>Nome Completo *</label>

                        <input
                            class="form-control"
                            name="name"
                            required
                            placeholder="João da Silva"
                        />
                    </div>

                    <div class="form-group">
                        <label>Email</label>

                        <input
                            class="form-control"
                            name="email"
                            type="email"
                            placeholder="joao@email.com"
                        />
                    </div>

                    <div class="form-group">
                        <label>Telefone</label>

                        <input
                            class="form-control"
                            name="phone"
                            placeholder="(51) 99999-0000"
                        />
                    </div>

                    <div class="form-group">
                        <label>Academia</label>

                        <input
                            class="form-control"
                            name="gym"
                            placeholder="SmartFit Centro"
                        />
                    </div>

                    <div class="form-group">
                        <label>Nível de Treino *</label>

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
                        <label>Data de Nascimento</label>

                        <input
                            class="form-control"
                            name="birthdate"
                            type="date"
                        />
                    </div>

                    <div class="form-group">
                        <label>ID do Objetivo</label>

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

    document
        .getElementById("newStudentForm")
        ?.addEventListener(
            "submit",
            handleNewStudentSubmit
        );
}


async function handleNewStudentSubmit(event) {

    event.preventDefault();

    const form = event.currentTarget;
    const button = document.getElementById("saveStudentBtn");

    try {

        const data = new FormData(form);

        const name = data.get("name")?.trim();
        const trainingLevelId =
            data.get("training_level_id");

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

        const student = new Student({
            name,
            email: data.get("email")?.trim() || null,
            phone: data.get("phone")?.trim() || null,
            birthdate: data.get("birthdate") || null,
            gym: data.get("gym")?.trim() || null,
            notes: data.get("notes")?.trim() || null,
            trainingLevelId: Number(trainingLevelId),
            goalId: data.get("goal_id")
                ? Number(data.get("goal_id"))
                : null
        });

        button.disabled = true;
        button.textContent = "Cadastrando...";

        const response =
            await studentService.create(student);

        if (!response || response.status !== "success") {
            throw new Error(
                response?.message ||
                "Não foi possível cadastrar o aluno."
            );
        }

        showFormMessage(
            "Aluno cadastrado com sucesso!",
            "success"
        );

        button.textContent = "Aluno cadastrado!";

        setTimeout(
            () => window.history.back(),
            1000
        );

    } catch (error) {

        console.error("ERRO AO CADASTRAR ALUNO:", error);

        showFormMessage(
            error.message ||
            "Erro ao cadastrar aluno.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Cadastrar Aluno";
    }
}


/* =========================================================
   EXCLUSÃO
========================================================= */

async function confirmDelete() {

    if (!confirm(
        "Remover este aluno? Esta ação não pode ser desfeita."
    )) {
        return;
    }

    try {

        const params =
            new URLSearchParams(window.location.search);

        const studentId = params.get("id");

        if (!studentId) {
            alert("Não foi possível identificar o aluno.");
            return;
        }

        const response =
            await studentService.remove(studentId);

        if (!response || response.status !== "success") {
            throw new Error(
                response?.message ||
                "Não foi possível remover o aluno."
            );
        }

        alert("Aluno removido com sucesso!");

        window.location.href = "students.html";

    } catch (error) {

        console.error("ERRO AO REMOVER ALUNO:", error);

        alert(
            error.message ||
            "Erro ao remover aluno."
        );
    }
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function showFormMessage(message, type = "error") {

    const element =
        document.getElementById("studentFormMessage");

    if (!element) {
        return;
    }

    const success = type === "success";

    element.innerHTML = `
        <div
            style="
                padding:12px 16px;
                border-radius:8px;
                background:${
                    success
                        ? "rgba(34,197,94,.12)"
                        : "rgba(239,68,68,.12)"
                };
                color:${
                    success
                        ? "#4ade80"
                        : "#f87171"
                };
            "
        >
            ${escapeHtml(message)}
        </div>
    `;
}


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
        ).toLocaleDateString("pt-BR");

    } catch {
        return date;
    }
}


function initials(name = "") {

    const parts = name.trim().split(/\s+/);

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