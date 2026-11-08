<?php

namespace Source\Controller;

use Source\Models\Student;
use Source\Models\StudentImage;
use Source\Support\Upload;
use RuntimeException;

class StudentImages extends Api
{
    public function upload(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Usuário não está autenticado ou token inválido.",
                "error"
            )->back(null);
            return;
        }

        $studentId = (int)($data["student_id"] ?? 0);

        if (!$studentId) {
            $this->call(
                400,
                "bad_request",
                "O ID do aluno é obrigatório.",
                "error"
            )->back(null);
            return;
        }

        $student = new Student();
        if (!$student->selectById($studentId)) {
            $this->call(
                404,
                "not_found",
                "Aluno não encontrado.",
                "error"
            )->back(null);
            return;
        }

        if ($student->getUserId() !== (int)$this->userAuthId && !$this->authToken(1)) {
            $this->call(
                403,
                "forbidden",
                "Você não tem permissão para alterar a galeria deste aluno.",
                "error"
            )->back(null);
            return;
        }

        if (empty($_FILES["images"]) && empty($_FILES["image"])) {
            $this->call(
                400,
                "bad_request",
                "Nenhuma imagem foi enviada.",
                "error"
            )->back(null);
            return;
        }

        $uploadDirectory = dirname(__DIR__, 3)
            . DIRECTORY_SEPARATOR . "uploads"
            . DIRECTORY_SEPARATOR . "gallery";

        $files = $_FILES["images"] ?? $_FILES["image"];
        $fileList = $this->reArrayFiles($files);
        $savedImages = [];

        try {
            $uploader = new Upload($uploadDirectory);

            foreach ($fileList as $file) {
                $filename = $uploader->image($file);
                $photoPath = "uploads/gallery/" . $filename;

                $studentImage = new StudentImage(
                    null,
                    $studentId,
                    $photoPath,
                    $file["name"] ?? null
                );

                if (!$studentImage->insert()) {
                    $physicalPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
                    if (is_file($physicalPath)) {
                        unlink($physicalPath);
                    }

                    $this->call(
                        500,
                        "internal_server_error",
                        $studentImage->getErrorMessage() ?? "Não foi possível registrar a imagem no banco.",
                        "error"
                    )->back(null);
                    return;
                }

                $savedImages[] = [
                    "id" => $studentImage->getId(),
                    "student_id" => $studentImage->getStudentId(),
                    "image_path" => $studentImage->getImagePath(),
                    "alt_text" => $studentImage->getAltText()
                ];
            }

            $this->call(
                201,
                "created",
                "Imagens adicionadas à galeria do aluno com sucesso.",
                "success"
            )->back($savedImages);

        } catch (RuntimeException $exception) {
            $this->call(
                400,
                "bad_request",
                $exception->getMessage(),
                "error"
            )->back(null);
        }
    }

    public function list(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Usuário não está autenticado ou token inválido.",
                "error"
            )->back(null);
            return;
        }

        $studentId = (int)($data["student_id"] ?? 0);

        if (!$studentId) {
            $this->call(
                400,
                "bad_request",
                "O ID do aluno é obrigatório.",
                "error"
            )->back(null);
            return;
        }

        $student = new Student();
        if (!$student->selectById($studentId)) {
            $this->call(
                404,
                "not_found",
                "Aluno não encontrado.",
                "error"
            )->back(null);
            return;
        }

        if ($student->getUserId() !== (int)$this->userAuthId && !$this->authToken(1)) {
            $this->call(
                403,
                "forbidden",
                "Você não tem permissão para visualizar a galeria deste aluno.",
                "error"
            )->back(null);
            return;
        }

        $studentImage = new StudentImage();
        $gallery = $studentImage->findByStudent($studentId);

        $this->call(
            200,
            "success",
            "Galeria de imagens do aluno",
            "success"
        )->back($gallery);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Usuário não está autenticado ou token inválido.",
                "error"
            )->back(null);
            return;
        }

        $studentId = (int)($data["student_id"] ?? 0);
        $imageId = (int)($data["image_id"] ?? 0);

        if (!$studentId || !$imageId) {
            $this->call(
                400,
                "bad_request",
                "Identificadores do aluno e da imagem são obrigatórios.",
                "error"
            )->back(null);
            return;
        }

        $studentImage = new StudentImage();
        if (!$studentImage->selectById($imageId)) {
            $this->call(
                404,
                "not_found",
                "Imagem não encontrada na galeria.",
                "error"
            )->back(null);
            return;
        }

        if ($studentImage->getStudentId() !== $studentId) {
            $this->call(
                400,
                "bad_request",
                "A imagem informada não pertence ao aluno especificado.",
                "error"
            )->back(null);
            return;
        }

        $student = new Student();
        if (!$student->selectById($studentId)) {
            $this->call(
                404,
                "not_found",
                "Aluno não encontrado.",
                "error"
            )->back(null);
            return;
        }

        if ($student->getUserId() !== (int)$this->userAuthId && !$this->authToken(1)) {
            $this->call(
                403,
                "forbidden",
                "Você não tem permissão para remover esta imagem.",
                "error"
            )->back(null);
            return;
        }

        $imagePath = $studentImage->getImagePath();

        if (!$studentImage->deleteById($imageId)) {
            $this->call(
                500,
                "internal_server_error",
                "Não foi possível remover a imagem do banco.",
                "error"
            )->back(null);
            return;
        }

        $this->deletePhysicalFile($imagePath);

        $this->call(
            200,
            "success",
            "Imagem removida da galeria do aluno com sucesso.",
            "success"
        )->back(null);
    }

    private function deletePhysicalFile(?string $photo): void
    {
        if (empty($photo)) {
            return;
        }

        $filename = basename($photo);
        $filePath = dirname(__DIR__, 3)
            . DIRECTORY_SEPARATOR . "uploads"
            . DIRECTORY_SEPARATOR . "gallery"
            . DIRECTORY_SEPARATOR . $filename;

        if (is_file($filePath)) {
            unlink($filePath);
        }
    }

    private function reArrayFiles(array $filePost): array
    {
        $fileAry = [];
        if (!is_array($filePost['name'])) {
            return [$filePost];
        }
        $fileCount = count($filePost['name']);
        $fileKeys = array_keys($filePost);

        for ($i = 0; $i < $fileCount; $i++) {
            foreach ($fileKeys as $key) {
                $fileAry[$i][$key] = $filePost[$key][$i];
            }
        }
        return $fileAry;
    }
}