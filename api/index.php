<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
// timezone para São Paulo América
date_default_timezone_set('America/Sao_Paulo');

ob_start();

require  __DIR__ . "/vendor/autoload.php";

// os headers abaixo são necessários para permitir o acesso a API por clientes externos ao domínio
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true'); // Permitir credenciais

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;
// localhost/acme-3am/api
$route = new Router(url("api"),":");

$route->namespace("Source\Controller");

$route->group("/users");
$route->post("/register","Users:register"); // Registrar usuário comum
$route->post("/login","Users:auth");
//http://localhost/trabalho/api/users/login
$route->put("/update","Users:update"); 
$route->get("/list/paginator/{page}/{per_page}", "Users:listPaginator");
$route->get("/list/{user_id}", "Users:listById");
$route->get("/list", "Users:listAll");
$route->post("/login-admin","Users:authAdmin"); 
$route->put("/update-admin","Users:updateAdmin"); 
$route->group(null);

$route->group("/students");

$route->post("/","Students:insert");
//http://localhost/trabalho/api/students
$route->put("/{student_id}","Students:update");
//http://localhost/trabalho/api/students/9
$route->get("/list","Students:listAll");
//http://localhost/trabalho/api/students/list
$route->get("/list/paginator/{page}/{per_page}", "Students:listPaginator");
$route->delete("/{student_id}","Students:delete");
// http://localhost/trabalho/api/students/9

$route->get("/list/{student_id}","Students:listById");
$route->group(null);

$route->group("/workouts");
$route->post("/","Workouts:insert");
// http://localhost/trabalho/api/workouts
$route->get("/list","Workouts:listAll");
// http://localhost/trabalho/api/workouts/list
$route->get("/list/{workout_id}","Workouts:listById");
// http://localhost/trabalho/api/workouts/list/1
$route->get("/list/paginator/{page}/{per_page}", "Workouts:listPaginator");
$route->put("/{workout_id}","Workouts:update");
// http://localhost/trabalho/api/workouts/1
$route->delete("/{workout_id}","Workouts:delete");
//http://localhost/trabalho/api/workouts/1
$route->group(null);

$route->group("/workout-days");
$route->post("/", "WorkoutDays:insert");
$route->get("/list/{workout_id}", "WorkoutDays:listByWorkout");
//http://localhost/trabalho/api/workout-days/list/1
$route->get("/{workout_day_id}", "WorkoutDays:listById");
//http://localhost/trabalho/api/workout-days/1
$route->get("/list/{workout_id}/paginator/{page}/{per_page}", "WorkoutDays:listPaginator");
$route->put("/{workout_day_id}", "WorkoutDays:update");
$route->delete("/{workout_day_id}", "WorkoutDays:delete");
$route->group(null);


$route->group("/exercises");

$route->post("/", "Exercises:insert");
$route->get("/list", "Exercises:listAll");
$route->get("/list/{exercise_id}", "Exercises:listById");
$route->get("/list/paginator/{page}/{per_page}", "Exercises:listPaginator");
$route->put("/{exercise_id}", "Exercises:update");
$route->delete("/{exercise_id}", "Exercises:delete");

$route->group(null);

// FAQs
$route->group("/faqs");

$route->group(null);

$route->group("/faqs-categories");

$route->group(null);



$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    //http_response_code(404);

    echo json_encode([
        "code" => 404,
        "status" => "not_found",
        "message" => "URL não encontrada"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

}

ob_end_flush();