import SessionStorage from "./storage.js";

export default class AuthGuard {
    constructor(redirectUrl = "../index.html", scope = "user", expectedTypeId = null) {
        this.storage = new SessionStorage(scope);
        this.redirectUrl = redirectUrl;
        this.expectedTypeId = expectedTypeId;
    }

    isAuthenticated() {
    const token = this.storage.getToken();
    const user = this.storage.getUser();

    if (!token || !user) {
        return false;
    }

    if (
        this.expectedTypeId !== null &&
        Number(user?.type_id ?? user?.typeId) !== this.expectedTypeId
    ) {
        this.storage.clearSession();
        return false;
    }

    return true;
}

    protect() {
        if (!this.isAuthenticated()) {
            window.location.replace(this.redirectUrl);
            return false;
        }

        return true;
    }
}