<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faqs\FaqCategory;

class FaqsCategories extends Api
{
   public function listAll(array $data): void
{
    $category = new FaqCategory();

    $this->call(
        200,
        "success",
        "Lista de Categorias de FAQ",
        "success"
    )->back($category->selectAll(["active = 1"]));
}
    public function listById(array $data): void
{
    if (
        !isset($data["category_id"]) ||
        empty($data["category_id"]) ||
        !filter_var($data["category_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da categoria é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $category = new FaqCategory();

    if (!$category->selectById($data["category_id"]) || $category->getActive() != 1) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back(null);
        return;
    }

    $response = [
        "id" => $category->getId(),
        "name" => $category->getName()
    ];

    $this->call(
        200,
        "success",
        "Categoria encontrada",
        "success"
    )->back($response);
}
public function insert(array $data): void
{
    if (
        !isset($data["name"]) ||
        empty(trim($data["name"]))
    ) {
        $this->call(
            400,
            "bad_request",
            "O campo name é obrigatório",
            "error"
        )->back(null);
        return;
    }

    $category = new FaqCategory(
        null,
        trim($data["name"])
    );

    if (!$category->insert()) {
        $this->call(
            500,
            "internal_server_error",
            "Não foi possível cadastrar a categoria",
            "error"
        )->back(null);
        return;
    }

    $response = [
        "id" => $category->getId(),
        "name" => $category->getName()
    ];

    $this->call(
        201,
        "created",
        "Categoria de FAQ criada com sucesso",
        "success"
    )->back($response);
}
public function update(array $data): void
{
    if (
        !isset($data["category_id"]) ||
        empty($data["category_id"]) ||
        !filter_var($data["category_id"], FILTER_VALIDATE_INT) ||
        !isset($data["name"]) ||
        empty(trim($data["name"]))
    ) {
        $this->call(
            400,
            "bad_request",
            "ID inválido ou campo name é obrigatório",
            "error"
        )->back(null);
        return;
    }

    $category = new FaqCategory();

    if (!$category->selectById($data["category_id"]) || $category->getActive() != 1) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back(null);
        return;
    }

    $category = new FaqCategory(
        null,
        trim($data["name"])
    );

    if (!$category->updateById($data["category_id"])) {
        $this->call(
            500,
            "internal_server_error",
            "Não foi possível atualizar a categoria",
            "error"
        )->back(null);
        return;
    }

    $response = [
        "id" => (int) $data["category_id"],
        "name" => $category->getName()
    ];

    $this->call(
        200,
        "success",
        "Categoria atualizada com sucesso",
        "success"
    )->back($response);
}
public function delete(array $data): void
{
    if (
        !isset($data["category_id"]) ||
        empty($data["category_id"]) ||
        !filter_var($data["category_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da categoria é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $category = new FaqCategory();

    if (!$category->selectById($data["category_id"]) || $category->getActive() != 1) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back(null);
        return;
    }

    if ($category->hasActiveFaqs($data["category_id"])) {
        $this->call(
            400,
            "bad_request",
            "Não é possível remover uma categoria que possui FAQs ativos",
            "error"
        )->back(null);
        return;
    }

    if (!$category->softDeleteCategoryById($data["category_id"])) {
        $this->call(
            404,
            "not_found",
            "Categoria não encontrada",
            "error"
        )->back(null);
        return;
    }

    $this->call(
        200,
        "success",
        "Categoria removida com sucesso",
        "success"
    )->back(null);
}
}