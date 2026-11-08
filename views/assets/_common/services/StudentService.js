import HttpClientBase from "../classes/HttpClientBase.js";
import Student from "../classes/Student.js";

export default class StudentService extends HttpClientBase {

    async list() {
        const response = await this.get("/students/list");

        if (response?.data && Array.isArray(response.data)) {
            response.data = response.data.map(
                student => Student.fromJSON(student)
            );
        }

        return response;
    }

    async find(id) {
        const response = await this.get(
            `/students/list/${id}`
        );

        if (response?.data) {
            response.data = Student.fromJSON(
                response.data
            );
        }

        return response;
    }

    async listPaginator(page = 1, perPage = 10) {
        const response = await this.get(
            `/students/list/paginator/${page}/${perPage}`
        );

        if (
            response?.data?.data &&
            Array.isArray(response.data.data)
        ) {
            response.data.data =
                response.data.data.map(
                    student => Student.fromJSON(student)
                );
        }

        return response;
    }

    async create(student) {

        const studentObject =
            student instanceof Student
                ? student
                : new Student(student);

        const response = await this.postForm(
            "/students/",
            studentObject.toPayload()
        );

        if (response?.data) {
            response.data =
                Student.fromJSON(response.data);
        }

        return response;
    }

   async update(id, student) {
    const studentObject =
        student instanceof Student
            ? student
            : new Student(student);

    const payload = {
        student_id: Number(id),
        id: Number(id),
        ...studentObject.toPayload()
    };
    const response = await this.put(
        `/students/${id}`,
        payload
    );

    if (response?.data) {
        response.data = Student.fromJSON(response.data);
    }

    return response;
}

    async remove(id) {
        return super.delete(
            `/students/${id}`
        );
    }

    async delete(id) {
        if (typeof id === "number" || (typeof id === "string" && !id.includes("/"))) {
            return super.delete(`/students/${id}`);
        }
        return super.delete(id);
    }
}