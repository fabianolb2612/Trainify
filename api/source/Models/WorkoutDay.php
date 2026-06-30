<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;

class WorkoutDay extends Model
{
    private ?int $id;
    private ?int $workoutId;
    private ?string $name;
    private ?int $displayOrder;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $workoutId = null,
        ?string $name = null,
        ?int $displayOrder = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->workoutId = $workoutId;
        $this->name = $name;
        $this->displayOrder = $displayOrder;
        $this->active = $active;

        $this->table = "workout_days";
        $this->primaryKey = "id";
        $this->fillable = [
            "workoutId",
            "name",
            "displayOrder",
            "active"
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }

    public function getWorkoutId(): ?int { return $this->workoutId; }
    public function setWorkoutId(?int $workoutId): void { $this->workoutId = $workoutId; }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): void { $this->name = $name; }

    public function getDisplayOrder(): ?int { return $this->displayOrder; }
    public function setDisplayOrder(?int $displayOrder): void { $this->displayOrder = $displayOrder; }

    public function getActive(): ?int { return $this->active; }
    public function setActive(?int $active): void { $this->active = $active; }

    public function workoutBelongsToUser(int $workoutId, int $userId): bool
    {
        $query = "
            SELECT id
            FROM workouts
            WHERE id = :workout_id
            AND user_id = :user_id
            AND active = 1
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":workout_id", $workoutId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function listAllByWorkoutId(int $workoutId, int $userId): array
    {
        $query = "
            SELECT
                wd.id,
                wd.workout_id,
                wd.name,
                wd.display_order
            FROM workout_days wd
            INNER JOIN workouts w ON w.id = wd.workout_id
            WHERE wd.workout_id = :workout_id
            AND w.user_id = :user_id
            AND w.active = 1
            ORDER BY wd.display_order ASC, wd.id ASC
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":workout_id", $workoutId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listByIdAndUserId(int $workoutDayId, int $userId): array|bool
    {
        $query = "
            SELECT
                wd.id,
                wd.workout_id,
                wd.name,
                wd.display_order
            FROM workout_days wd
            INNER JOIN workouts w ON w.id = wd.workout_id
            WHERE wd.id = :id
            AND w.user_id = :user_id
            AND w.active = 1
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":id", $workoutDayId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateByIdAndUserId(int $workoutDayId, int $userId): bool
    {
        $payload = $this->extractPayloadFromGetters();

        if (empty($payload)) {
            $this->errorMessage = "Nenhum campo válido para atualização.";
            return false;
        }

        $setParts = [];

        foreach (array_keys($payload) as $column) {
            $setParts[] = "wd.{$column} = :{$column}";
        }

        $query = "
            UPDATE workout_days wd
            INNER JOIN workouts w ON w.id = wd.workout_id
            SET " . implode(", ", $setParts) . "
            WHERE wd.id = :id
            AND w.user_id = :user_id
            AND w.active = 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        foreach ($payload as $column => $value) {
            $stmt->bindValue(":{$column}", $value);
        }

        $stmt->bindValue(":id", $workoutDayId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() < 1) {
            $this->errorMessage = "Dia de treino não encontrado ou sem alterações.";
            return false;
        }

        return true;
    }

    public function deleteByIdAndUserId(int $workoutDayId, int $userId): bool
    {
        $query = "
            DELETE wd
            FROM workout_days wd
            INNER JOIN workouts w ON w.id = wd.workout_id
            WHERE wd.id = :id
            AND w.user_id = :user_id
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":id", $workoutDayId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() < 1) {
            $this->errorMessage = "Dia de treino não encontrado.";
            return false;
        }

        return true;
    }
}