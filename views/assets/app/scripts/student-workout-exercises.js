import ExerciseService from "../../_common/services/ExerciseService.js";
import WorkoutDayExerciseService from "../../_common/services/WorkoutDayExerciseService.js";
import WorkoutDayExercise from "../../_common/classes/WorkoutDayExercise.js";

export default class StudentWorkoutExercises {
    constructor({ getWorkouts, storage }) {
        this.getWorkouts = getWorkouts;
        this.storage = storage;
        this.exerciseService = new ExerciseService();
        this.workoutDayExerciseService = new WorkoutDayExerciseService();
        this.catalog = [];
        this.formState = null;
    }

    configureServices(token) {
        this.exerciseService.setAuthToken(token);
        this.workoutDayExerciseService.setAuthToken(token);
    }

    async load(day) {
        try {
            const response = await this.workoutDayExerciseService.listByWorkoutDay(day.id);
            
            if (!response || response.status !== "success" && response.type !== "success") {
                day.exercises = [];
                return;
            }

            day.exercises = Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error("ERRO AO CARREGAR EXERCÍCIOS:", error);
            day.exercises = [];
        }
    }

    async loadCatalog() {
        if (this.catalog.length > 0) return;

        const response = await this.exerciseService.list();

        if (!response || response.status !== "success") {
            throw new Error(response?.message || "Não foi possível carregar os exercícios.");
        }

        this.catalog = Array.isArray(response.data) ? response.data : [];
    }

    find(exerciseItemId) {
        for (const workout of this.getWorkouts()) {
            const days = Array.isArray(workout.days) ? workout.days : [];

            for (const day of days) {
                const exercises = Array.isArray(day.exercises) ? day.exercises : [];

                const exercise = exercises.find(
                    item => Number(item.id) === Number(exerciseItemId)
                );

                if (exercise) {
                    return { exercise, day, workoutId: workout.id };
                }
            }
        }

        return null;
    }

    findDay(dayId) {
        for (const workout of this.getWorkouts()) {
            const days = Array.isArray(workout.days) ? workout.days : [];

            const day = days.find(
                item => Number(item.id) === Number(dayId)
            );

            if (day) return { day, workout };
        }

        return null;
    }

    renderPreview(exercise) {
        const name =
            exercise.exerciseName ||
            exercise.exercise?.name ||
            `Exercício #${exercise.exerciseId}`;

        return `
            <div class="exercise-row">
                <div class="exercise-name">${escapeHtml(name)}</div>

                <div class="exercise-meta">
                    <span>${exercise.sets}</span>
                    Séries
                </div>

                <div class="exercise-meta">
                    <span>${escapeHtml(exercise.reps)}</span>
                    Reps
                </div>

                <div class="exercise-meta">
                    <span>${exercise.restSeconds}s</span>
                    Descanso
                </div>
            </div>
        `;
    }

    renderModal(exercise) {
        const name =
            exercise.exerciseName ||
            exercise.exercise?.name ||
            `Exercício #${exercise.exerciseId}`;

        return `
            <div class="modal-exercise-row" style="align-items:center;">
                <div style="flex:1;min-width:150px;">
                    <strong>${escapeHtml(name)}</strong>

                    ${
                        exercise.notes
                            ? `
                                <div style="font-size:.75rem;color:var(--clr-grey-500);margin-top:3px;">
                                    ${escapeHtml(exercise.notes)}
                                </div>
                            `
                            : ""
                    }
                </div>

                <div class="exercise-meta">
                    <span>${exercise.sets}</span>
                    séries
                </div>

                <div class="exercise-meta">
                    <span>${escapeHtml(exercise.reps)}</span>
                    reps
                </div>

                <div class="exercise-meta">
                    <span>${exercise.restSeconds}s</span>
                    descanso
                </div>

                <div style="display:flex;gap:4px;">
                    <button
                        class="btn btn-ghost btn-sm"
                        type="button"
                        data-action="edit-day-exercise"
                        data-exercise-item-id="${exercise.id}"
                    >✏</button>

                    <button
                        class="btn btn-danger btn-sm"
                        type="button"
                        data-action="remove-day-exercise"
                        data-exercise-item-id="${exercise.id}"
                    >✕</button>
                </div>
            </div>
        `;
    }

