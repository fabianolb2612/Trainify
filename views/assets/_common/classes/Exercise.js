/**
 * TrainiFy - Exercise.js
 * Entidade que representa um exercício do catálogo.
 */

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

    // ID
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value !== null ? Number(value) : null;
    }

    // Nome
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

    // Descrição
    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value
            ? String(value).trim()
            : "";
    }

    // Grupo muscular
    get muscleGroup() {
        return this.#muscleGroup;
    }

    set muscleGroup(value) {
        this.#muscleGroup = value
            ? String(value).trim()
            : "";
    }

    // Status
    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }

    /**
     * Converte a entidade para o formato
     * esperado pela API.
     */
    toPayload() {
        return {
            name: this.#name,
            description: this.#description,
            muscle_group: this.#muscleGroup
        };
    }

    /**
     * Cria uma instância de Exercise a partir
     * dos dados retornados pela API.
     */
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