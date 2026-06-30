<?php

namespace Source\Controller;

use Source\Models\User;

class Users extends Api
{
    public function register(array $data): void
    {
        if (
            !isset($data["name"], $data["email"], $data["password"]) ||
            empty(trim($data["name"])) ||
            empty(trim($data["email"])) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "Nome, e-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error"
            )->back(null);
            return;
        }

        $user = new User(
            null,
            2,
            trim($data["name"]),
            trim($data["email"]),
            $data["password"],
            $data["photo"] ?? null,
            $data["cref"] ?? null,
            $data["phone"] ?? null,
            $data["city"] ?? null,
            $data["bio"] ?? null,
            $data["specialty"] ?? null,
            1
        );

        if (!$user->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
            "cref" => $user->getCref(),
            "phone" => $user->getPhone(),
            "city" => $user->getCity(),
            "bio" => $user->getBio(),
            "specialty" => $user->getSpecialty()
        ];

        $this->call(
            201,
            "created",
            "Usuário cadastrado com sucesso",
            "success"
        )->back($response);
    }
    public function listAll(array $data): void
{
    if (!$this->authToken(1)) {
        $this->call(
            401,
            "unauthorized",
            "Administrador não autenticado ou token inválido.",
            "error"
        )->back(null);
        return;
    }

    $user = new User();

    $this->call(
        200,
        "success",
        "Lista de usuários",
        "success"
    )->back($user->listAll());
}

