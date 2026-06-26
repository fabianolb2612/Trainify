<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;

class Exercise extends Model
{
    private ?int $id;
    private ?int $categoryId;
    private ?string $name;
    private ?string $description;

    public function __construct(
        ?int $id = null,
        ?int $categoryId = null,
        ?string $name = null,
        ?string $description = null
    ) {
        $this->id = $id;
        $this->categoryId = $categoryId;
        $this->name = $name;
        $this->description = $description;

        $this->table = "exercises";
        $this->primaryKey = "id";
        $this->fillable = [
            "categoryId",
            "name",
            "description"
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }

    public function getCategoryId(): ?int { return $this->categoryId; }
    public function setCategoryId(?int $categoryId): void { $this->categoryId = $categoryId; }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): void { $this->name = $name; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): void { $this->description = $description; }

    public function listAllWithCategory(): array
    {
        $query = "
            SELECT
                e.id,
                e.category_id,
                e.name,
                e.description,
                ec.name AS category_name
            FROM exercises e
            INNER JOIN exercise_categories ec
                ON ec.id = e.category_id
            ORDER BY e.name ASC
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listByIdWithCategory(int $id): array|bool
    {
        $query = "
            SELECT
                e.id,
                e.category_id,
                e.name,
                e.description,
                ec.name AS category_name
            FROM exercises e
            INNER JOIN exercise_categories ec
                ON ec.id = e.category_id
            WHERE e.id = :id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function categoryExists(int $categoryId): bool
    {
        $query = "
            SELECT id
            FROM exercise_categories
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":id", $categoryId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}