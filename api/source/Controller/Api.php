<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Core\JWTToken;

class Api
{
    protected $userAuthId = null;
    protected array $response = [];

    public function authToken(int $typeId): bool
    {
        $authHeader = $_SERVER["HTTP_AUTHORIZATION"] 
                   ?? $_SERVER["REDIRECT_HTTP_AUTHORIZATION"] 
                   ?? null;

        if (!$authHeader) {
            $headers = getallheaders();
            $headers = array_change_key_case($headers, CASE_LOWER);
            $authHeader = $headers["authorization"] ?? $headers["token"] ?? null;
        }

        if (!$authHeader) {
            return false;
        }

        $token = trim($authHeader);

        if (str_starts_with($token, "Bearer ")) {
            $token = substr($token, 7);
        }

        $token = trim($token);

        $jwt = new JWTToken();
        $jwtToken = $jwt->decode($token);

        if (!$jwtToken) {
            return false;
        }

        $user = new User();

        if (!$user->permissionVerify($jwtToken->data->email, $typeId)) {
            return false;
        }

        $this->userAuthId = $jwtToken->data->id;

        return true;
    }

    protected function call(int $code, ?string $status = null, ?string $message = null, ?string $type = null): Api
    {
        http_response_code($code);
        if (!empty($status)) {
            $this->response = [
                "code" => $code,
                "type" => $type,
                "status" => $status,
                "message" => (!empty($message) ? $message : null)
            ];
        }
        return $this;
    }

    protected function back(object|array|null $data = null): Api
    {
        header("Content-Type: application/json");

        $this->response["data"] = $data;

        echo json_encode(
            $this->response,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        return $this;
    }
}