    renderAddForm(dayId) {
        return `
            <form
                id="addDayExerciseForm"
                style="margin-top:14px;padding:16px;border:1px solid var(--clr-border);border-radius:10px;background:var(--clr-bg-secondary);display:grid;gap:14px;"
            >
                <div>
                    <strong>Adicionar exercício</strong>
                    <p style="color:var(--clr-grey-500);font-size:.8rem;margin-top:4px;">
                        Configure o exercício para este dia.
                    </p>
                </div>

                <div class="form-group">
                    <label>Exercício *</label>

                    <select class="form-control" name="exerciseId" required>
                        <option value="">Selecione um exercício</option>

                        ${this.catalog.map(exercise => `
                            <option value="${exercise.id}">
                                ${escapeHtml(exercise.name)}
                            </option>
                        `).join("")}
                    </select>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
                    <div class="form-group">
                        <label>Séries *</label>
                        <input class="form-control" type="number" name="sets" min="1" value="3" required>
                    </div>

                    <div class="form-group">
                        <label>Repetições *</label>
                        <input class="form-control" type="text" name="reps" value="12" required placeholder="Ex.: 10-12">
                    </div>

                    <div class="form-group">
                        <label>Descanso (s) *</label>
                        <input class="form-control" type="number" name="restSeconds" min="0" value="60" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Observações</label>
                    <textarea class="form-control" name="notes" rows="3" placeholder="Ex.: Executar lentamente..."></textarea>
                </div>

                <div class="form-message" style="display:none;"></div>

                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="cancel-day-exercise-form"
                        data-day-id="${dayId}"
                    >Cancelar</button>

                    <button type="submit" class="btn btn-primary">
                        Adicionar exercício
                    </button>
                </div>
            </form>
        `;
    }

    renderEditForm(item) {
        const exerciseId = item.exercise.exerciseId;

        return `
            <form
                id="editDayExerciseForm"
                style="margin-top:14px;padding:16px;border:1px solid var(--clr-border);border-radius:10px;background:var(--clr-bg-secondary);display:grid;gap:14px;"
            >
                <div>
                    <strong>Editar exercício</strong>
                    <p style="color:var(--clr-grey-500);font-size:.8rem;margin-top:4px;">
                        Altere as configurações deste exercício.
                    </p>
                </div>

                <div class="form-group">
                    <label>Exercício</label>

                    <select class="form-control" name="exerciseId" required>
                        ${this.catalog.map(exercise => `
                            <option
                                value="${exercise.id}"
                                ${Number(exercise.id) === Number(exerciseId) ? "selected" : ""}
                            >
                                ${escapeHtml(exercise.name)}
                            </option>
                        `).join("")}
                    </select>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
                    <div class="form-group">
                        <label>Séries *</label>
                        <input
                            class="form-control"
                            type="number"
                            name="sets"
                            min="1"
                            value="${escapeAttribute(item.exercise.sets)}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Repetições *</label>
                        <input
                            class="form-control"
                            type="text"
                            name="reps"
                            value="${escapeAttribute(item.exercise.reps)}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Descanso (s) *</label>
                        <input
                            class="form-control"
                            type="number"
                            name="restSeconds"
                            min="0"
                            value="${escapeAttribute(item.exercise.restSeconds)}"
                            required
                        >
                    </div>
                </div>

                <div class="form-group">
                    <label>Observações</label>

                    <textarea class="form-control" name="notes" rows="3">${escapeHtml(item.exercise.notes || "")}</textarea>
                </div>

                <div class="form-message" style="display:none;"></div>

                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="cancel-day-exercise-form"
                        data-day-id="${item.day.id}"
                    >Cancelar</button>

                    <button type="submit" class="btn btn-primary">
                        Salvar alterações
                    </button>
                </div>
            </form>
        `;
    }

    async add(dayId) {
        const result = this.findDay(dayId);

        if (!result) {
            throw new Error("Dia de treino não encontrado.");
        }

        try {
            await this.loadCatalog();

            if (!this.catalog.length) {
                throw new Error("Nenhum exercício disponível no catálogo.");
            }

            this.formState = {
                type: "add",
                dayId: Number(dayId)
            };

            await this.openWorkoutModal(result.workout.id);
        } catch (error) {
            console.error("ERRO AO ABRIR FORMULÁRIO DE EXERCÍCIO:", error);
            throw error;
        }
    }

    async edit(exerciseItemId) {
        const item = this.find(exerciseItemId);

        if (!item) {
            throw new Error("Exercício não encontrado.");
        }

        try {
            await this.loadCatalog();

            this.formState = {
                type: "edit",
                exerciseItemId: Number(exerciseItemId)
            };

            await this.openWorkoutModal(item.workoutId);
        } catch (error) {
            console.error("ERRO AO ABRIR EDIÇÃO DO EXERCÍCIO:", error);
            throw error;
        }
    }

    async openWorkoutModal(workoutId) {
        const manager = this.getWorkoutManager();

        if (!manager) {
            throw new Error("Gerenciador de treinos não encontrado.");
        }

        await manager.openModal(Number(workoutId));
        this.bindForm();
    }

