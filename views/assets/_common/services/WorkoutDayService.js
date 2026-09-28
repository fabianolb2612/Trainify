import HttpClientBase from "../classes/HttpClientBase.js";
import WorkoutDay from "../classes/WorkoutDay.js";

export default class WorkoutDayService extends HttpClientBase {

    async listByWorkout(workoutId) {
        const response = await this.get(
            `/workout-days/list/${workoutId}`
        );

        if (response?.data && Array.isArray(response.data)) {
            response.data = response.data.map(
                workoutDay => WorkoutDay.fromJSON(workoutDay)
            );
        }

        return response;
    }

    async find(id) {
        const response = await this.get(
            `/workout-days/${id}`
        );

        if (response?.data) {
            response.data = WorkoutDay.fromJSON(response.data);
        }

        return response;
    }

    async create(workoutDay) {
        const workoutDayObject =
            workoutDay instanceof WorkoutDay
                ? workoutDay
                : new WorkoutDay(workoutDay);

        const response = await this.postForm(
            "/workout-days/",
            workoutDayObject.toPayload()
        );

        if (response?.data) {
            response.data = WorkoutDay.fromJSON(response.data);
        }

        return response;
    }

    async update(id, workoutDay) {
        const workoutDayObject =
            workoutDay instanceof WorkoutDay
                ? workoutDay
                : new WorkoutDay(workoutDay);

        const response = await this.putForm(
            `/workout-days/${id}`,
            workoutDayObject.toPayload()
        );

        if (response?.data) {
            response.data = WorkoutDay.fromJSON(response.data);
        }

        return response;
    }

    async remove(id) {
        return this.delete(
            `/workout-days/${id}`
        );
    }
}