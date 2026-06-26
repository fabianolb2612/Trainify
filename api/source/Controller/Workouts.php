<?php

namespace Source\Controller;

use Source\Models\Workout;

class Workouts extends Api
{
    public function insert(array $data): void
    {
        
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "O campo name é obrigatório. IDs devem ser números inteiros quando informados.", "error")->back(null);
            return;
        }

        $workout = new Workout(
            null,
            $this->userAuthId,
            !empty($data["student_id"]) ? (int)$data["student_id"] : null,
            !empty($data["goal_id"]) ? (int)$data["goal_id"] : null,
            !empty($data["training_level_id"]) ? (int)$data["training_level_id"] : null,
            trim($data["name"]),
            !empty($data["description"]) ? trim($data["description"]) : null,
            !empty($data["frequency"]) ? trim($data["frequency"]) : null,
            1
        );

        if (!$workout->insert()) {
            $this->call(500, "internal_server_error", $workout->getErrorMessage() ?? "Não foi possível cadastrar o treino", "error")->back(null);
            return;
        }

        $response = $workout->listByIdAndUserId($workout->getId(), $this->userAuthId);

        $this->call(201, "created", "Treino cadastrado com sucesso", "success")->back($response);
    }

    public function listAll(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        $workout = new Workout();

        $this->call(200, "success", "Lista de treinos", "success")
            ->back($workout->listAllByUserId($this->userAuthId));
    }

    public function listById(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (
            !isset($data["workout_id"]) ||
            empty($data["workout_id"]) ||
            !filter_var($data["workout_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID do treino é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $workout = new Workout();

        $response = $workout->listByIdAndUserId(
            (int)$data["workout_id"],
            (int)$this->userAuthId
        );

        if (!$response) {
            $this->call(404, "not_found", "Treino não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Treino encontrado", "success")->back($response);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (
            !isset($data["workout_id"]) ||
            empty($data["workout_id"]) ||
            !filter_var($data["workout_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($data)
        ) {
            $this->call(400, "bad_request", "ID inválido ou campos obrigatórios ausentes.", "error")->back(null);
            return;
        }

        $workoutExists = new Workout();

        if (!$workoutExists->listByIdAndUserId((int)$data["workout_id"], (int)$this->userAuthId)) {
            $this->call(404, "not_found", "Treino não encontrado", "error")->back(null);
            return;
        }

        $workout = new Workout(
            null,
            $this->userAuthId,
            !empty($data["student_id"]) ? (int)$data["student_id"] : null,
            !empty($data["goal_id"]) ? (int)$data["goal_id"] : null,
            !empty($data["training_level_id"]) ? (int)$data["training_level_id"] : null,
            trim($data["name"]),
            !empty($data["description"]) ? trim($data["description"]) : null,
            !empty($data["frequency"]) ? trim($data["frequency"]) : null,
            1
        );

        if (!$workout->updateByIdAndUserId((int)$data["workout_id"], (int)$this->userAuthId)) {
            $this->call(500, "internal_server_error", $workout->getErrorMessage() ?? "Não foi possível atualizar o treino", "error")->back(null);
            return;
        }

        $response = $workout->listByIdAndUserId((int)$data["workout_id"], (int)$this->userAuthId);

        $this->call(200, "success", "Treino atualizado com sucesso", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou token inválido.", "error")->back(null);
            return;
        }

        if (
            !isset($data["workout_id"]) ||
            empty($data["workout_id"]) ||
            !filter_var($data["workout_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID do treino é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $workout = new Workout();

        if (!$workout->deleteByIdAndUserId((int)$data["workout_id"], (int)$this->userAuthId)) {
            $this->call(404, "not_found", "Treino não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Treino excluído com sucesso", "success")->back(null);
    }

    private function validate(array $data): bool
    {
        if (!isset($data["name"]) || empty(trim($data["name"]))) {
            return false;
        }

        foreach (["student_id", "goal_id", "training_level_id"] as $field) {
            if (
                isset($data[$field]) &&
                !empty($data[$field]) &&
                !filter_var($data[$field], FILTER_VALIDATE_INT)
            ) {
                return false;
            }
        }

        return true;
    }
}