    bindForm() {
        if (!this.formState) return;

        if (this.formState.type === "add") {
            const form = document.getElementById("addDayExerciseForm");

            if (!form) return;

            form.addEventListener(
                "submit",
                event => this.saveAddForm(
                    event,
                    this.formState.dayId
                )
            );

            return;
        }

        if (this.formState.type === "edit") {
            const form = document.getElementById("editDayExerciseForm");

            if (!form) return;

            form.addEventListener(
                "submit",
                event => this.saveEditForm(
                    event,
                    this.formState.exerciseItemId
                )
            );
        }
    }

    async saveAddForm(event, dayId) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const exerciseId = Number(data.get("exerciseId"));
    const sets = Number(data.get("sets"));
    const reps = data.get("reps")?.trim();
    const restSeconds = Number(data.get("restSeconds"));
    const notes = data.get("notes")?.trim() || null;

    const message = form.querySelector(".form-message");

    if (!exerciseId || !sets || !reps) {
        this.showFormMessage(
            message,
            "Preencha todos os campos obrigatórios.",
            "error"
        );
        return;
    }

    try {
        const result = this.findDay(dayId);

        if (!result) {
            throw new Error("Dia de treino não encontrado.");
        }

        const exercises = Array.isArray(result.day.exercises)
            ? result.day.exercises
            : [];

        const item = new WorkoutDayExercise({
            workoutDayId: Number(dayId),
            exerciseId: exerciseId,
            sets: sets,
            reps: reps,
            restSeconds: restSeconds,
            order: exercises.length + 1,
            notes: notes
        });

        console.log(
            "DADOS ENVIADOS:",
            item.toPayload()
        );

        const response =
            await this.workoutDayExerciseService.create(item);

        console.log(
            "========== RESPOSTA DA API =========="
        );

        console.log(
            "response:",
            response
        );

        console.log(
            "response.status:",
            response?.status
        );

        console.log(
            "response.type:",
            response?.type
        );

        console.log(
            "response.message:",
            response?.message
        );

        console.log(
            "response.data:",
            response?.data
        );

        console.log(
            "======================================"
        );

        const success =
            response?.status === "success" ||
            response?.type === "success";

        if (!success) {
            throw new Error(
                response?.message ||
                response?.error ||
                "Não foi possível adicionar o exercício."
            );
        }

        this.formState = null;

        await this.reload(result.workoutId);

    } catch (error) {
        console.error(
            "ERRO AO ADICIONAR EXERCÍCIO:",
            error
        );

        this.showFormMessage(
            message,
            error.message ||
            "Erro ao adicionar exercício.",
            "error"
        );
    }

}

    async saveEditForm(event, exerciseItemId) {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);

        const exerciseId = Number(data.get("exerciseId"));
        const sets = Number(data.get("sets"));
        const reps = data.get("reps")?.trim();
        const restSeconds = Number(data.get("restSeconds"));
        const notes = data.get("notes")?.trim() || null;

        const message = form.querySelector(".form-message");

        if (!exerciseId || !sets || !reps) {
            this.showFormMessage(
                message,
                "Preencha todos os campos obrigatórios.",
                "error"
            );
            return;
        }

        const item = this.find(exerciseItemId);

        if (!item) {
            this.showFormMessage(
                message,
                "Exercício não encontrado.",
                "error"
            );
            return;
        }

        try {
            const updated = new WorkoutDayExercise({
                id: item.exercise.id,
                workoutDayId: item.exercise.workoutDayId,
                exerciseId,
                sets: Number(sets),
                reps: reps.trim(),
                restSeconds: Number(restSeconds),
                order:
                    item.exercise.order ??
                    item.exercise.displayOrder ??
                    1,
                notes: notes?.trim() || null
            });

            const response =
                await this.workoutDayExerciseService.update(
                    item.exercise.id,
                    updated
                );

            if (!response || response.status !== "success") {
                throw new Error(
                    response?.message ||
                    "Não foi possível atualizar o exercício."
                );
            }

            this.formState = null;
            await this.reload(item.workoutId);
        } catch (error) {
            console.error("ERRO AO EDITAR EXERCÍCIO:", error);

            this.showFormMessage(
                message,
                error.message || "Erro ao atualizar exercício.",
                "error"
            );
        }
    }

    async remove(exerciseItemId) {
        const result = this.find(exerciseItemId);

        if (!result) return;

        const modal = document.getElementById("workoutModal");
        const body = document.getElementById("workoutModalBody");
        const title = document.getElementById("workoutModalTitle");
        const subtitle = document.getElementById("workoutModalSubtitle");

        if (!modal || !body) return;

        const name =
            result.exercise.exerciseName ||
            result.exercise.exercise?.name ||
            `Exercício #${result.exercise.exerciseId}`;

        this.formState = null;

        title.textContent = "Remover exercício";
        subtitle.textContent = "Confirme a remoção deste exercício.";

        body.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div style="font-size:2rem;margin-bottom:16px;">⚠</div>

                <h3>
                    Remover "${escapeHtml(name)}"?
                </h3>

                <p style="color:var(--clr-grey-500);margin:10px 0 24px;">
                    O exercício será removido deste dia.
                </p>

                <div style="display:flex;justify-content:center;gap:8px;">
                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-action="back-workout-modal"
                        data-workout-id="${result.workoutId}"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger"
                        data-action="confirm-remove-day-exercise"
                        data-exercise-item-id="${exerciseItemId}"
                    >
                        Remover exercício
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
    }

    async confirmRemove(exerciseItemId) {
        const result = this.find(exerciseItemId);

        if (!result) return;

        const response =
            await this.workoutDayExerciseService.remove(
                exerciseItemId
            );

        if (!response || response.status !== "success") {
            throw new Error(
                response?.message ||
                "Não foi possível remover o exercício."
            );
        }

        await this.reload(result.workoutId);
    }

    async reload(workoutId) {
        const workout = this.getWorkouts().find(
            item => Number(item.id) === Number(workoutId)
        );

        if (!workout) return;

        const days = Array.isArray(workout.days)
            ? workout.days
            : [];

        for (const day of days) {
            await this.load(day);
        }

        const section =
            document.getElementById("workoutSection");

        const manager =
            section?.__trainifyWorkoutManager;

        if (manager) {
            manager.render();
            await manager.openModal(workoutId);
        }
    }

    async saveDraftExercises(
        workoutDayId,
        exercises = [],
        workoutId
    ) {
        if (!Array.isArray(exercises)) return;

        for (let index = 0; index < exercises.length; index++) {
            const exercise = exercises[index];

            const item = new WorkoutDayExercise({
                workoutDayId: Number(workoutDayId),
                exerciseId: Number(
                    exercise.id ??
                    exercise.exerciseId
                ),
                sets: Number(
                    exercise.sets ??
                    3
                ),
                reps: String(
                    exercise.reps ??
                    "12"
                ).trim(),
                restSeconds: Number(
                    exercise.restSeconds ??
                    60
                ),
                order: Number(
                    exercise.order ??
                    index + 1
                ),
                notes: exercise.notes ?? null
            });

            const response =
                await this.workoutDayExerciseService.create(item);

            if (!response || response.status !== "success") {
                throw new Error(
                    response?.message ||
                    "Não foi possível adicionar um exercício."
                );
            }
        }

        if (workoutId) {
            await this.reload(workoutId);
        }
    }

    showFormMessage(element, message, type = "error") {
        if (!element) return;

        element.textContent = message;
        element.style.display = "block";
        element.style.padding = "10px";
        element.style.borderRadius = "8px";
        element.style.color =
            type === "success"
                ? "#22c55e"
                : "#f87171";
    }

    async cancelForm(dayId) {
        const result = this.findDay(dayId);

        this.formState = null;

        if (!result) return;

        await this.openWorkoutModal(
            result.workout.id
        );
    }

    async handleAction(action, data) {
        switch (action) {
            case "add-day-exercise":
                await this.add(Number(data.dayId));
                break;

            case "edit-day-exercise":
                await this.edit(Number(data.exerciseItemId));
                break;

            case "remove-day-exercise":
                await this.remove(Number(data.exerciseItemId));
                break;

            case "confirm-remove-day-exercise":
                await this.confirmRemove(
                    Number(data.exerciseItemId)
                );
                break;

            case "cancel-day-exercise-form":
                await this.cancelForm(
                    Number(data.dayId)
                );
                break;
        }
    }

    getWorkoutManager() {
        const section =
            document.getElementById("workoutSection");

        return section
            ? section.__trainifyWorkoutManager || null
            : null;
    }

    getInlineFormForDay(day) {
        if (!this.formState) return "";

        if (
            this.formState.type === "add" &&
            Number(this.formState.dayId) === Number(day.id)
        ) {
            return this.renderAddForm(day.id);
        }

        if (this.formState.type === "edit") {
            const item = this.find(
                this.formState.exerciseItemId
            );

            if (
                item &&
                Number(item.day.id) === Number(day.id)
            ) {
                return this.renderEditForm(item);
            }
        }

        return "";
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