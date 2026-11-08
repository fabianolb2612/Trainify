export default class Student {
    #id;
    #userId;
    #trainingLevelId;
    #goalId;
    #name;
    #email;
    #phone;
    #birthdate;
    #gym;
    #notes;
    #active;
    #trainingLevel;
    #goal;

    constructor({
        id = null,
        userId = null,
        trainingLevelId = null,
        goalId = null,
        name = "",
        email = null,
        phone = null,
        birthdate = null,
        gym = null,
        notes = null,
        active = 1,
        trainingLevel = null,
        goal = null
    } = {}) {
        this.id = id;
        this.userId = userId;
        this.trainingLevelId = trainingLevelId;
        this.goalId = goalId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birthdate = birthdate;
        this.gym = gym;
        this.notes = notes;
        this.active = active;

        this.#trainingLevel = trainingLevel;
        this.#goal = goal;
    }


    get id() {
        return this.#id;
    }

    set id(value) {
        if (value === null || value === undefined || value === "") {
            this.#id = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError("O ID do aluno deve ser um número inteiro válido.");
        }

        this.#id = number;
    }


    get userId() {
        return this.#userId;
    }

    set userId(value) {
        if (value === null || value === undefined || value === "") {
            this.#userId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError("O ID do usuário deve ser um número inteiro válido.");
        }

        this.#userId = number;
    }

    get trainingLevelId() {
        return this.#trainingLevelId;
    }

    set trainingLevelId(value) {
        if (value === null || value === undefined || value === "") {
            this.#trainingLevelId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError(
                "O ID do nível de treinamento deve ser um número inteiro válido."
            );
        }

        this.#trainingLevelId = number;
    }

    get goalId() {
        return this.#goalId;
    }

    set goalId(value) {
        if (value === null || value === undefined || value === "") {
            this.#goalId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError(
                "O ID do objetivo deve ser um número inteiro válido."
            );
        }

        this.#goalId = number;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome do aluno é obrigatório.");
        }

        this.#name = value.trim();
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        if (value === null || value === undefined || value === "") {
            this.#email = null;
            return;
        }

        if (typeof value !== "string" || !value.includes("@")) {
            throw new TypeError("Email inválido.");
        }

        this.#email = value.trim();
    }

    get phone() {
        return this.#phone;
    }

    set phone(value) {
        this.#phone = value === null || value === undefined
            ? null
            : String(value).trim();
    }

    get birthdate() {
        return this.#birthdate;
    }

    set birthdate(value) {
        this.#birthdate = value === null || value === undefined
            ? null
            : String(value).trim();
    }
    get gym() {
        return this.#gym;
    }

    set gym(value) {
        this.#gym = value === null || value === undefined
            ? null
            : String(value).trim();
    }

    get notes() {
        return this.#notes;
    }

    set notes(value) {
        this.#notes = value === null || value === undefined
            ? null
            : String(value).trim();
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value) === 1 ? 1 : 0;
    }

    get trainingLevel() {
        return this.#trainingLevel;
    }

    get goal() {
        return this.#goal;
    }

  toJSON() {
    return {
        id: this.id,
        user_id: this.userId,
        training_level_id: this.trainingLevelId,
        goal_id: this.goalId,
        name: this.name,
        email: this.email,
        phone: this.phone,
        birthdate: this.birthdate,
        gym: this.gym,
        notes: this.notes,
        active: this.active
    };
}

toPayload() {
    return {
        training_level_id: this.trainingLevelId,
        goal_id: this.goalId,
        name: this.name,
        email: this.email,
        phone: this.phone,
        birthdate: this.birthdate,
        gym: this.gym,
        notes: this.notes
    };
}

    static fromJSON(data = {}) {
        return new Student({
            id: data.id,
            userId: data.user_id,
            trainingLevelId: data.training_level_id,
            goalId: data.goal_id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            birthdate: data.birthdate,
            gym: data.gym,
            notes: data.notes,
            active: data.active,
            trainingLevel: data.training_level,
            goal: data.goal
        });
        
    }
    
}