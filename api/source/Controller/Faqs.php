<?php

namespace Source\Controller;

use Source\Models\Faq;

class Faqs extends Api
{
    public function listAll(array $data): void
    {
        $faq = new Faq();

        $this->call(
            200,
            "success",
            "Lista de FAQs",
            "success"
        )->back(
            $faq->listAllFaqs()
        );
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();$response = $faq->listByIdWithCategory((int)$data["faq_id"]);

        if (!$response) {$this->call(
                404,
                "not_found",
                "FAQ não encontrado",
                "error"
            )->back(null);
            return;
        }

        $this->call( 200, "success", "FAQ encontrado", "success" )->back($response);
    }

    public function insert(array $data): void
    {
        $rawInput = file_get_contents("php://input");
        if (!empty($rawInput)) {
            $body = json_decode($rawInput, true);
            if (!is_array($body)) {
                parse_str($rawInput,$body);
            }
            if (is_array($body)) {$data = array_merge($data,$body);
            }
        }

        $categoryId = filter_var(
            $data["faqs_category_id"] ?? $data["category_id"] ?? 1,
            FILTER_VALIDATE_INT
        ) ?: 1;

        if (
            !isset($data["question"]) ||
            !isset($data["answer"]) ||
            empty(trim($data["question"])) ||
            empty(trim($data["answer"]))
        ) {
            $this->call(
                400,
                "bad_request",
                "Os campos question e answer são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq(
            null,
            (int)$categoryId,
            trim($data["question"]),
            trim($data["answer"])
        );

        if (!$faq->insert()) {$this->call(
                500,
                "internal_server_error",
                "Não foi possível cadastrar o FAQ. Verifique se existe uma categoria cadastrada.",
                "error"
            )->back(null);
            return;
        }

        $response = $faq->listByIdWithCategory((int)$faq->getId());

        $this->call( 201, "created", "FAQ criado com sucesso", "success" )->back($response);
    }

    public function update(array $data): void
    {
        $rawInput = file_get_contents("php://input");
        if (!empty($rawInput)) {
            $body = json_decode($rawInput, true);
            if (!is_array($body)) {
                parse_str($rawInput,$body);
            }
            if (is_array($body)) {$data = array_merge($data,$body);
            }
        }

        $categoryId = filter_var(
            $data["faqs_category_id"] ?? $data["category_id"] ?? 1,
            FILTER_VALIDATE_INT
        ) ?: 1;

        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT) ||
            !isset($data["question"]) ||
            !isset($data["answer"]) ||
            empty(trim($data["question"])) ||
            empty(trim($data["answer"]))
        ) {
            $this->call(
                400,
                "bad_request",
                "ID inválido ou campos obrigatórios ausentes",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();

        if (!$faq->listByIdWithCategory((int)$data["faq_id"])) {
            $this->call(
                404,
                "not_found",
                "FAQ não encontrado",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq(
            null,
            (int)$categoryId,
            trim($data["question"]),
            trim($data["answer"])
        );

        if (!$faq->updateById((int)$data["faq_id"])) {
            $this->call(
                500,
                "internal_server_error",
                "Não foi possível atualizar o FAQ",
                "error"
            )->back(null);
            return;
        }

        $response = $faq->listByIdWithCategory((int)$data["faq_id"]);

        $this->call( 200, "success", "FAQ atualizado com sucesso", "success" )->back($response);
    }

    public function delete(array $data): void
    {
        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();

        if (!$faq->deleteFaqById((int)$data["faq_id"])) {
            $this->call(
                404,
                "not_found",
                "FAQ não encontrado",
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "FAQ removido com sucesso",
            "success"
        )->back(null);
    }
}