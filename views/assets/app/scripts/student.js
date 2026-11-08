import Student from "../../_common/classes/Student.js";
import StudentService from "../../_common/services/StudentService.js";
import StudentImages from "../../_common/classes/StudentImages.js";
import SessionStorage from "../../_common/scripts/storage.js";
import StudentWorkouts from "./student-workouts.js";
import "../../_common/prototypes/test-prototypes.js";

import {
    createFormController
} from "../../_common/prototypes/FormController.js";


const studentFormController =
    createFormController();

const studentService =
    new StudentService();

const studentImages =
    new StudentImages();

const storage =
    new SessionStorage();


let currentStudent = null;
let workoutsManager = null;


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


        window.location.href =
            "students.html";
    }
);


function configureServices() {

    const token =
        storage.getToken();


    if (!token) {

        window.location.href =
            "../public/login.html";

        return false;
    }


    studentService.setAuthToken(
        token
    );

    studentImages.setAuthToken(
        token
    );


    return true;
}


async function loadStudent(studentId) {

    try {

        const response =
            await studentService.find(
                studentId
            );


        if (
            !response ||
            response.status !== "success"
        ) {

            alert(response?.message || "Não foi possível carregar o aluno.");

            window.location.href =
                "students.html";

            return;
        }


        currentStudent =
            response.data;


        renderStudentProfile(
            currentStudent
        );


        workoutsManager =
            new StudentWorkouts({
                student: currentStudent,
                storage
            });


        if (workoutsManager) {
            try {
                await workoutsManager.load();
            } catch (errW) {
                console.error("Erro ao carregar treinos:", errW);
            }
        }

        try {
            await loadStudentGallery(currentStudent.id);
            initStudentGalleryActions(currentStudent.id);
        } catch (errG) {
            console.error("Erro ao carregar galeria de fotos:", errG);
        }

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR ALUNO:",
            error
        );

        alert(error.message || "Erro ao carregar os dados do aluno.");

        setTimeout(
            () => {

                window.location.href =
                    "students.html";

            },
            1200
        );
    }
}


function renderStudentProfile(student) {

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

        <!-- ── GALERIA DE EVOLUÇÃO DO ALUNO ── -->
        <div class="card" style="margin-top:var(--space-lg);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md);">
                <h3>📷 Fotos de Evolução / Acompanhamento</h3>
                <div>
                    <label for="studentGalleryInput" class="btn btn-primary btn-sm" style="cursor:pointer;">
                        ➕ Adicionar Fotos
                    </label>
                    <input 
                        type="file" 
                        id="studentGalleryInput" 
                        multiple 
                        accept="image/jpeg, image/png, image/webp" 
                        style="display:none;" 
                    />
                </div>
            </div>

            <div 
                id="studentGalleryGrid" 
                style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:16px;"
            >
                <p style="color:var(--clr-grey-500);grid-column:1/-1;text-align:center;">
                    Carregando galeria...
                </p>
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

async function loadStudentGallery(studentId) {

    const grid =
        document.getElementById(
            "studentGalleryGrid"
        );

    if (!grid || !studentId) {
        return;
    }

    try {

        const response =
            await studentImages.list(studentId);

        const images =
            Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

        if (images.length === 0) {

            grid.innerHTML = `
                <p style="color: var(--clr-grey-500); grid-column: 1 / -1; text-align: center; padding: 20px 0;">
                    Nenhuma foto de evolução cadastrada para este aluno.
                </p>`;

            return;
        }

        grid.innerHTML =
            images.map(img => {

                const rawPath =
                    img.image_path ||
                    img.path ||
                    "";

                let srcUrl = rawPath;

                if (
                    !rawPath.startsWith("http") &&
                    !rawPath.startsWith("blob:")
                ) {

                    const clean =
                        rawPath.replace(/^\/+/, "");

                    srcUrl =
                        clean.startsWith("trainify/")
                            ? `/${clean}`
                            : `/trainify/${clean}`;
                }

                return `
                    <div class="gallery-item" style="position: relative; border-radius: 8px; overflow: hidden; height: 120px; background: #1a1a1a;">
                        <img 
                            src="${srcUrl}" 
                            alt="${img.alt_text || 'Foto de evolução'}" 
                            style="width: 100%; height: 100%; object-fit: cover; display: block;" 
                            onerror="this.style.opacity='0.3';"
                        />
                        <button 
                            type="button" 
                            class="btn-delete-student-img" 
                            data-id="${img.id}"
                            title="Excluir imagem"
                            style="position: absolute; top: 6px; right: 6px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 4px; width: 26px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: background 0.2s;"
                        >
                            🗑️
                        </button>
                    </div>
                `;

            }).join("");

        bindStudentGalleryDeleteEvents(studentId);

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR GALERIA DO ALUNO:",
            error
        );

        grid.innerHTML = `
            <p style="color: var(--color-danger, #ef4444); grid-column: 1 / -1; text-align: center;">
                Erro ao carregar fotos de evolução.
            </p>`;
    }
}