public function listById(array $data): void
{
    if (!$this->authToken(1)) {
        $this->call(
            401,
            "unauthorized",
            "Administrador não autenticado ou token inválido.",
            "error"
        )->back(null);
        return;
    }

    if (
        !isset($data["user_id"]) ||
        empty($data["user_id"]) ||
        !filter_var($data["user_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do usuário é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $user = new User();

    $response = $user->listById((int)$data["user_id"]);

    if (!$response) {
        $this->call(
            404,
            "not_found",
            "Usuário não encontrado",
            "error"
        )->back(null);
        return;
    }

    $this->call(
        200,
        "success",
        "Usuário encontrado",
        "success"
    )->back($response);
}

public function listPaginator(array $data): void
{
    if (!$this->authToken(1)) {
        $this->call(
            401,
            "unauthorized",
            "Administrador não autenticado ou token inválido.",
            "error"
        )->back(null);
        return;
    }

    if (
        !isset($data["page"], $data["per_page"]) ||
        empty($data["page"]) ||
        empty($data["per_page"]) ||
        !filter_var($data["page"], FILTER_VALIDATE_INT) ||
        !filter_var($data["per_page"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "Os campos page e per_page são obrigatórios e devem ser números inteiros",
            "error"
        )->back(null);
        return;
    }

    $user = new User();

    $response = $user->listPaginator(
        (int)$data["page"],
        (int)$data["per_page"]
    );

    $this->call(
        200,
        "success",
        "Lista de usuários com paginação",
        "success"
    )->back($response);
}

    public function auth(array $data): void
    {
        if (
            !isset($data["email"], $data["password"]) ||
            empty(trim($data["email"])) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error"
            )->back(null);
            return;
        }

        $user = new User();

        if (!$user->login(trim($data["email"]), $data["password"], 2)) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
            "cref" => $user->getCref(),
            "phone" => $user->getPhone(),
            "city" => $user->getCity(),
            "bio" => $user->getBio(),
            "specialty" => $user->getSpecialty(),
            "token" => $user->getToken()
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success"
        )->back($response);
    }

    public function authAdmin(array $data): void
    {
        if (
            !isset($data["email"], $data["password"]) ||
            empty(trim($data["email"])) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error"
            )->back(null);
            return;
        }

        $user = new User();

        if (!$user->login(trim($data["email"]), $data["password"], 1)) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
            "token" => $user->getToken()
        ];

        $this->call(
            200,
            "success",
            "Administrador logado com sucesso",
            "success"
        )->back($response);
    }

    public function update(array $data): void
{
    if (!$this->authToken(2)) {
        $this->call(
            401,
            "unauthorized",
            "Usuário não está autenticado ou token inválido.",
            "error"
        )->back(null);
        return;
    }

    if (
        !isset($data["name"], $data["email"]) ||
        empty(trim($data["name"])) ||
        empty(trim($data["email"])) ||
        !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
    ) {
        $this->call(
            400,
            "bad_request",
            "Nome e e-mail são obrigatórios. O e-mail deve ser válido.",
            "error"
        )->back(null);
        return;
    }

    $user = new User(
        null,
        2,
        trim($data["name"]),
        trim($data["email"]),
        null,
        $data["photo"] ?? null,
        $data["cref"] ?? null,
        $data["phone"] ?? null,
        $data["city"] ?? null,
        $data["bio"] ?? null,
        $data["specialty"] ?? null,
        1
    );

    if (!$user->updateById((int)$this->userAuthId)) {
        $this->call(
            500,
            "internal_server_error",
            $user->getErrorMessage() ?? "Não foi possível atualizar o usuário",
            "error"
        )->back(null);
        return;
    }

    $updatedUser = new User();

    if (!$updatedUser->selectById((int)$this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Usuário não encontrado",
            "error"
        )->back(null);
        return;
    }

    $response = [
        "id" => $updatedUser->getId(),
        "type_id" => $updatedUser->getTypeId(),
        "name" => $updatedUser->getName(),
        "email" => $updatedUser->getEmail(),
        "photo" => $updatedUser->getPhoto(),
        "cref" => $updatedUser->getCref(),
        "phone" => $updatedUser->getPhone(),
        "city" => $updatedUser->getCity(),
        "bio" => $updatedUser->getBio(),
        "specialty" => $updatedUser->getSpecialty(),
        "active" => $updatedUser->getActive()
    ];

    $this->call(
        200,
        "success",
        "Usuário atualizado com sucesso",
        "success"
    )->back($response);
}

    public function updateAdmin(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(
                401,
                "unauthorized",
                "Administrador não está autenticado ou token inválido.",
                "error"
            )->back(null);
            return;
        }

          if (
        !isset($data["name"], $data["email"]) ||
        empty(trim($data["name"])) ||
        empty(trim($data["email"])) ||
        !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
    ) {
        $this->call(
            400,
            "bad_request",
            "Nome e e-mail são obrigatórios. O e-mail deve ser válido.",
            "error"
        )->back(null);
        return;
    }

    $user = new User(
        null,
        2,
        trim($data["name"]),
        trim($data["email"]),
        null,
        $data["photo"] ?? null,
        $data["cref"] ?? null,
        $data["phone"] ?? null,
        $data["city"] ?? null,
        $data["bio"] ?? null,
        $data["specialty"] ?? null,
        1
    );

    if (!$user->updateById((int)$this->userAuthId)) {
        $this->call(
            500,
            "internal_server_error",
            $user->getErrorMessage() ?? "Não foi possível atualizar o usuário",
            "error"
        )->back(null);
        return;
    }

    $updatedUser = new User();

    if (!$updatedUser->selectById((int)$this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Usuário não encontrado",
            "error"
        )->back(null);
        return;
    }

    $response = [
        "id" => $updatedUser->getId(),
        "type_id" => $updatedUser->getTypeId(),
        "name" => $updatedUser->getName(),
        "email" => $updatedUser->getEmail(),
        "photo" => $updatedUser->getPhoto(),
        "cref" => $updatedUser->getCref(),
        "phone" => $updatedUser->getPhone(),
        "city" => $updatedUser->getCity(),
        "bio" => $updatedUser->getBio(),
        "specialty" => $updatedUser->getSpecialty(),
        "active" => $updatedUser->getActive()
    ];

    $this->call(
        200,
        "success",
        "Usuário atualizado com sucesso",
        "success"
    )->back($response);

    }
}