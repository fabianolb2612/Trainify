export default class WorkoutDay {

    #id;
    #workoutId;
    #name;
    #displayOrder;
    #active;

    constructor({
        id = null,
        workoutId = null,
        name = "",
        displayOrder = 0,
        active = 1
    } = {}) {

        this.id = id;
        this.workoutId = workoutId;
        this.name = name;
        this.displayOrder = displayOrder;
        this.active = active;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value !== null ? Number(value) : null;
    }
    get workoutId() {
        return this.#workoutId;
    }

    set workoutId(value) {
        this.#workoutId = value !== null ? Number(value) : null;
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
            throw new Error("O nome do dia de treino é obrigatório.");
        }

        this.#name = String(value).trim();
    }

    get displayOrder() {
        return this.#displayOrder;
    }

    set displayOrder(value) {
        this.#displayOrder = Number(value) || 0;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }

    toPayload() {
        return {
            workout_id: this.#workoutId,
            name: this.#name,
            display_order: this.#displayOrder
        };
    }
    static fromJSON(data = {}) {

        return new WorkoutDay({
            id: data.id ?? null,

            workoutId:
                data.workout_id ??
                data.workoutId ??
                null,

            name: data.name ?? "",

            displayOrder:
                data.display_order ??
                data.displayOrder ??
                0,

            active: data.active ?? 1
        });
    }
}