import HttpClientBase from "../classes/HttpClientBase.js";
import Exercise from "../classes/Exercise.js";

export default class ExerciseService extends HttpClientBase {

    async list() {
        const response = await this.get(
            "/exercises/list"
        );

        if (response?.data && Array.isArray(response.data)) {
            response.data = response.data.map(
                exercise => Exercise.fromJSON(exercise)
            );
        }

        return response;
    }

    async find(id) {
        const response = await this.get(
            `/exercises/list/${id}`
        );

        if (response?.data) {
            response.data = Exercise.fromJSON(response.data);
        }

        return response;
    }

    async create(exercise) {
        const exerciseObject =
            exercise instanceof Exercise
                ? exercise
                : new Exercise(exercise);

        const response = await this.postForm(
            "/exercises/",
            exerciseObject.toPayload()
        );

        if (response?.data) {
            response.data = Exercise.fromJSON(response.data);
        }

        return response;
    }

    async update(id, exercise) {
        const exerciseObject =
            exercise instanceof Exercise
                ? exercise
                : new Exercise(exercise);

        const response = await this.putForm(
            `/exercises/${id}`,
            exerciseObject.toPayload()
        );

        if (response?.data) {
            response.data = Exercise.fromJSON(response.data);
        }

        return response;
    }

    async remove(id) {
        return this.delete(
            `/exercises/${id}`
        );
    }
}