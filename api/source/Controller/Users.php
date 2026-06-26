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

        $this->call(
            200,
            "success",
            "Usuário autenticado com sucesso",
            "success"
        )->back([
            "user_id" => $this->userAuthId
        ]);
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

        $this->call(
            200,
            "success",
            "Administrador autenticado com sucesso",
            "success"
        )->back([
            "user_id" => $this->userAuthId
        ]);
    }
}