<?php

namespace Source\Controller;

use Source\Core\Connect;
use PDO;

class Admin extends Api
{
    public function stats(): void
    {
        if (!$this->authToken(1)) {
            $this->call(
                401,
                "unauthorized",
                "Administrador não autenticado ou token inválido.",
                "error"
            )->back(null);
            return;
        }

        $pdo = Connect::getInstance();

        $totalUsers = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE type_id = 2")->fetchColumn();
        $totalStudents = (int) $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
        $totalWorkouts = (int) $pdo->query("SELECT COUNT(*) FROM workouts")->fetchColumn();

        $stmtRecent = $pdo->query("
            SELECT id, name, email, active
            FROM users
            WHERE type_id = 2
            ORDER BY id DESC
            LIMIT 5
        ");
        $recentUsers = $stmtRecent->fetchAll(PDO::FETCH_ASSOC);

        $this->call(
            200,
            "success",
            "Estatísticas administrativas",
            "success"
        )->back([
            "totalUsers" => $totalUsers,
            "totalStudents" => $totalStudents,
            "totalWorkouts" => $totalWorkouts,
            "recentUsers" => $recentUsers
        ]);
    }
}