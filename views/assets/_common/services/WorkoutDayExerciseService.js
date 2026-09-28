import HttpClientBase from "../classes/HttpClientBase.js";
import WorkoutDayExercise from "../classes/WorkoutDayExercise.js";

export default class WorkoutDayExerciseService
    extends HttpClientBase {

    async listByWorkoutDay(workoutDayId) {

        const response =
            await this.get(
                `/workout-day-exercises/list/${workoutDayId}`
            );

        if (
            response?.data &&
            Array.isArray(response.data)
        ) {

            response.data =
                response.data
                    .map(
                        item =>
                            WorkoutDayExercise.fromJSON(item)
                    );
        }

        return response;
    }


    async find(id) {

        const response =
            await this.get(
                `/workout-day-exercises/${id}`
            );

        if (response?.data) {

            response.data =
                WorkoutDayExercise.fromJSON(
                    response.data
                );
        }

        return response;
    }


    async create(exercise) {

        const exerciseObject =
            exercise instanceof WorkoutDayExercise
                ? exercise
                : new WorkoutDayExercise(exercise);

        const response =
            await this.postForm(
                "/workout-day-exercises/",
                exerciseObject.toPayload()
            );

        if (response?.data) {

            response.data =
                WorkoutDayExercise.fromJSON(
                    response.data
                );
        }

        return response;
    }


    async update(id, exercise) {

        const exerciseObject =
            exercise instanceof WorkoutDayExercise
                ? exercise
                : new WorkoutDayExercise(exercise);

        const response =
            await this.putForm(
                `/workout-day-exercises/${id}`,
                exerciseObject.toPayload()
            );

        if (response?.data) {

            response.data =
                WorkoutDayExercise.fromJSON(
                    response.data
                );
        }

        return response;
    }


    async remove(id) {

        return this.delete(
            `/workout-day-exercises/${id}`
        );
    }
}