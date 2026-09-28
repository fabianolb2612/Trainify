<?php

namespace Source\Controller;

use Source\Models\WorkoutDayExercise;

class WorkoutDayExercises extends Api
{
    /**
     * Cadastra um exercício dentro de um dia de treino.
     */
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
                "Os campos workout_day_id, exercise_id, sets e reps são obrigatórios. rest_seconds e display_order devem ser inteiros quando informados.",
                "error"
            )->back(null);

            return;
        }

        $workoutDayExercise = new WorkoutDayExercise();

        /*
         * Verifica se o dia pertence ao treinador.
         */
        if (
            !$workoutDayExercise->workoutDayBelongsToUser(
                (int)$data["workout_day_id"],
                (int)$this->userAuthId
            )
        ) {
            $this->call(
                404,
                "not_found",
                "Dia de treino não encontrado.",
                "error"
            )->back(null);

            return;
        }

        /*
         * Verifica se o exercício existe.
         */
        if (
            !$workoutDayExercise->exerciseExists(
                (int)$data["exercise_id"]
            )
        ) {
            $this->call(
                404,
                "not_found",
                "Exercício não encontrado.",
                "error"
            )->back(null);

            return;
        }

        $workoutDayExercise = new WorkoutDayExercise(
            null,
            (int)$data["workout_day_id"],
            (int)$data["exercise_id"],
            (int)$data["sets"],
            trim($data["reps"]),
            isset($data["rest_seconds"]) &&
            $data["rest_seconds"] !== ""
                ? (int)$data["rest_seconds"]
                : 60,
            isset($data["display_order"]) &&
            $data["display_order"] !== ""
                ? (int)$data["display_order"]
                : 1,
            isset($data["notes"]) &&
            trim($data["notes"]) !== ""
                ? trim($data["notes"])
                : null
        );

        if (!$workoutDayExercise->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $workoutDayExercise->getErrorMessage()
                    ?? "Não foi possível cadastrar o exercício no dia de treino.",
                "error"
            )->back(null);

            return;
        }

        $response =
            $workoutDayExercise->listByIdAndUserId(
                (int)$workoutDayExercise->getId(),
                (int)$this->userAuthId
            );

        $this->call(
            201,
            "created",
            "Exercício adicionado ao dia de treino com sucesso.",
            "success"
        )->back($response);
    }

    /**
     * Lista os exercícios de um dia de treino.
     */
    public function listByWorkoutDay(array $data): void
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
            !filter_var(
                $data["workout_day_id"],
                FILTER_VALIDATE_INT
            )
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do dia de treino é obrigatório e deve ser um número inteiro.",
                "error"
            )->back(null);

            return;
        }

        $workoutDayExercise = new WorkoutDayExercise();

        if (
            !$workoutDayExercise->workoutDayBelongsToUser(
                (int)$data["workout_day_id"],
                (int)$this->userAuthId
            )
        ) {
            $this->call(
                404,
                "not_found",
                "Dia de treino não encontrado.",
                "error"
            )->back(null);

            return;
        }

        $response =
            $workoutDayExercise->listAllByWorkoutDayId(
                (int)$data["workout_day_id"],
                (int)$this->userAuthId
            );

        $this->call(
            200,
            "success",
            "Lista de exercícios do dia de treino.",
            "success"
        )->back($response);
    }

    /**
     * Busca um exercício específico dentro de um dia.
     */
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
            !isset($data["workout_day_exercise_id"]) ||
            empty($data["workout_day_exercise_id"]) ||
            !filter_var(
                $data["workout_day_exercise_id"],
                FILTER_VALIDATE_INT
            )
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do exercício do dia é obrigatório e deve ser um número inteiro.",
                "error"
            )->back(null);

            return;
        }

        $workoutDayExercise = new WorkoutDayExercise();

        $response =
            $workoutDayExercise->listByIdAndUserId(
                (int)$data["workout_day_exercise_id"],
                (int)$this->userAuthId
            );

        if (!$response) {
            $this->call(
                404,
                "not_found",
                "Exercício do dia de treino não encontrado.",
                "error"
            )->back(null);

            return;
        }

        $this->call(
            200,
            "success",
            "Exercício do dia encontrado.",
            "success"
        )->back($response);
    }

    /**
     * Atualiza um exercício dentro de um dia.
     */
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
            !isset($data["workout_day_exercise_id"]) ||
            empty($data["workout_day_exercise_id"]) ||
            !filter_var(
                $data["workout_day_exercise_id"],
                FILTER_VALIDATE_INT
            ) ||
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

        $workoutDayExerciseExists =
            new WorkoutDayExercise();

        $existing =
            $workoutDayExerciseExists->listByIdAndUserId(
                (int)$data["workout_day_exercise_id"],
                (int)$this->userAuthId
            );

        if (!$existing) {
            $this->call(
                404,
                "not_found",
                "Exercício do dia de treino não encontrado.",
                "error"
            )->back(null);

            return;
        }

        /*
         * Se o exercício estiver sendo alterado,
         * verifica se ele existe.
         */
        if (
            isset($data["exercise_id"]) &&
            $data["exercise_id"] !== ""
        ) {
            $exerciseExists =
                $workoutDayExerciseExists->exerciseExists(
                    (int)$data["exercise_id"]
                );

            if (!$exerciseExists) {
                $this->call(
                    404,
                    "not_found",
                    "Exercício não encontrado.",
                    "error"
                )->back(null);

                return;
            }
        }

        $workoutDayExercise = new WorkoutDayExercise(
            null,
            (int)$existing["workout_day_id"],
            isset($data["exercise_id"]) &&
            $data["exercise_id"] !== ""
                ? (int)$data["exercise_id"]
                : (int)$existing["exercise_id"],
            isset($data["sets"]) &&
            $data["sets"] !== ""
                ? (int)$data["sets"]
                : (int)$existing["sets"],
            isset($data["reps"]) &&
            trim($data["reps"]) !== ""
                ? trim($data["reps"])
                : $existing["reps"],
            isset($data["rest_seconds"]) &&
            $data["rest_seconds"] !== ""
                ? (int)$data["rest_seconds"]
                : (int)$existing["rest_seconds"],
            isset($data["display_order"]) &&
            $data["display_order"] !== ""
                ? (int)$data["display_order"]
                : (int)$existing["display_order"],
            array_key_exists("notes", $data)
                ? (
                    trim((string)$data["notes"]) !== ""
                        ? trim((string)$data["notes"])
                        : null
                )
                : ($existing["notes"] ?? null)
        );

        if (
            !$workoutDayExercise->updateByIdAndUserId(
                (int)$data["workout_day_exercise_id"],
                (int)$this->userAuthId
            )
        ) {
            $this->call(
                500,
                "internal_server_error",
                $workoutDayExercise->getErrorMessage()
                    ?? "Não foi possível atualizar o exercício do dia.",
                "error"
            )->back(null);

            return;
        }

        $response =
            $workoutDayExercise->listByIdAndUserId(
                (int)$data["workout_day_exercise_id"],
                (int)$this->userAuthId
            );

        $this->call(
            200,
            "success",
            "Exercício do dia atualizado com sucesso.",
            "success"
        )->back($response);
    }

    /**
     * Exclui um exercício de um dia.
     */
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
            !isset($data["workout_day_exercise_id"]) ||
            empty($data["workout_day_exercise_id"]) ||
            !filter_var(
                $data["workout_day_exercise_id"],
                FILTER_VALIDATE_INT
            )
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do exercício do dia é obrigatório e deve ser um número inteiro.",
                "error"
            )->back(null);

            return;
        }

        $workoutDayExercise =
            new WorkoutDayExercise();

        if (
            !$workoutDayExercise->deleteByIdAndUserId(
                (int)$data["workout_day_exercise_id"],
                (int)$this->userAuthId
            )
        ) {
            $this->call(
                404,
                "not_found",
                "Exercício do dia de treino não encontrado.",
                "error"
            )->back(null);

            return;
        }

        $this->call(
            200,
            "success",
            "Exercício removido do dia de treino com sucesso.",
            "success"
        )->back(null);
    }

    /**
     * Valida os dados recebidos.
     */
    private function validate(
        array $data,
        bool $requireAll
    ): bool {
        if (
            $requireAll &&
            (
                !isset($data["workout_day_id"]) ||
                empty($data["workout_day_id"]) ||
                !filter_var(
                    $data["workout_day_id"],
                    FILTER_VALIDATE_INT
                )
            )
        ) {
            return false;
        }

        if (
            $requireAll &&
            (
                !isset($data["exercise_id"]) ||
                empty($data["exercise_id"]) ||
                !filter_var(
                    $data["exercise_id"],
                    FILTER_VALIDATE_INT
                )
            )
        ) {
            return false;
        }

        if (
            isset($data["exercise_id"]) &&
            $data["exercise_id"] !== "" &&
            !filter_var(
                $data["exercise_id"],
                FILTER_VALIDATE_INT
            )
        ) {
            return false;
        }

        if (
            $requireAll &&
            (
                !isset($data["sets"]) ||
                $data["sets"] === "" ||
                !filter_var(
                    $data["sets"],
                    FILTER_VALIDATE_INT
                ) ||
                (int)$data["sets"] < 1
            )
        ) {
            return false;
        }

        if (
            isset($data["sets"]) &&
            $data["sets"] !== "" &&
            (
                !filter_var(
                    $data["sets"],
                    FILTER_VALIDATE_INT
                ) ||
                (int)$data["sets"] < 1
            )
        ) {
            return false;
        }

        if (
            $requireAll &&
            (
                !isset($data["reps"]) ||
                empty(trim($data["reps"]))
            )
        ) {
            return false;
        }

        if (
            isset($data["rest_seconds"]) &&
            $data["rest_seconds"] !== "" &&
            (
                !filter_var(
                    $data["rest_seconds"],
                    FILTER_VALIDATE_INT
                ) ||
                (int)$data["rest_seconds"] < 0
            )
        ) {
            return false;
        }

        if (
            isset($data["display_order"]) &&
            $data["display_order"] !== "" &&
            (
                !filter_var(
                    $data["display_order"],
                    FILTER_VALIDATE_INT
                ) ||
                (int)$data["display_order"] < 1
            )
        ) {
            return false;
        }

        if (
            isset($data["notes"]) &&
            strlen(trim((string)$data["notes"])) > 255
        ) {
            return false;
        }

        return true;
    }
}