function initStudentGalleryActions(studentId) {

    const galleryInput =
        document.getElementById(
            "studentGalleryInput"
        );

    if (!galleryInput) {
        return;
    }

    const newGalleryInput =
        galleryInput.cloneNode(true);

    galleryInput.parentNode.replaceChild(
        newGalleryInput,
        galleryInput
    );

    newGalleryInput.addEventListener(
        "change",
        async (event) => {

            const files =
                event.target.files;

            if (!files || files.length === 0) {
                return;
            }

            try {

                const response =
                    await studentImages.upload(
                        studentId,
                        files
                    );

                if (
                    response?.status === "success" ||
                    response?.code === 201 ||
                    response?.code === 200
                ) {

                    await loadStudentGallery(studentId);

                } else {

                    alert(response?.message || "Erro ao enviar imagem(ns).");
                }

            } catch (error) {

                console.error(
                    "ERRO NO UPLOAD DA GALERIA DO ALUNO:",
                    error
                );

                alert(error.message || "Erro ao enviar imagem(ns).");

            } finally {

                newGalleryInput.value = "";
            }
        }
    );
}


function bindStudentGalleryDeleteEvents(studentId) {

    document.querySelectorAll(".btn-delete-student-img").forEach(btn => {

        btn.addEventListener("click", async () => {

            const imageId =
                btn.dataset.id;

            if (!imageId) {
                return;
            }

            const confirmed =
                confirm("Deseja realmente remover esta foto de evolução?");

            if (!confirmed) {
                return;
            }

            try {

                const response =
                    await studentImages.deleteImage(
                        studentId,
                        imageId
                    );

                if (
                    response?.status === "success" ||
                    response?.code === 200
                ) {

                    await loadStudentGallery(studentId);

                } else {

                    alert(response?.message || "Não foi possível remover a foto.");
                }

            } catch (error) {

                console.error(
                    "ERRO AO DELETAR IMAGEM DA GALERIA DO ALUNO:",
                    error
                );

                alert(error.message || "Erro ao remover a imagem.");
            }
        });
    });
}


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

                        alert("A exportação do PDF será integrada posteriormente.");

                        break;


                    case "remove-student":

                        await confirmDelete();

                        break;


                    case "cancel-form":

                        window.location.href =
                            "students.html";

                        break;


                    case "cancel-edit-student":

                        renderStudentProfile(
                            currentStudent
                        );


                        if (workoutsManager) {
                            try {
                                await workoutsManager.load();
                            } catch (errW) {
                                console.error(errW);
                            }
                        }

                        try {
                            await loadStudentGallery(currentStudent.id);
                            initStudentGalleryActions(currentStudent.id);
                        } catch (errG) {
                            console.error(errG);
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

                console.error(
                    "ERRO NA AÇÃO:",
                    error
                );

                alert(error.message || "Não foi possível executar a ação.");
            }
        }
    );
}

function editStudent() {

    if (!currentStudent) {
        return;
    }


    renderEditStudentForm(
        currentStudent
    );
}


