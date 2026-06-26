<?php

namespace Source\Controller;

use Source\Models\Student;

class Students extends Api
{
    public function insert(array $data): void
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

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos training_level_id e name são obrigatórios. O goal_id deve ser um número inteiro quando informado.",
                "error"
            )->back(null);
            return;
        }

        $student = new Student(
            null,
            $this->userAuthId,
            (int) $data["training_level_id"],
            isset($data["goal_id"]) && !empty($data["goal_id"]) ? (int) $data["goal_id"] : null,
            trim($data["name"]),
            isset($data["email"]) && !empty(trim($data["email"])) ? trim($data["email"]) : null,
            isset($data["phone"]) && !empty(trim($data["phone"])) ? trim($data["phone"]) : null,
            isset($data["birthdate"]) && !empty(trim($data["birthdate"])) ? trim($data["birthdate"]) : null,
            isset($data["gym"]) && !empty(trim($data["gym"])) ? trim($data["gym"]) : null,
            isset($data["notes"]) && !empty(trim($data["notes"])) ? trim($data["notes"]) : null,
            1
        );

        if (!$student->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $student->getErrorMessage() ?? "Não foi possível cadastrar o aluno",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $student->getId(),
            "user_id" => $student->getUserId(),
            "training_level_id" => $student->getTrainingLevelId(),
            "goal_id" => $student->getGoalId(),
            "name" => $student->getName(),
            "email" => $student->getEmail(),
            "phone" => $student->getPhone(),
            "birthdate" => $student->getBirthdate(),
            "gym" => $student->getGym(),
            "notes" => $student->getNotes()
        ];

        $this->call(
            201,
            "created",
            "Aluno cadastrado com sucesso",
            "success"
        )->back($response);
    }

    private function validate(array $data): bool
    {
        if (
            !isset($data["training_level_id"], $data["name"]) ||
            empty($data["training_level_id"]) ||
            empty(trim($data["name"])) ||
            !filter_var($data["training_level_id"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        if (
            isset($data["goal_id"]) &&
            !empty($data["goal_id"]) &&
            !filter_var($data["goal_id"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        if (
            isset($data["email"]) &&
            !empty(trim($data["email"])) &&
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            return false;
        }

        return true;
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
        !isset($data["student_id"]) ||
        empty($data["student_id"]) ||
        !filter_var($data["student_id"], FILTER_VALIDATE_INT) ||
        !$this->validate($data)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID inválido ou campos obrigatórios ausentes",
            "error"
        )->back(null);
        return;
    }

    $studentExists = new Student();

    if (!$studentExists->selectByIdAndUserId((int) $data["student_id"], (int) $this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Aluno não encontrado",
            "error"
        )->back(null);
        return;
    }

    $student = new Student(
        null,
        $this->userAuthId,
        (int) $data["training_level_id"],
        isset($data["goal_id"]) && !empty($data["goal_id"]) ? (int) $data["goal_id"] : null,
        trim($data["name"]),
        isset($data["email"]) && !empty(trim($data["email"])) ? trim($data["email"]) : null,
        isset($data["phone"]) && !empty(trim($data["phone"])) ? trim($data["phone"]) : null,
        isset($data["birthdate"]) && !empty(trim($data["birthdate"])) ? trim($data["birthdate"]) : null,
        isset($data["gym"]) && !empty(trim($data["gym"])) ? trim($data["gym"]) : null,
        isset($data["notes"]) && !empty(trim($data["notes"])) ? trim($data["notes"]) : null,
        1
    );

    if (!$student->updateByIdAndUserId((int) $data["student_id"], (int) $this->userAuthId)) {
        $this->call(
            500,
            "internal_server_error",
            $student->getErrorMessage() ?? "Não foi possível atualizar o aluno",
            "error"
        )->back(null);
        return;
    }

    $updatedStudent = new Student();
    $updatedStudent->selectByIdAndUserId((int) $data["student_id"], (int) $this->userAuthId);

    $response = [
        "id" => $updatedStudent->getId(),
        "user_id" => $updatedStudent->getUserId(),
        "training_level_id" => $updatedStudent->getTrainingLevelId(),
        "goal_id" => $updatedStudent->getGoalId(),
        "name" => $updatedStudent->getName(),
        "email" => $updatedStudent->getEmail(),
        "phone" => $updatedStudent->getPhone(),
        "birthdate" => $updatedStudent->getBirthdate(),
        "gym" => $updatedStudent->getGym(),
        "notes" => $updatedStudent->getNotes()
    ];

    $this->call(
        200,
        "success",
        "Aluno atualizado com sucesso",
        "success"
    )->back($response);
}
public function listAll(array $data): void
{
    if (!$this->authToken(2)) {
        $this->call(
            401,
            "unauthorized",
            "Usuário não autenticado.",
            "error"
        )->back(null);
        return;
    }

    $student = new Student();

    $response = $student->listAllByUserId(
        $this->userAuthId
    );

    $this->call(
        200,
        "success",
        "Lista de alunos",
        "success"
    )->back($response);
}
public function listById(array $data): void
{
    if (!$this->authToken(2)) {
        $this->call(
            401,
            "unauthorized",
            "Usuário não autenticado.",
            "error"
        )->back(null);
        return;
    }

    if (
        !isset($data["student_id"]) ||
        !filter_var($data["student_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID inválido",
            "error"
        )->back(null);
        return;
    }

    $student = new Student();

    $response = $student->listByIdAndUserId(
        (int)$data["student_id"],
        (int)$this->userAuthId
    );

    if (!$response) {
        $this->call(
            404,
            "not_found",
            "Aluno não encontrado",
            "error"
        )->back(null);
        return;
    }

    $this->call(
        200,
        "success",
        "Aluno encontrado",
        "success"
    )->back($response);
}
public function delete(array $data): void
{
    if (!$this->authToken(2)) {
        $this->call(
            401,
            "unauthorized",
            "Usuário não autenticado.",
            "error"
        )->back(null);
        return;
    }

    if (
        !isset($data["student_id"]) ||
        empty($data["student_id"]) ||
        !filter_var($data["student_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do aluno é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $student = new Student();

    if (!$student->deleteByIdAndUserId((int)$data["student_id"], (int)$this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Aluno não encontrado",
            "error"
        )->back(null);
        return;
    }

    $this->call(
        200,
        "success",
        "Aluno excluído com sucesso",
        "success"
    )->back(null);
}
}