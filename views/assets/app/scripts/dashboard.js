import StudentService from "../../_common/services/StudentService.js";
import WorkoutService from "../../_common/services/WorkoutService.js";
import SessionStorage from "../../_common/scripts/storage.js";


const studentService = new StudentService();
const workoutService = new WorkoutService();
const storage = new SessionStorage();


document.addEventListener("DOMContentLoaded", async () => {

    const token = storage.getToken();

    if (!token) {
        window.location.href = "../public/login.html";
        return;
    }

    studentService.setAuthToken(token);
    workoutService.setAuthToken(token);

    initDashboardActions();

    await loadDashboard();
});


async function loadDashboard() {

    try {

        const [
            studentsResponse,
            workoutsResponse
        ] = await Promise.all([
            studentService.list(),
            workoutService.list()
        ]);

        console.log(
            "ALUNOS DO DASHBOARD:",
            studentsResponse
        );

        console.log(
            "TREINOS DO DASHBOARD:",
            workoutsResponse
        );


        if (studentsResponse?.status !== "success") {
            throw new Error(
                studentsResponse?.message ||
                "Não foi possível carregar os alunos."
            );
        }

        if (workoutsResponse?.status !== "success") {
            throw new Error(
                workoutsResponse?.message ||
                "Não foi possível carregar os treinos."
            );
        }


        const students =
            Array.isArray(studentsResponse.data)
                ? studentsResponse.data
                : [];

        const workouts =
            Array.isArray(workoutsResponse.data)
                ? workoutsResponse.data
                : [];


        renderStats(students, workouts);

        renderRecentStudents(students);

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR DASHBOARD:",
            error
        );

        showDashboardError(
            error.message ||
            "Não foi possível carregar os dados do dashboard."
        );
    }
}


function renderStats(students, workouts) {

    setEl(
        "statStudents",
        students.length
    );

    setEl(
        "statWorkouts",
        workouts.length
    );
}


function renderRecentStudents(students) {

    const tbody =
        document.getElementById(
            "recentStudentsBody"
        );

    if (!tbody) {
        return;
    }


    if (students.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="text-align:center;padding:32px;"
                >
                    Nenhum aluno cadastrado.
                </td>
            </tr>
        `;

        return;
    }


    const recentStudents =
        students.slice(0, 5);


    tbody.innerHTML =
        recentStudents.map(student => `

            <tr
                data-student-id="${student.id}"
                class="student-row"
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
                    <span class="badge badge-info">
                        ${student.trainingLevel || "—"}
                    </span>
                </td>


                <td>
                    ${student.gym || "—"}
                </td>


                <td>
                    <span class="badge badge-neon">
                        Ativo
                    </span>
                </td>

            </tr>

        `).join("");


    bindStudentRowClicks();
}


function bindStudentRowClicks() {

    const tbody =
        document.getElementById(
            "recentStudentsBody"
        );

    if (!tbody) {
        return;
    }


    tbody.onclick = event => {

        const row =
            event.target.closest(
                "tr[data-student-id]"
            );

        if (!row) {
            return;
        }


        const studentId =
            row.dataset.studentId;


        window.location.href =
            `student.html?id=${studentId}`;
    };
}


function initDashboardActions() {

    document
        .querySelectorAll(
            ".quick-action-btn[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    if (action === "new-student") {

                        window.location.href =
                            "student.html?new=1";

                    } else if (
                        action === "view-students"
                    ) {

                        window.location.href =
                            "students.html";

                    } else if (
                        action === "view-profile"
                    ) {

                        window.location.href =
                            "profile.html";
                    }
                }
            );
        });
}


function showDashboardError(message) {

    const tbody =
        document.getElementById(
            "recentStudentsBody"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="4"
                style="text-align:center;padding:32px;"
            >
                ${message}
            </td>
        </tr>
    `;
}


function setEl(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function initials(name = "") {

    const parts =
        name.trim().split(" ");


    return (
        parts.length > 1
            ? parts[0][0] +
              parts[parts.length - 1][0]
            : parts[0].slice(0, 2)
    ).toUpperCase();
}