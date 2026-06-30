<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;
use Source\Core\JWTToken;

class User extends Model
{
    private ?int $id;
    private ?int $typeId;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $photo;
    private ?string $cref;
    private ?string $phone;
    private ?string $city;
    private ?string $bio;
    private ?string $specialty;
    private ?int $active;

    private ?string $token = null;

    public function __construct(
        ?int $id = null,
        ?int $typeId = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?string $photo = null,
        ?string $cref = null,
        ?string $phone = null,
        ?string $city = null,
        ?string $bio = null,
        ?string $specialty = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->typeId = $typeId;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;
        $this->cref = $cref;
        $this->phone = $phone;
        $this->city = $city;
        $this->bio = $bio;
        $this->specialty = $specialty;
        $this->active = $active;

        $this->table = "users";
        $this->primaryKey = "id";
        $this->fillable = [
            "typeId",
            "name",
            "email",
            "password",
            "photo",
            "cref",
            "phone",
            "city",
            "bio",
            "specialty",
            "active"
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }

    public function getTypeId(): ?int { return $this->typeId; }
    public function setTypeId(?int $typeId): void { $this->typeId = $typeId; }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): void { $this->name = $name; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): void { $this->email = $email; }

    public function getPassword(): ?string { return $this->password; }
    public function setPassword(?string $password): void { $this->password = $password; }

    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $photo): void { $this->photo = $photo; }

    public function getCref(): ?string { return $this->cref; }
    public function setCref(?string $cref): void { $this->cref = $cref; }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): void { $this->phone = $phone; }

    public function getCity(): ?string { return $this->city; }
    public function setCity(?string $city): void { $this->city = $city; }

    public function getBio(): ?string { return $this->bio; }
    public function setBio(?string $bio): void { $this->bio = $bio; }

    public function getSpecialty(): ?string { return $this->specialty; }
    public function setSpecialty(?string $specialty): void { $this->specialty = $specialty; }

    public function getActive(): ?int { return $this->active; }
    public function setActive(?int $active): void { $this->active = $active; }

    public function getToken(): ?string { return $this->token; }

    public function insert(): bool
    {
        $query = "SELECT id FROM {$this->table} WHERE email = :email LIMIT 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":email", $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $this->errorMessage = "E-mail já cadastrado";
            return false;
        }

        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        if (!parent::insert()) {
            $this->errorMessage = "Não foi possível cadastrar o usuário";
            return false;
        }

        return true;
    }
    public function listAll(): array
{
    $query = "
        SELECT 
            id,
            type_id,
            name,
            email,
            photo,
            cref,
            phone,
            city,
            bio,
            specialty,
            active
        FROM users
        ORDER BY id ASC
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

public function listById(int $id): array|bool
{
    $query = "
        SELECT 
            id,
            type_id,
            name,
            email,
            photo,
            cref,
            phone,
            city,
            bio,
            specialty,
            active
        FROM users
        WHERE id = :id
        LIMIT 1
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

public function listPaginator(int $page, int $perPage): array
{
    $offset = ($page - 1) * $perPage;

    $queryCount = "SELECT COUNT(*) AS total FROM users";

    $stmtCount = Connect::getInstance()->prepare($queryCount);
    $stmtCount->execute();
    $total = (int) $stmtCount->fetch(PDO::FETCH_OBJ)->total;

    $query = "
        SELECT 
            id,
            type_id,
            name,
            email,
            photo,
            cref,
            phone,
            city,
            bio,
            specialty,
            active
        FROM users
        ORDER BY id ASC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = Connect::getInstance()->prepare($query);
    $stmt->bindValue(":limit", $perPage, PDO::PARAM_INT);
    $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
    $stmt->execute();

    return [
        "page" => $page,
        "per_page" => $perPage,
        "total" => $total,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ];
}

    public function login(string $email, string $password, int $typeId = 2): bool
    {
        $query = "
            SELECT *
            FROM {$this->table}
            WHERE email = :email
            AND type_id = :typeId
            AND active = 1
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":email", $email);
        $stmt->bindValue(":typeId", $typeId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() == 0) {
            $this->errorMessage = "Usuário não encontrado ou inativo";
            return false;
        }

        $user = $stmt->fetch();

        if (!password_verify($password, $user->password)) {
            $this->errorMessage = "Senha incorreta";
            return false;
        }

        $this->id = $user->id;
        $this->typeId = $user->type_id;
        $this->name = $user->name;
        $this->email = $user->email;
        $this->photo = $user->photo;
        $this->cref = $user->cref;
        $this->phone = $user->phone;
        $this->city = $user->city;
        $this->bio = $user->bio;
        $this->specialty = $user->specialty;
        $this->active = $user->active;

        $jwt = new JWTToken();

        $this->token = $jwt->encode([
            "id" => $user->id,
            "type_id" => $user->type_id,
            "name" => $user->name,
            "email" => $user->email
        ]);

        return true;
    }

    public function permissionVerify(string $email, int $typeId): bool
    {
        $query = "
            SELECT id
            FROM {$this->table}
            WHERE email = :email
            AND type_id = :typeId
            AND active = 1
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":email", $email);
        $stmt->bindValue(":typeId", $typeId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}