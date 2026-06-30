<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;
use PDO;

class Workout extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?int $studentId;
    private ?int $goalId;
    private ?int $trainingLevelId;
    private ?string $name;
    private ?string $description;
    private ?string $frequency;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $userId = null,
        ?int $studentId = null,
        ?int $goalId = null,
        ?int $trainingLevelId = null,
        ?string $name = null,
        ?string $description = null,
        ?string $frequency = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->studentId = $studentId;
        $this->goalId = $goalId;
        $this->trainingLevelId = $trainingLevelId;
        $this->name = $name;
        $this->description = $description;
        $this->frequency = $frequency;
        $this->active = $active;

        $this->table = "workouts";
        $this->primaryKey = "id";
        $this->fillable = [
            "userId",
            "studentId",
            "goalId",
            "trainingLevelId",
            "name",
            "description",
            "frequency",
            "active"
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }

    public function getUserId(): ?int { return $this->userId; }
    public function setUserId(?int $userId): void { $this->userId = $userId; }

    public function getStudentId(): ?int { return $this->studentId; }
    public function setStudentId(?int $studentId): void { $this->studentId = $studentId; }

    public function getGoalId(): ?int { return $this->goalId; }
    public function setGoalId(?int $goalId): void { $this->goalId = $goalId; }

    public function getTrainingLevelId(): ?int { return $this->trainingLevelId; }
    public function setTrainingLevelId(?int $trainingLevelId): void { $this->trainingLevelId = $trainingLevelId; }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): void { $this->name = $name; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): void { $this->description = $description; }

    public function getFrequency(): ?string { return $this->frequency; }
    public function setFrequency(?string $frequency): void { $this->frequency = $frequency; }

    public function getActive(): ?int { return $this->active; }
    public function setActive(?int $active): void { $this->active = $active; }

    public function listAllByUserId(int $userId): array
    {
        $query = "
            SELECT
                w.id,
                w.name,
                w.description,
                w.frequency,
                s.name AS student_name,
                g.name AS goal_name,
                tl.name AS training_level
            FROM workouts w
            LEFT JOIN students s ON s.id = w.student_id
            LEFT JOIN goals g ON g.id = w.goal_id
            LEFT JOIN training_levels tl ON tl.id = w.training_level_id
            WHERE w.user_id = :user_id
            AND w.active = 1
            ORDER BY w.id DESC
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listByIdAndUserId(int $workoutId, int $userId): array|bool
    {
        $query = "
            SELECT
                w.id,
                w.user_id,
                w.student_id,
                w.goal_id,
                w.training_level_id,
                w.name,
                w.description,
                w.frequency,
                s.name AS student_name,
                g.name AS goal_name,
                tl.name AS training_level
            FROM workouts w
            LEFT JOIN students s ON s.id = w.student_id
            LEFT JOIN goals g ON g.id = w.goal_id
            LEFT JOIN training_levels tl ON tl.id = w.training_level_id
            WHERE w.id = :id
            AND w.user_id = :user_id
            AND w.active = 1
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":id", $workoutId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function updateByIdAndUserId(int $workoutId, int $userId): bool
{
    $payload = $this->extractPayloadFromGetters();

    if (empty($payload)) {
        $this->errorMessage = "Nenhum campo válido para atualização.";
        return false;
    }

    unset($payload["user_id"]);

    $setParts = [];

    foreach (array_keys($payload) as $column) {
        $setParts[] = "{$column} = :{$column}";
    }

    $query = "
        UPDATE {$this->table}
        SET " . implode(", ", $setParts) . "
        WHERE id = :id
        AND user_id = :user_id
        AND active = 1
    ";

    $stmt = Connect::getInstance()->prepare($query);

    foreach ($payload as $column => $value) {
        $stmt->bindValue(":{$column}", $value);
    }

    $stmt->bindValue(":id", $workoutId, PDO::PARAM_INT);
    $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() < 1) {
        $this->errorMessage = "Treino não encontrado ou sem alterações.";
        return false;
    }

    return true;
}

public function deleteByIdAndUserId(int $workoutId, int $userId): bool
{
    $query = "
        DELETE FROM {$this->table}
        WHERE id = :id
        AND user_id = :user_id
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $workoutId, PDO::PARAM_INT);
    $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() < 1) {
        $this->errorMessage = "Treino não encontrado.";
        return false;
    }

    return true;
}
}