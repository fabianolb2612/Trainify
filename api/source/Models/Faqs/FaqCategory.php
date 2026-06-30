<?php

namespace Source\Models\Faqs;

use Source\Core\Model;
use PDO;
use Source\Core\Connect;


class FaqCategory extends Model
{
    private ?int $id;
    private ?string $name;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?string $name = null,
        ?int $active = 1
    )
    {
        $this->id = $id;
        $this->name = $name;
        $this->active = $active;

        $this->table = "faqs_categories";
        $this->primaryKey = "id";
        $this->fillable = ["name"];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }
    public function setId(int $id): void
{
    $this->id = $id;
}

public function setName(string $name): void
{
    $this->name = $name;
}

public function setActive(int $active): void
{
    $this->active = $active;
}
public function hasActiveFaqs(int $id): bool
{
    $query = "SELECT COUNT(*) AS total FROM faqs WHERE faqs_category_id = :id AND active = 1
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result["total"] > 0;
}

public function softDeleteCategoryById(int $id): bool
{
    $query = "UPDATE faqs_categories SET active = 0 WHERE id = :id AND active = 1
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() < 1) {
        $this->errorMessage = "Categoria não encontrada";
        return false;
    }

    return true;
}
}