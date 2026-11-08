import HttpClientBase from "./HttpClientBase.js";

export default class StudentImages extends HttpClientBase {
  
    async list(studentId) {
        return await this.get(`/students/${studentId}/images`);
    }


    async upload(studentId, files) {
        if (files instanceof FormData) {
            return await this.post(`/students/${studentId}/images`, files);
        }

        const formData = new FormData();
        const fileArray = files instanceof FileList 
            ? Array.from(files) 
            : Array.isArray(files) 
                ? files 
                : [files];

        fileArray.forEach(file => {
            formData.append("images[]", file);
        });

        return await this.post(`/students/${studentId}/images`, formData);
    }

    async deleteImage(studentId, imageId) {
        return await this.delete(`/students/${studentId}/images/${imageId}`);
    }
}