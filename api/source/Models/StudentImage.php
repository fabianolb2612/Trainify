<?php

namespace Source\Models;

use Source\Core\Connect;
use PDO;
use PDOException;

class StudentImage
{
    private ?int $id;
    private ?int $studentId;
    private ?string $imagePath;
    private ?string $altText;
    private int $position;
    private ?string $createdAt;
    private ?string $errorMessage = null;

    public function __construct(
        ?int $id = null,
        ?int $studentId = null,
        ?string $imagePath = null,
        ?string $altText = null,
        int $position = 0,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->studentId = $studentId;
        $this->imagePath = $imagePath;
        $this->altText = $altText;
        $this->position = $position;
        $this->createdAt = $createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getStudentId(): ?int { return $this->studentId; }
    public function getImagePath(): ?string { return $this->imagePath; }
    public function getAltText(): ?string { return $this->altText; }
    public function getPosition(): int { return $this->position; }
    public function getCreatedAt(): ?string { return $this->createdAt; }
    public function getErrorMessage(): ?string { return $this->errorMessage; }

    public function insert(): bool
    {
        try {
            $query = "INSERT INTO student_images (student_id, image_path, alt_text, position) 
                      VALUES (:student_id, :image_path, :alt_text, :position)";
            $stmt = Connect::getInstance()->prepare($query);
            $success = $stmt->execute([
                "student_id" => $this->studentId,
                "image_path" => $this->imagePath,
                "alt_text" => $this->altText,
                "position" => $this->position
            ]);

            if ($success) {
                $this->id = (int)Connect::getInstance()->lastInsertId();
                return true;
            }

            $this->errorMessage = "Não foi possível inserir a imagem na galeria do aluno.";
            return false;
        } catch (PDOException $e) {
            $this->errorMessage = "Erro no banco de dados: " . $e->getMessage();
            return false;
        }
    }

    public function selectById(int $id): bool
    {
        try {
            $query = "SELECT * FROM student_images WHERE id = :id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute(["id" => $id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$data) {
                $this->errorMessage = "Imagem não encontrada.";
                return false;
            }

            $this->id = (int)$data["id"];
            $this->studentId = (int)$data["student_id"];
            $this->imagePath = $data["image_path"];
            $this->altText = $data["alt_text"];
            $this->position = (int)$data["position"];
            $this->createdAt = $data["created_at"];

            return true;
        } catch (PDOException $e) {
            $this->errorMessage = "Erro no banco de dados: " . $e->getMessage();
            return false;
        }
    }

    public function findByStudent(int $studentId): array
    {
        try {
            $query = "SELECT id, student_id, image_path, alt_text, position, created_at 
                      FROM student_images 
                      WHERE student_id = :student_id 
                      ORDER BY position ASC, id DESC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute(["student_id" => $studentId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            $this->errorMessage = "Erro no banco de dados: " . $e->getMessage();
            return [];
        }
    }

    public function deleteById(int $id): bool
    {
        try {
            $query = "DELETE FROM student_images WHERE id = :id";
            $stmt = Connect::getInstance()->prepare($query);
            return $stmt->execute(["id" => $id]);
        } catch (PDOException $e) {
            $this->errorMessage = "Erro ao excluir a imagem: " . $e->getMessage();
            return false;
        }
    }
}