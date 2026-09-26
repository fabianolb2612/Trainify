/**
 * TrainiFy - students.js
 * Lista de alunos integrada com a API.
 */

import StudentService from "../../_common/services/StudentService.js";
import SessionStorage from "../../_common/scripts/storage.js";

const studentService = new StudentService();
const storage = new SessionStorage();

const LEVEL_LABEL = {
    iniciante: "Iniciante",
    beginner: "Iniciante",

    intermediário: "Intermediário",
    intermediario: "Intermediário",
    intermediate: "Intermediário",

    avançado: "Avançado",
    avancado: "Avançado",
    advanced: "Avançado"
};

let students = [];
let filtered = [];

let currentPage = 1;
const PER_PAGE = 6;

let studentsBootstrapped = false;


/**
 * Inicialização da página
 */
async function bootstrapStudentsPage() {
    if (studentsBootstrapped) {
        return;
    }

    studentsBootstrapped = true;

    try {
        const token = storage.getToken();

        if (!token) {
            window.location.href = "../public/login.html";
            return;
        }

        // O endpoint /students é protegido por JWT.
        studentService.setAuthToken(token);

        await loadStudents();

        initFilters();
        initStudentActions();

        document
            .getElementById("addStudentBtn")
            ?.addEventListener("click", () => {
                window.location.href = "student.html?new=1";
            });

    } catch (error) {
        console.error("Erro ao carregar alunos:", error);

        showTableMessage(
            "Não foi possível carregar os alunos."
        );
    }
}


/**
 * Busca os alunos na API.
 */
async function loadStudents() {
    showLoading();

    const response = await studentService.list();

    console.log("RESPOSTA DA API - ALUNOS:", response);

    if (response?.status !== "success") {
        throw new Error(
            response?.message || "Erro ao buscar alunos."
        );
    }

    students = Array.isArray(response.data)
        ? response.data
        : [];

    filtered = [...students];

    updateStats();

    currentPage = 1;

    renderTable(filtered);
}


/**
 * Atualiza os cards de estatísticas.
 */
function updateStats() {
    const total = students.length;

    const active = students.filter(
        student => Number(student.active) === 1
    ).length;

    const beginners = students.filter(
        student => normalizeLevel(
            student.trainingLevel
        ) === "beginner"
    ).length;

    const advanced = students.filter(
        student => normalizeLevel(
            student.trainingLevel
        ) === "advanced"
    ).length;

    setEl("statStudents", total);
    setEl("statActive", active);
    setEl("statBeginner", beginners);
    setEl("statAdvanced", advanced);
    setEl("studentsCount", total);
}


/**
 * Configura os eventos da tabela.
 */
function initStudentActions() {
    const tbody = document.getElementById(
        "studentsTableBody"
    );

    tbody?.addEventListener("click", event => {
        const row = event.target.closest(
            "tr[data-student-id]"
        );

        if (!row) {
            return;
        }

        const studentId = row.dataset.studentId;

        window.location.href =
            `student.html?student=${studentId}`;
    });


    const pagination =
        document.getElementById("pagination");

    pagination?.addEventListener("click", event => {
        const button = event.target.closest(
            "button[data-page]"
        );

        if (!button) {
            return;
        }

        goToPage(
            Number(button.dataset.page)
        );
    });
}
document.addEventListener("click", event => {
    const row = event.target.closest(".student-row");

    if (!row) {
        return;
    }

    const studentId = row.dataset.studentId;

    if (!studentId) {
        return;
    }

    window.location.href = `student.html?id=${studentId}`;
});

/**
 * Renderiza a tabela.
 */
