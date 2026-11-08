<?php

namespace Source\Support;

use finfo;
use RuntimeException;

class Upload
{
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
        'application/zip' => 'zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
    ];

    public string $destinationDirectory;
    public int $maxFileSize = 10 * 1024 * 1024;
    public int $maxImageSize = 5 * 1024 * 1024;

    public array $allowedFileTypes = [
        'application/pdf',
        'application/zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    public array $allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    public function __construct(string $destinationDirectory)
    {
        if (trim($destinationDirectory) === '') {
            throw new RuntimeException('A pasta de destino do upload deve ser informada.');
        }

        $this->destinationDirectory = $destinationDirectory;
    }

    public function image(array $upload): string
    {
        return $this->store(
            $upload,
            $this->allowedImageTypes,
            $this->maxImageSize,
            true
        );
    }

    public function file(array $upload): string
    {
        return $this->store(
            $upload,
            $this->allowedFileTypes,
            $this->maxFileSize,
            false
        );
    }

    private function store(
        array $upload,
        array $allowedTypes,
        int $maxSize,
        bool $isImage
    ): string {
        if (
            trim($this->destinationDirectory) === '' ||
            $maxSize <= 0 ||
            $allowedTypes === []
        ) {
            throw new RuntimeException(
                'A configuração de destino, tamanho e tipos permitidos do upload é inválida.'
            );
        }

        foreach ($allowedTypes as $type) {
            if (!is_string($type) || trim($type) === '') {
                throw new RuntimeException(
                    'Os tipos permitidos devem ser informados como MIME types.'
                );
            }
        }

        if (
            !isset(
                $upload['name'],
                $upload['tmp_name'],
                $upload['error'],
                $upload['size']
            ) ||
            !is_string($upload['name']) ||
            !is_string($upload['tmp_name']) ||
            !is_int($upload['error']) ||
            !is_int($upload['size'])
        ) {
            throw new RuntimeException(
                'Os dados do arquivo enviado são inválidos.'
            );
        }

        if ($upload['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException(
                $this->uploadErrorMessage($upload['error'])
            );
        }

        if (!is_uploaded_file($upload['tmp_name'])) {
            throw new RuntimeException(
                'O arquivo não foi recebido por uma requisição de upload válida.'
            );
        }

        $actualSize = filesize($upload['tmp_name']);

        if ($actualSize === false || $actualSize !== $upload['size']) {
            throw new RuntimeException(
                'Não foi possível validar o tamanho do arquivo enviado.'
            );
        }

        if ($actualSize > $maxSize) {
            throw new RuntimeException(
                'O arquivo excede o tamanho máximo permitido.'
            );
        }

        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file(
            $upload['tmp_name']
        );

        if (!is_string($mimeType)) {
            throw new RuntimeException(
                'Não foi possível identificar o tipo do arquivo enviado.'
            );
        }

        $mimeType = strtolower($mimeType);
        $allowedTypes = array_map('strtolower', $allowedTypes);

        if (!in_array($mimeType, $allowedTypes, true)) {
            throw new RuntimeException(
                'O tipo do arquivo enviado não é permitido.'
            );
        }

        if ($isImage) {
            $imageInfo = getimagesize($upload['tmp_name']);

            if (
                $imageInfo === false ||
                strtolower($imageInfo['mime'] ?? '') !== $mimeType
            ) {
                throw new RuntimeException(
                    'O conteúdo enviado não é uma imagem válida.'
                );
            }
        }

        $directory = rtrim($this->destinationDirectory, '/\\');

        if ($directory === '') {
            $directory = DIRECTORY_SEPARATOR;
        }

        if (
            !is_dir($directory) &&
            !mkdir($directory, 0750, true) &&
            !is_dir($directory)
        ) {
            throw new RuntimeException(
                'Não foi possível criar a pasta de destino do upload.'
            );
        }

        if (!is_writable($directory)) {
            throw new RuntimeException(
                'A pasta de destino do upload não permite gravação.'
            );
        }

        $extension = self::MIME_EXTENSIONS[$mimeType] ?? 'bin';

        $filename = bin2hex(random_bytes(16)) . '.' . $extension;

        $destination = $directory . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($upload['tmp_name'], $destination)) {
            throw new RuntimeException(
                'Não foi possível salvar o arquivo enviado.'
            );
        }

        return $filename;
    }

    private function uploadErrorMessage(int $error): string
    {
        switch ($error) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'O arquivo excede o limite de tamanho configurado no servidor.';

            case UPLOAD_ERR_PARTIAL:
                return 'O arquivo foi recebido parcialmente.';

            case UPLOAD_ERR_NO_FILE:
                return 'Nenhum arquivo foi enviado.';

            case UPLOAD_ERR_NO_TMP_DIR:
                return 'A pasta temporária de uploads não está disponível no servidor.';

            case UPLOAD_ERR_CANT_WRITE:
                return 'O servidor não conseguiu gravar o arquivo temporário.';

            case UPLOAD_ERR_EXTENSION:
                return 'Uma extensão do PHP impediu o envio do arquivo.';

            default:
                return 'Ocorreu um erro ao receber o arquivo enviado.';
        }
    }
}
