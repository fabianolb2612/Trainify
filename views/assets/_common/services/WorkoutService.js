import HttpClientBase from "../classes/HttpClientBase.js";
import Workout from "../classes/Workout.js";

export default class WorkoutService extends HttpClientBase {

    async list() {

        const response =
            await this.get("/workouts/list");


        if (
            response?.data &&
            Array.isArray(response.data)
        ) {

            response.data =
                response.data.map(
                    workout =>
                        Workout.fromJSON(workout)
                );
        }


        return response;
    }


    async find(id) {

        const response =
            await this.get(
                `/workouts/list/${id}`
            );


        if (response?.data) {

            response.data =
                Workout.fromJSON(
                    response.data
                );
        }


        return response;
    }


    async create(workout) {

        const workoutObject =
            workout instanceof Workout
                ? workout
                : new Workout(workout);


        const response =
            await this.postForm(
                "/workouts/",
                workoutObject.toPayload()
            );


        if (response?.data) {

            response.data =
                Workout.fromJSON(
                    response.data
                );
        }


        return response;
    }


    async update(id, workout) {

        const workoutObject =
            workout instanceof Workout
                ? workout
                : new Workout(workout);


        const response =
            await this.putForm(
                `/workouts/${id}`,
                workoutObject.toPayload()
            );


        if (response?.data) {

            response.data =
                Workout.fromJSON(
                    response.data
                );
        }


        return response;
    }


    async remove(id) {

        return this.delete(
            `/workouts/${id}`
        );
    }
}