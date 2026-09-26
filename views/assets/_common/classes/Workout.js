export default class Workout {

    #id;
    #userId;
    #studentId;
    #goalId;
    #trainingLevelId;
    #name;
    #description;
    #frequency;
    #active;

    constructor({
        id = null,
        userId = null,
        studentId = null,
        goalId = null,
        trainingLevelId = null,
        name = "",
        description = "",
        frequency = "",
        active = 1
    } = {}) {

        this.id = id;
        this.userId = userId;
        this.studentId = studentId;
        this.goalId = goalId;
        this.trainingLevelId = trainingLevelId;
        this.name = name;
        this.description = description;
        this.frequency = frequency;
        this.active = active;
    }


    // =========================
    // GETTERS E SETTERS
    // =========================

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }


    get userId() {
        return this.#userId;
    }

    set userId(value) {
        this.#userId = value;
    }


    get studentId() {
        return this.#studentId;
    }

    set studentId(value) {
        this.#studentId = value;
    }


    get goalId() {
        return this.#goalId;
    }

    set goalId(value) {
        this.#goalId = value;
    }


    get trainingLevelId() {
        return this.#trainingLevelId;
    }

    set trainingLevelId(value) {
        this.#trainingLevelId = value;
    }


    get name() {
        return this.#name;
    }

    set name(value) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            throw new Error(
                "O nome do treino é obrigatório."
            );
        }

        this.#name = String(value).trim();
    }


    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description =
            value ? String(value).trim() : "";
    }


    get frequency() {
        return this.#frequency;
    }

    set frequency(value) {
        this.#frequency =
            value ? String(value).trim() : "";
    }


    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }


    // =========================
    // PAYLOAD PARA API
    // =========================

    toPayload() {

        return {
            student_id: this.#studentId,
            goal_id: this.#goalId,
            training_level_id: this.#trainingLevelId,
            name: this.#name,
            description: this.#description,
            frequency: this.#frequency
        };
    }


    // =========================
    // CONVERTER RESPOSTA DA API
    // =========================

    static fromJSON(data = {}) {

        return new Workout({

            id: data.id ?? null,

            userId:
                data.user_id ??
                data.userId ??
                null,

            studentId:
                data.student_id ??
                data.studentId ??
                null,

            goalId:
                data.goal_id ??
                data.goalId ??
                null,

            trainingLevelId:
                data.training_level_id ??
                data.trainingLevelId ??
                null,

            name:
                data.name ??
                "",

            description:
                data.description ??
                "",

            frequency:
                data.frequency ??
                "",

            active:
                data.active ??
                1
        });
    }
}