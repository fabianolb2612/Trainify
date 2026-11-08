export default class Exercise {

    #id;
    #name;
    #description;
    #muscleGroup;
    #active;

    constructor({
        id = null,
        name = "",
        description = "",
        muscleGroup = "",
        active = 1
    } = {}) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.muscleGroup = muscleGroup;
        this.active = active;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value !== null ? Number(value) : null;
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
            throw new Error("O nome do exercício é obrigatório.");
        }

        this.#name = String(value).trim();
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value
            ? String(value).trim()
            : "";
    }

    get muscleGroup() {
        return this.#muscleGroup;
    }

    set muscleGroup(value) {
        this.#muscleGroup = value
            ? String(value).trim()
            : "";
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }

  
    toPayload() {
        return {
            name: this.#name,
            description: this.#description,
            muscle_group: this.#muscleGroup
        };
    }
    
    static fromJSON(data = {}) {

        return new Exercise({
            id: data.id ?? null,

            name: data.name ?? "",

            description:
                data.description ??
                "",

            muscleGroup:
                data.muscle_group ??
                data.muscleGroup ??
                "",

            active: data.active ?? 1
        });
    }
}