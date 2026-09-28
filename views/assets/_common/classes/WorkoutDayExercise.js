export default class WorkoutDayExercise {

    #id;
    #workoutDayId;
    #exerciseId;
    #sets;
    #reps;
    #restSeconds;
    #order;
    #notes;

    #exerciseName;
    #exerciseDescription;

    constructor({
        id = null,
        workoutDayId = null,
        exerciseId = null,
        sets = 3,
        reps = "12",
        restSeconds = 60,
        order = 1,
        notes = null,
        exerciseName = "",
        exerciseDescription = ""
    } = {}) {

        this.id = id;
        this.workoutDayId = workoutDayId;
        this.exerciseId = exerciseId;
        this.sets = sets;
        this.reps = reps;
        this.restSeconds = restSeconds;
        this.order = order;
        this.notes = notes;

        this.exerciseName = exerciseName;
        this.exerciseDescription = exerciseDescription;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value !== null
            ? Number(value)
            : null;
    }


    get workoutDayId() {
        return this.#workoutDayId;
    }

    set workoutDayId(value) {
        this.#workoutDayId = value !== null
            ? Number(value)
            : null;
    }


    get exerciseId() {
        return this.#exerciseId;
    }

    set exerciseId(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            this.#exerciseId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new Error(
                "O exercício informado é inválido."
            );
        }

        this.#exerciseId = number;
    }


    get sets() {
        return this.#sets;
    }

    set sets(value) {
        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new Error(
                "O número de séries deve ser maior que zero."
            );
        }

        this.#sets = number;
    }


    get reps() {
        return this.#reps;
    }

    set reps(value) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            throw new Error(
                "As repetições são obrigatórias."
            );
        }

        this.#reps = String(value).trim();
    }


    get restSeconds() {
        return this.#restSeconds;
    }

    set restSeconds(value) {
        const number = Number(value);

        if (!Number.isInteger(number) || number < 0) {
            throw new Error(
                "O descanso deve ser um número válido."
            );
        }

        this.#restSeconds = number;
    }


    get order() {
        return this.#order;
    }

    set order(value) {
        const number = Number(value);

        this.#order =
            Number.isInteger(number) && number > 0
                ? number
                : 1;
    }


    get notes() {
        return this.#notes;
    }

    set notes(value) {
        this.#notes =
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
                ? String(value).trim()
                : null;
    }


    get exerciseName() {
        return this.#exerciseName;
    }

    set exerciseName(value) {
        this.#exerciseName =
            value
                ? String(value).trim()
                : "";
    }


    get exerciseDescription() {
        return this.#exerciseDescription;
    }

    set exerciseDescription(value) {
        this.#exerciseDescription =
            value
                ? String(value).trim()
                : "";
    }


    toPayload() {
        return {
            workout_day_id: this.#workoutDayId,
            exercise_id: this.#exerciseId,
            sets: this.#sets,
            reps: this.#reps,
            rest_seconds: this.#restSeconds,
            order: this.#order,
            notes: this.#notes
        };
    }


    static fromJSON(data = {}) {

        return new WorkoutDayExercise({

            id:
                data.id ??
                null,

            workoutDayId:
                data.workout_day_id ??
                data.workoutDayId ??
                null,

            exerciseId:
                data.exercise_id ??
                data.exerciseId ??
                null,

            sets:
                data.sets ??
                3,

            reps:
                data.reps ??
                "12",

            restSeconds:
                data.rest_seconds ??
                data.restSeconds ??
                60,

            order:
                data.order ??
                data.display_order ??
                data.displayOrder ??
                1,

            notes:
                data.notes ??
                null,

            exerciseName:
                data.exercise_name ??
                data.exerciseName ??
                data.exercise?.name ??
                "",

            exerciseDescription:
                data.exercise_description ??
                data.exerciseDescription ??
                data.exercise?.description ??
                ""
        });
    }
}