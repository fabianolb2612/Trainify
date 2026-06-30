<?php

namespace Source\Models;

use Source\Core\Model;

class Student extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?int $trainingLevelId;
    private ?int $goalId;
    private ?string $name;
    private ?string $email;
    private ?string $phone;
    private ?string $birthdate;
    private ?string $gym;
    private ?string $notes;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $userId = null,
        ?int $trainingLevelId = null,
        ?int $goalId = null,
        ?string $name = null,
        ?string $email = null,
        ?string $phone = null,
        ?string $birthdate = null,
        ?string $gym = null,
        ?string $notes = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->trainingLevelId = $trainingLevelId;
        $this->goalId = $goalId;
        $this->name = $name;
        $this->email = $email;
        $this->phone = $phone;
        $this->birthdate = $birthdate;
        $this->gym = $gym;
        $this->notes = $notes;
        $this->active = $active;

        $this->table = "students";
        $this->primaryKey = "id";

        $this->fillable = [
            "userId",
            "trainingLevelId",
            "goalId",
            "name",
            "email",
            "phone",
            "birthdate",
            "gym",
            "notes",
            "active"
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

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(?int $userId): void
    {
        $this->userId = $userId;
    }

    public function getTrainingLevelId(): ?int
    {
        return $this->trainingLevelId;
    }

    public function setTrainingLevelId(?int $trainingLevelId): void
    {
        $this->trainingLevelId = $trainingLevelId;
    }

    public function getGoalId(): ?int
    {
        return $this->goalId;
    }

    public function setGoalId(?int $goalId): void
    {
        $this->goalId = $goalId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): void
    {
        $this->phone = $phone;
    }

    public function getBirthdate(): ?string
    {
        return $this->birthdate;
    }

    public function setBirthdate(?string $birthdate): void
    {
        $this->birthdate = $birthdate;
    }

    public function getGym(): ?string
    {
        return $this->gym;
    }

    public function setGym(?string $gym): void
    {
        $this->gym = $gym;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }
    public function selectByIdAndUserId(int $studentId, int $userId): bool
{
    $query = "
        SELECT *
        FROM {$this->table}
        WHERE id = :id
        AND user_id = :user_id
        AND active = 1
        LIMIT 1
    ";

    $stmt = \Source\Core\Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $studentId, \PDO::PARAM_INT);
    $stmt->bindValue(":user_id", $userId, \PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch();

    if (!$result) {
        $this->errorMessage = "Aluno não encontrado";
        return false;
    }

    foreach ($result as $column => $value) {
        $property = $this->snakeToCamel($column);
        $setter = "set" . ucfirst($property);

        if (method_exists($this, $setter)) {
            $this->{$setter}($value);
        }
    }

    return true;
}

public function updateByIdAndUserId(int $studentId, int $userId): bool
{
    $payload = $this->extractPayloadFromGetters();

    if (empty($payload)) {
        $this->errorMessage = "Nenhum campo válido para atualização.";
        return false;
    }

    $setParts = [];

    foreach (array_keys($payload) as $column) {
        if ($column === "user_id") {
            continue;
        }

        $setParts[] = "{$column} = :{$column}";
    }

    if (empty($setParts)) {
        $this->errorMessage = "Nenhum campo válido para atualização.";
        return false;
    }

    $query = "
        UPDATE {$this->table}
        SET " . implode(", ", $setParts) . "
        WHERE id = :id
        AND user_id = :user_id
        AND active = 1
    ";

    $stmt = \Source\Core\Connect::getInstance()->prepare($query);

    foreach ($payload as $column => $value) {
        if ($column === "user_id") {
            continue;
        }

        $stmt->bindValue(":{$column}", $value);
    }

    $stmt->bindValue(":id", $studentId, \PDO::PARAM_INT);
    $stmt->bindValue(":user_id", $userId, \PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() < 1) {
        $this->errorMessage = "Aluno não encontrado ou sem alterações.";
        return false;
    }

    return true;
}
public function listAllByUserId(int $userId): array
{
    $query = "
        SELECT
            s.id,
            s.name,
            s.email,
            s.phone,
            s.birthdate,
            s.gym,
            s.notes,
            tl.name AS training_level,
            g.name AS goal
        FROM students s
        LEFT JOIN training_levels tl
            ON tl.id = s.training_level_id
        LEFT JOIN goals g
            ON g.id = s.goal_id
        WHERE s.user_id = :user_id
        AND s.active = 1
        ORDER BY s.name
    ";

    $stmt = \Source\Core\Connect::getInstance()->prepare($query);
    $stmt->bindValue(":user_id", $userId, \PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}
public function listByIdAndUserId(int $studentId, int $userId): array|bool
{
    $query = "
        SELECT
            s.id,
            s.name,
            s.email,
            s.phone,
            s.birthdate,
            s.gym,
            s.notes,
            tl.name AS training_level,
            g.name AS goal
        FROM students s
        LEFT JOIN training_levels tl
            ON tl.id = s.training_level_id
        LEFT JOIN goals g
            ON g.id = s.goal_id
        WHERE s.id = :student_id
        AND s.user_id = :user_id
        AND s.active = 1
        LIMIT 1
    ";

    $stmt = \Source\Core\Connect::getInstance()->prepare($query);

    $stmt->bindValue(":student_id", $studentId, \PDO::PARAM_INT);
    $stmt->bindValue(":user_id", $userId, \PDO::PARAM_INT);

    $stmt->execute();

    return $stmt->fetch(\PDO::FETCH_ASSOC);
}
public function deleteByIdAndUserId(int $studentId, int $userId): bool
{
    $query = "
        DELETE FROM {$this->table}
        WHERE id = :id
        AND user_id = :user_id
    ";

    $stmt = \Source\Core\Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $studentId, \PDO::PARAM_INT);
    $stmt->bindValue(":user_id", $userId, \PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() < 1) {
        $this->errorMessage = "Aluno não encontrado";
        return false;
    }

    return true;
}
}