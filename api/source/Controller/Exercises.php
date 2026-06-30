<?php

namespace Source\Controller;

use Source\Models\Exercise;

class Exercises extends Api
{
    public function insert(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "Os campos category_id e name são obrigatórios.", "error")->back(null);
            return;
        }

        $exercise = new Exercise();

        if (!$exercise->categoryExists((int)$data["category_id"])) {
            $this->call(404, "not_found", "Categoria de exercício não encontrada", "error")->back(null);
            return;
        }

        $exercise = new Exercise(
            null,
            (int)$data["category_id"],
            trim($data["name"]),
            isset($data["description"]) && !empty(trim($data["description"])) ? trim($data["description"]) : null
        );

        if (!$exercise->insert()) {
            $this->call(500, "internal_server_error", $exercise->getErrorMessage() ?? "Não foi possível cadastrar o exercício", "error")->back(null);
            return;
        }

        $response = $exercise->listByIdWithCategory((int)$exercise->getId());

        $this->call(201, "created", "Exercício cadastrado com sucesso", "success")->back($response);
    }

    public function listAll(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        $exercise = new Exercise();

        $this->call(200, "success", "Lista de exercícios", "success")
            ->back($exercise->listAllWithCategory());
    }

    public function listById(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (
            !isset($data["exercise_id"]) ||
            empty($data["exercise_id"]) ||
            !filter_var($data["exercise_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID do exercício é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $exercise = new Exercise();

        $response = $exercise->listByIdWithCategory((int)$data["exercise_id"]);

        if (!$response) {
            $this->call(404, "not_found", "Exercício não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Exercício encontrado", "success")->back($response);
    }
public function listPaginator(array $data): void
{
    if (!$this->authToken(2)) {
        $this->call(
            401,
            "unauthorized",
            "Usuário não autenticado ou token inválido.",
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

    $exercise = new Exercise();

    $response = $exercise->selectPaginator(
        (int)$data["page"],
        (int)$data["per_page"],
        [],
        "id",
        "ASC"
    );

    $this->call(
        200,
        "success",
        "Lista de exercícios com paginação",
        "success"
    )->back($response);
}
    public function update(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (
            !isset($data["exercise_id"]) ||
            empty($data["exercise_id"]) ||
            !filter_var($data["exercise_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($data)
        ) {
            $this->call(400, "bad_request", "ID inválido ou campos obrigatórios ausentes.", "error")->back(null);
            return;
        }

        $exerciseExists = new Exercise();

        if (!$exerciseExists->listByIdWithCategory((int)$data["exercise_id"])) {
            $this->call(404, "not_found", "Exercício não encontrado", "error")->back(null);
            return;
        }

        if (!$exerciseExists->categoryExists((int)$data["category_id"])) {
            $this->call(404, "not_found", "Categoria de exercício não encontrada", "error")->back(null);
            return;
        }

        $exercise = new Exercise(
            null,
            (int)$data["category_id"],
            trim($data["name"]),
            isset($data["description"]) && !empty(trim($data["description"])) ? trim($data["description"]) : null
        );

        if (!$exercise->updateById((int)$data["exercise_id"])) {
            $this->call(500, "internal_server_error", $exercise->getErrorMessage() ?? "Não foi possível atualizar o exercício", "error")->back(null);
            return;
        }

        $response = $exercise->listByIdWithCategory((int)$data["exercise_id"]);

        $this->call(200, "success", "Exercício atualizado com sucesso", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (
            !isset($data["exercise_id"]) ||
            empty($data["exercise_id"]) ||
            !filter_var($data["exercise_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID do exercício é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $exercise = new Exercise();

        if (!$exercise->deleteById((int)$data["exercise_id"])) {
            $this->call(404, "not_found", "Exercício não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Exercício excluído com sucesso", "success")->back(null);
    }

    private function validate(array $data): bool
    {
        if (
            !isset($data["category_id"], $data["name"]) ||
            empty($data["category_id"]) ||
            empty(trim($data["name"])) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        return true;
    }
}