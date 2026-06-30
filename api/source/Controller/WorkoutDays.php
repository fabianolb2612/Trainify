<?php

namespace Source\Controller;

use Source\Models\WorkoutDay;

class WorkoutDays extends Api
{
    public function insert(array $data): void
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

        if (!$this->validate($data, true)) {
            $this->call(
                400,
                "bad_request",
                "Os campos workout_id e name são obrigatórios. display_order deve ser inteiro quando informado.",
                "error"
            )->back(null);
            return;
        }

        $workoutDay = new WorkoutDay();

        if (!$workoutDay->workoutBelongsToUser((int)$data["workout_id"], (int)$this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Treino não encontrado",
                "error"
            )->back(null);
            return;
        }

        $workoutDay = new WorkoutDay(
            null,
            (int)$data["workout_id"],
            trim($data["name"]),
            isset($data["display_order"]) && $data["display_order"] !== "" ? (int)$data["display_order"] : null,
            1
        );

        if (!$workoutDay->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $workoutDay->getErrorMessage() ?? "Não foi possível cadastrar o dia de treino",
                "error"
            )->back(null);
            return;
        }

        $response = $workoutDay->listByIdAndUserId(
            (int)$workoutDay->getId(),
            (int)$this->userAuthId
        );

        $this->call(
            201,
            "created",
            "Dia de treino cadastrado com sucesso",
            "success"
        )->back($response);
    }

    public function listByWorkout(array $data): void
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
            !isset($data["workout_id"]) ||
            empty($data["workout_id"]) ||
            !filter_var($data["workout_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do treino é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $workoutDay = new WorkoutDay();

        if (!$workoutDay->workoutBelongsToUser((int)$data["workout_id"], (int)$this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Treino não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = $workoutDay->listAllByWorkoutId(
            (int)$data["workout_id"],
            (int)$this->userAuthId
        );

        $this->call(
            200,
            "success",
            "Lista de dias do treino",
            "success"
        )->back($response);
    }

    public function listById(array $data): void
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
            !isset($data["workout_day_id"]) ||
            empty($data["workout_day_id"]) ||
            !filter_var($data["workout_day_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do dia de treino é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $workoutDay = new WorkoutDay();

        $response = $workoutDay->listByIdAndUserId(
            (int)$data["workout_day_id"],
            (int)$this->userAuthId
        );

        if (!$response) {
            $this->call(
                404,
                "not_found",
                "Dia de treino não encontrado",
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Dia de treino encontrado",
            "success"
        )->back($response);
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
        !isset($data["workout_id"], $data["page"], $data["per_page"]) ||
        empty($data["workout_id"]) ||
        empty($data["page"]) ||
        empty($data["per_page"]) ||
        !filter_var($data["workout_id"], FILTER_VALIDATE_INT) ||
        !filter_var($data["page"], FILTER_VALIDATE_INT) ||
        !filter_var($data["per_page"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "Os campos workout_id, page e per_page são obrigatórios e devem ser números inteiros",
            "error"
        )->back(null);
        return;
    }

    $workoutDay = new WorkoutDay();

    if (!$workoutDay->workoutBelongsToUser((int)$data["workout_id"], (int)$this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Treino não encontrado",
            "error"
        )->back(null);
        return;
    }

    $response = $workoutDay->selectPaginator(
        (int)$data["page"],
        (int)$data["per_page"],
        ["workout_id = {$data["workout_id"]}"],
        "display_order",
        "ASC"
    );

    $this->call(
        200,
        "success",
        "Lista de dias de treino com paginação",
        "success"
    )->back($response);
}
    public function update(array $data): void
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
            !isset($data["workout_day_id"]) ||
            empty($data["workout_day_id"]) ||
            !filter_var($data["workout_day_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($data, false)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID inválido ou campos obrigatórios ausentes.",
                "error"
            )->back(null);
            return;
        }

        $workoutDayExists = new WorkoutDay();

        if (!$workoutDayExists->listByIdAndUserId((int)$data["workout_day_id"], (int)$this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Dia de treino não encontrado",
                "error"
            )->back(null);
            return;
        }

        $currentWorkoutId = $workoutDayExists->listByIdAndUserId(
            (int)$data["workout_day_id"],
            (int)$this->userAuthId
        )["workout_id"];

        $workoutDay = new WorkoutDay(
            null,
            (int)$currentWorkoutId,
            trim($data["name"]),
            isset($data["display_order"]) && $data["display_order"] !== "" ? (int)$data["display_order"] : null,
            1
        );

        if (!$workoutDay->updateByIdAndUserId((int)$data["workout_day_id"], (int)$this->userAuthId)) {
            $this->call(
                500,
                "internal_server_error",
                $workoutDay->getErrorMessage() ?? "Não foi possível atualizar o dia de treino",
                "error"
            )->back(null);
            return;
        }

        $response = $workoutDay->listByIdAndUserId(
            (int)$data["workout_day_id"],
            (int)$this->userAuthId
        );

        $this->call(
            200,
            "success",
            "Dia de treino atualizado com sucesso",
            "success"
        )->back($response);
    }

    public function delete(array $data): void
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
            !isset($data["workout_day_id"]) ||
            empty($data["workout_day_id"]) ||
            !filter_var($data["workout_day_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do dia de treino é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $workoutDay = new WorkoutDay();

        if (!$workoutDay->deleteByIdAndUserId((int)$data["workout_day_id"], (int)$this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Dia de treino não encontrado",
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Dia de treino excluído com sucesso",
            "success"
        )->back(null);
    }

    private function validate(array $data, bool $requireWorkoutId): bool
    {
        if (
            !isset($data["name"]) ||
            empty(trim($data["name"]))
        ) {
            return false;
        }

        if (
            $requireWorkoutId &&
            (
                !isset($data["workout_id"]) ||
                empty($data["workout_id"]) ||
                !filter_var($data["workout_id"], FILTER_VALIDATE_INT)
            )
        ) {
            return false;
        }

        if (
            isset($data["display_order"]) &&
            $data["display_order"] !== "" &&
            !filter_var($data["display_order"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        return true;
    }
}