function renderEditStudentForm(student) {

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
                style="margin-bottom:var(--space-xl);"
            >
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

                        <label>
                            Email
                        </label>

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

                        <label>
                            Telefone
                        </label>

                        <input
                            class="form-control"
                            name="phone"
                            value="${escapeAttribute(
                                student.phone || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            Academia
                        </label>

                        <input
                            class="form-control"
                            name="gym"
                            value="${escapeAttribute(
                                student.gym || ""
                            )}"
                        />

                    </div>


                    <div class="form-group">

                        <label>
                            Nível de Treino *
                        </label>

                        ${trainingLevelSelect(
                            student.trainingLevelId
                        )}

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


    document
        .getElementById(
            "editStudentForm"
        )
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
                .map(
                    ([id, label]) => `
                        <option
                            value="${id}"
                            ${
                                Number(selected) === id
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${label}
                        </option>
                    `
                )
                .join("")}

        </select>
    `;
}


async function handleEditStudentSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = document.getElementById("updateStudentBtn");

    try {
        const data = studentFormController.serialize(form);

        if (!studentFormController.validateRequired(form, ["name", "training_level_id"])) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        const trainingLevelId = Number(data.training_level_id);
        const goalId = data.goal_id ? Number(data.goal_id) : null;

        const student = new Student({
            name: data.name?.trim(),
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            birthdate: data.birthdate || null,
            gym: data.gym?.trim() || null,
            notes: data.notes?.trim() || null,
            trainingLevelId: !isNaN(trainingLevelId) ? trainingLevelId : null,
            goalId: goalId && !isNaN(goalId) ? goalId : null
        });

        button.disabled = true;
        button.textContent = "Salvando...";

        const response = await studentService.update(currentStudent.id, student);

        if (!response || response.status !== "success") {
            alert(response?.message || "Não foi possível atualizar o aluno.");
            button.disabled = false;
            button.textContent = "Salvar alterações";
            return;
        }

        currentStudent = response.data || student;

        renderStudentProfile(currentStudent);

        workoutsManager = new StudentWorkouts({
            student: currentStudent,
            storage
        });

        if (workoutsManager) {
            try {
                await workoutsManager.load();
            } catch (errW) {
                console.error(errW);
            }
        }

        try {
            await loadStudentGallery(currentStudent.id);
            initStudentGalleryActions(currentStudent.id);
        } catch (errG) {
            console.error(errG);
        }
    } catch (error) {
        console.error("ERRO AO ATUALIZAR ALUNO:", error);
        alert(error.message || "Erro ao atualizar aluno.");
        button.disabled = false;
        button.textContent = "Salvar alterações";
    }
}

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
                style="margin-bottom:var(--space-xl);"
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


    document
        .getElementById(
            "newStudentForm"
        )
        ?.addEventListener(
            "submit",
            handleNewStudentSubmit
        );
}


async function handleNewStudentSubmit(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const button =
        document.getElementById(
            "saveStudentBtn"
        );


    try {

        const data =
            studentFormController.serialize(
                form
            );


        if (
            !studentFormController.validateRequired(
                form,
                [
                    "name",
                    "training_level_id"
                ]
            )
        ) {

            alert("Preencha os campos obrigatórios.");

            return;
        }


        const name =
            data.name?.trim();


        const trainingLevelId =
            data.training_level_id;


        const student =
            new Student({

                name,

                email:
                    data.email?.trim() ||
                    null,

                phone:
                    data.phone?.trim() ||
                    null,

                birthdate:
                    data.birthdate ||
                    null,

                gym:
                    data.gym?.trim() ||
                    null,

                notes:
                    data.notes?.trim() ||
                    null,

                trainingLevelId:
                    Number(
                        trainingLevelId
                    ),

                goalId:
                    data.goal_id
                        ? Number(
                            data.goal_id
                        )
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

            alert(response?.message || "Não foi possível cadastrar o aluno.");

            button.disabled = false;

            button.textContent =
                "Cadastrar Aluno";

            return;
        }


        const createdStudent =
            response.data;


        if (createdStudent?.id) {

            window.location.href =
                `student.html?id=${createdStudent.id}`;

        } else {

            window.location.href =
                "students.html";
        }

    } catch (error) {

        console.error(
            "ERRO AO CADASTRAR ALUNO:",
            error
        );

        alert(error.message || "Erro ao cadastrar aluno.");

        button.disabled = false;

        button.textContent =
            "Cadastrar Aluno";
    }
}

async function confirmDelete() {

    if (!currentStudent) {
        return;
    }


    const confirmed =
        confirm(
            `Tem certeza que deseja remover o aluno "${currentStudent.name}"?\n\nEsta ação apagará todos os treinos e fotos de evolução vinculados.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await studentService.delete(
                currentStudent.id
            );


        if (
            !response ||
            response.status !== "success"
        ) {

            alert(response?.message || "Não foi possível remover o aluno.");

            return;
        }


        setTimeout(
            () => {

                window.location.href =
                    "students.html";

            },
            500
        );

    } catch (error) {

        console.error(
            "ERRO AO REMOVER ALUNO:",
            error
        );

        alert(error.message || "Erro ao remover o aluno.");
    }
}


function initials(name = "") {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "AL";
    }

    const res =
        parts.length > 1
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0].slice(0, 2);

    return res.toUpperCase();
}


function fmtDate(isoStr) {

    if (!isoStr) {
        return "—";
    }

    const parts =
        isoStr.split("T")[0].split("-");

    if (parts.length !== 3) {
        return isoStr;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function escapeHtml(str) {

    if (str === null || str === undefined) {
        return "";
    }

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(str) {

    return escapeHtml(str);
}