function renderTable(list) {
    const tbody =
        document.getElementById("studentsTableBody");

    if (!tbody) {
        return;
    }

    const start =
        (currentPage - 1) * PER_PAGE;

    const page =
        list.slice(start, start + PER_PAGE);


    if (!page.length) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:32px;
                        color:var(--clr-grey-500);
                    "
                >
                    Nenhum aluno encontrado.
                </td>
            </tr>
        `;

        renderPagination(0);

        return;
    }


    tbody.innerHTML = page.map(student => {

        const level =
            getLevelLabel(student.trainingLevel);

        const status =
            Number(student.active) === 1
                ? "active"
                : "inactive";

        return `
            <tr
                data-student-id="${student.id}"
                class="student-row"
                style="cursor:pointer;"
            >

                <td>
                    <div class="student-cell">

                        <div class="student-avatar">
                            ${initials(student.name)}
                        </div>

                        <div>
                            <div class="student-name">
                                ${student.name}
                            </div>

                            <div class="student-email">
                                ${student.email || "—"}
                            </div>
                        </div>

                    </div>
                </td>

                <td>
                    ${student.phone || "—"}
                </td>

                <td>
                    <span class="badge badge-info">
                        ${level}
                    </span>
                </td>

                <td>
                    ${student.gym || "—"}
                </td>

                <td>
                    <span class="badge ${
                        status === "active"
                            ? "badge-neon"
                            : "badge-warn"
                    }">
                        ${
                            status === "active"
                                ? "Ativo"
                                : "Inativo"
                        }
                    </span>
                </td>

            </tr>
        `;
    }).join("");

    renderPagination(list.length);
}


/**
 * Renderiza paginação.
 */
function renderPagination(total) {
    const container =
        document.getElementById("pagination");

    if (!container) {
        return;
    }

    const pages =
        Math.ceil(total / PER_PAGE);

    if (pages <= 1) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML =
        Array.from(
            { length: pages },
            (_, index) => {

                const page =
                    index + 1;

                return `
                    <button
                        class="btn btn-sm ${
                            page === currentPage
                                ? "btn-primary"
                                : "btn-ghost"
                        }"
                        data-page="${page}"
                    >
                        ${page}
                    </button>
                `;
            }
        ).join("");
}


/**
 * Troca de página.
 */
function goToPage(page) {
    currentPage = page;

    renderTable(filtered);
}


/**
 * Inicializa os filtros.
 */
function initFilters() {
    const search =
        document.getElementById("searchInput");

    const level =
        document.getElementById("levelFilter");

    const status =
        document.getElementById("statusFilter");


    const run = () => {

        currentPage = 1;

        const q =
            search?.value
                .trim()
                .toLowerCase() || "";

        const lv =
            level?.value || "";

        const st =
            status?.value || "";


        filtered = students.filter(student => {

            const name =
                (student.name || "")
                    .toLowerCase();

            const email =
                (student.email || "")
                    .toLowerCase();

            const studentLevel =
                normalizeLevel(
                    student.trainingLevel
                );

            const studentStatus =
                Number(student.active) === 1
                    ? "active"
                    : "inactive";


            return (
                (
                    !q ||
                    name.includes(q) ||
                    email.includes(q)
                ) &&

                (
                    !lv ||
                    studentLevel === lv
                ) &&

                (
                    !st ||
                    studentStatus === st
                )
            );
        });


        renderTable(filtered);
    };


    search?.addEventListener(
        "input",
        debounce(run, 200)
    );

    level?.addEventListener(
        "change",
        run
    );

    status?.addEventListener(
        "change",
        run
    );
}


/**
 * Pesquisa da barra superior.
 * É chamada pelo app-layout.js.
 */
function onTopbarSearch(q) {
    const search =
        document.getElementById("searchInput");

    if (!search) {
        return;
    }

    search.value = q;

    search.dispatchEvent(
        new Event("input")
    );
}


/**
 * Mostra loading na tabela.
 */
function showLoading() {
    const tbody =
        document.getElementById(
            "studentsTableBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="
                    text-align:center;
                    padding:32px;
                "
            >
                <span class="spinner"></span>
            </td>
        </tr>
    `;
}


/**
 * Mostra mensagem na tabela.
 */
function showTableMessage(message) {
    const tbody =
        document.getElementById(
            "studentsTableBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="
                    text-align:center;
                    padding:32px;
                    color:var(--clr-grey-500);
                "
            >
                ${message}
            </td>
        </tr>
    `;
}


/**
 * Converte diferentes formatos de nível
 * para o valor usado pelo filtro.
 */
function normalizeLevel(level) {

    if (!level) {
        return "";
    }

    const value =
        String(level)
            .trim()
            .toLowerCase();


    if (
        value === "iniciante" ||
        value === "beginner"
    ) {
        return "beginner";
    }


    if (
        value === "intermediário" ||
        value === "intermediario" ||
        value === "intermediate"
    ) {
        return "intermediate";
    }


    if (
        value === "avançado" ||
        value === "avancado" ||
        value === "advanced"
    ) {
        return "advanced";
    }


    return value;
}


/**
 * Retorna o nome amigável do nível.
 */
function getLevelLabel(level) {

    if (!level) {
        return "—";
    }

    const normalized =
        normalizeLevel(level);

    return (
        LEVEL_LABEL[normalized] ||
        level
    );
}


/**
 * Gera iniciais do aluno.
 */
function initials(name = "") {

    const parts =
        name.trim().split(/\s+/);

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
 * Define texto de um elemento.
 */
function setEl(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/**
 * Debounce para pesquisa.
 */
function debounce(fn, ms) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(
            () => fn(...args),
            ms
        );
    };
}


/**
 * Inicialização da página.
 */
document.addEventListener(
    "DOMContentLoaded",
    bootstrapStudentsPage
);

if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
) {
    bootstrapStudentsPage();
}