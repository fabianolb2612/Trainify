<?php

namespace Source\Models\Faqs;

use PDO;
use Source\Core\Connect;
use Source\Core\JWTToken;
use PDOException;
use Source\Core\Model;

class Faq extends Model
{
    private ?int $id;
    private ?int $faqsCategoryId;
    private ?string $question;
    private ?string $answer;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $faqsCategoryId = null,
        ?string $question = null,
        ?string $answer = null,
        ?int $active = 1
    )
    {
        $this->id = $id;
        $this->faqsCategoryId = $faqsCategoryId;
        $this->question = $question;
        $this->answer = $answer;
        $this->active = $active;

        $this->table = "faqs";
        $this->primaryKey = "id";
        $this->fillable = [
            "faqsCategoryId",
            "question",
            "answer"
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getFaqsCategoryId(): ?int
    {
        return $this->faqsCategoryId;
    }

    public function setFaqsCategoryId(int $faqsCategoryId): void
    {
        $this->faqsCategoryId = $faqsCategoryId;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(string $question): void
    {
        $this->question = $question;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(string $answer): void
    {
        $this->answer = $answer;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }

    public function listAllFaqs(): array
    {
        try {
            $query = "
            SELECT
            f.id,
            f.question,
            f.answer,
            fc.name AS category_name
        FROM faqs f
        INNER JOIN faqs_categories fc
            ON fc.id = f.faqs_category_id
        WHERE f.active = 1
        ORDER BY f.id
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {

            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function listByIdWithCategory(int $id): array|bool
{
     $query = "
        SELECT
            f.id,
            f.question,
            f.answer,
            fc.name AS category_name
        FROM faqs f
        INNER JOIN faqs_categories fc
            ON fc.id = f.faqs_category_id
        WHERE f.id = :id
        AND f.active = 1
        LIMIT 1
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

public function deleteFaqById(int $id): bool
{
    $query = "
        UPDATE faqs
        SET active = 0
        WHERE id = :id
        AND active = 1
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() < 1) {
        $this->errorMessage = "FAQ não encontrado";
        return false;
    }

    return true;
}
}