<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;

class WorkoutDayExercise extends Model
{
    private ?int $id;
    private ?int $workoutDayId;
    private ?int $exerciseId;
    private ?int $sets;
    private ?string $reps;
    private ?int $restSeconds;
    private ?int $displayOrder;
    private ?string $notes;

    public function __construct(
        ?int $id = null,
        ?int $workoutDayId = null,
        ?int $exerciseId = null,
        ?int $sets = 3,
        ?string $reps = "12",
        ?int $restSeconds = 60,
        ?int $displayOrder = 1,
        ?string $notes = null
    ) {
        $this->id = $id;
        $this->workoutDayId = $workoutDayId;
        $this->exerciseId = $exerciseId;
        $this->sets = $sets;
        $this->reps = $reps;
        $this->restSeconds = $restSeconds;
        $this->displayOrder = $displayOrder;
        $this->notes = $notes;

        $this->table = "workout_day_exercises";
        $this->primaryKey = "id";

        $this->fillable = [
            "workoutDayId",
            "exerciseId",
            "sets",
            "reps",
            "restSeconds",
            "displayOrder",
            "notes"
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getWorkoutDayId(): ?int
    {
        return $this->workoutDayId;
    }

    public function setWorkoutDayId(?int $workoutDayId): void
    {
        $this->workoutDayId = $workoutDayId;
    }

    public function getExerciseId(): ?int
    {
        return $this->exerciseId;
    }

    public function setExerciseId(?int $exerciseId): void
    {
        $this->exerciseId = $exerciseId;
    }

    public function getSets(): ?int
    {
        return $this->sets;
    }

    public function setSets(?int $sets): void
    {
        $this->sets = $sets;
    }

    public function getReps(): ?string
    {
        return $this->reps;
    }

    public function setReps(?string $reps): void
    {
        $this->reps = $reps;
    }

    public function getRestSeconds(): ?int
    {
        return $this->restSeconds;
    }

    public function setRestSeconds(?int $restSeconds): void
    {
        $this->restSeconds = $restSeconds;
    }

    public function getDisplayOrder(): ?int
    {
        return $this->displayOrder;
    }

    public function setDisplayOrder(?int $displayOrder): void
    {
        $this->displayOrder = $displayOrder;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    /**
     * Verifica se o dia de treino pertence ao treinador autenticado.
     */
    public function workoutDayBelongsToUser(
        int $workoutDayId,
        int $userId
    ): bool {
        $query = "
            SELECT wd.id
            FROM workout_days wd
            INNER JOIN workouts w
                ON w.id = wd.workout_id
            WHERE wd.id = :workout_day_id
            AND w.user_id = :user_id
            AND w.active = 1
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(
            ":workout_day_id",
            $workoutDayId,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":user_id",
            $userId,
            PDO::PARAM_INT
        );

        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Verifica se o exercício existe.
     */
    public function exerciseExists(int $exerciseId): bool
    {
        $query = "
            SELECT id
            FROM exercises
            WHERE id = :exercise_id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(
            ":exercise_id",
            $exerciseId,
            PDO::PARAM_INT
        );

        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Lista todos os exercícios de um determinado dia.
     */
    public function listAllByWorkoutDayId(
        int $workoutDayId,
        int $userId
    ): array {
        $query = "
            SELECT
                wde.id,
                wde.workout_day_id,
                wde.exercise_id,
                wde.sets,
                wde.reps,
                wde.rest_seconds,
                wde.display_order,
                wde.notes,

                e.name AS exercise_name,
                e.description AS exercise_description,

                ec.id AS category_id,
                ec.name AS category_name

            FROM workout_day_exercises wde

            INNER JOIN workout_days wd
                ON wd.id = wde.workout_day_id

            INNER JOIN workouts w
                ON w.id = wd.workout_id

            INNER JOIN exercises e
                ON e.id = wde.exercise_id

            INNER JOIN exercise_categories ec
                ON ec.id = e.category_id

            WHERE wde.workout_day_id = :workout_day_id
            AND w.user_id = :user_id
            AND w.active = 1

            ORDER BY
                wde.display_order ASC,
                wde.id ASC
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(
            ":workout_day_id",
            $workoutDayId,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":user_id",
            $userId,
            PDO::PARAM_INT
        );

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Busca um exercício específico dentro de um dia.
     */
    public function listByIdAndUserId(
        int $id,
        int $userId
    ): array|bool {
        $query = "
            SELECT
                wde.id,
                wde.workout_day_id,
                wde.exercise_id,
                wde.sets,
                wde.reps,
                wde.rest_seconds,
                wde.display_order,
                wde.notes,

                e.name AS exercise_name,
                e.description AS exercise_description,

                ec.id AS category_id,
                ec.name AS category_name

            FROM workout_day_exercises wde

            INNER JOIN workout_days wd
                ON wd.id = wde.workout_day_id

            INNER JOIN workouts w
                ON w.id = wd.workout_id

            INNER JOIN exercises e
                ON e.id = wde.exercise_id

            INNER JOIN exercise_categories ec
                ON ec.id = e.category_id

            WHERE wde.id = :id
            AND w.user_id = :user_id
            AND w.active = 1

            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(
            ":id",
            $id,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":user_id",
            $userId,
            PDO::PARAM_INT
        );

        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Atualiza um exercício dentro do dia.
     */
    public function updateByIdAndUserId(
        int $id,
        int $userId
    ): bool {
        $payload = $this->extractPayloadFromGetters();

        if (empty($payload)) {
            $this->errorMessage =
                "Nenhum campo válido para atualização.";

            return false;
        }

        $setParts = [];

        foreach (array_keys($payload) as $column) {
            $setParts[] =
                "wde.{$column} = :{$column}";
        }

        $query = "
            UPDATE workout_day_exercises wde

            INNER JOIN workout_days wd
                ON wd.id = wde.workout_day_id

            INNER JOIN workouts w
                ON w.id = wd.workout_id

            SET " . implode(", ", $setParts) . "

            WHERE wde.id = :id
            AND w.user_id = :user_id
            AND w.active = 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        foreach ($payload as $column => $value) {
            $stmt->bindValue(
                ":{$column}",
                $value
            );
        }

        $stmt->bindValue(
            ":id",
            $id,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":user_id",
            $userId,
            PDO::PARAM_INT
        );

        $stmt->execute();

        if ($stmt->rowCount() < 1) {
            $this->errorMessage =
                "Exercício não encontrado ou sem alterações.";

            return false;
        }

        return true;
    }

    /**
     * Remove um exercício do dia.
     */
    public function deleteByIdAndUserId(
        int $id,
        int $userId
    ): bool {
        $query = "
            DELETE wde
            FROM workout_day_exercises wde

            INNER JOIN workout_days wd
                ON wd.id = wde.workout_day_id

            INNER JOIN workouts w
                ON w.id = wd.workout_id

            WHERE wde.id = :id
            AND w.user_id = :user_id
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(
            ":id",
            $id,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":user_id",
            $userId,
            PDO::PARAM_INT
        );

        $stmt->execute();

        if ($stmt->rowCount() < 1) {
            $this->errorMessage =
                "Exercício do dia não encontrado.";

            return false;
        }

        return true;
    }
}