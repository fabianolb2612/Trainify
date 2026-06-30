# TrainiFy API

API REST desenvolvida em PHP utilizando CoffeeCode Router e autenticação JWT para gerenciamento de personal trainers, alunos, treinos e exercícios personalizados do sistema TrainiFy.

---

# Tecnologias Utilizadas

- PHP 8
- MySQL
- CoffeeCode Router
- JWT Authentication
- Git/GitHub
- Apache (WAMP)

---

# URL Base

```http
http://localhost/trainify/api
```

---

# Autenticação

As rotas protegidas utilizam JWT.

Após realizar login, copie o token retornado e envie nas próximas requisições utilizando o header:

```http
Authorization: Bearer TOKEN_JWT
```

---

# Usuários

## Registrar usuário

```http
POST /users/register
```

### Body

```json
{
  "name": "João Dorea",
  "email": "joao@trainify.com.br",
  "password": "12345678",
  "cref": "012345-G/RS",
  "phone": "(51) 99999-9999",
  "city": "Porto Alegre",
  "bio": "Personal trainer especializado em hipertrofia",
  "specialty": "Hipertrofia"
}
```

### Resposta 201

```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Usuário cadastrado com sucesso"
}
```

---

## Login de usuário

```http
POST /users/login
```

### Body

```json
{
  "email": "joao@trainify.com.br",
  "password": "12345678"
}
```

### Resposta 200

```json
{
  "id": 2,
  "type_id": 2,
  "name": "João Dorea",
  "email": "joao@trainify.com.br",
  "token": "TOKEN_JWT"
}
```

---

## Login de administrador

```http
POST /users/login-admin
```

### Body

```json
{
  "email": "admin@trainify.com.br",
  "password": "12345678"
}
```

---

## Atualizar usuário

```http
PUT /users/update
```

### Autenticação

Obrigatório token JWT de usuário treinador.

### Body

```json
{
  "name": "João Atualizado",
  "email": "joao@trainify.com.br",
  "photo": null,
  "cref": "012345-G/RS",
  "phone": "(51) 99999-9999",
  "city": "Porto Alegre",
  "bio": "Novo texto",
  "specialty": "Hipertrofia"
}
```

---

## Atualizar administrador

```http
PUT /users/update-admin
```

### Autenticação

Obrigatório token JWT de administrador.

---

## Listar usuários

```http
GET /users/list
```

### Autenticação

Obrigatório token JWT de administrador.

---

## Buscar usuário por ID

```http
GET /users/list/{user_id}
```

### Exemplo

```http
GET /users/list/2
```

---

## Listar usuários com paginação

```http
GET /users/list/paginator/{page}/{per_page}
```

### Exemplo

```http
GET /users/list/paginator/1/10
```

---

# Alunos

## Cadastrar aluno

```http
POST /students
```

### Autenticação

Obrigatório token JWT de usuário treinador.

### Body

```json
{
  "training_level_id": 1,
  "goal_id": 1,
  "name": "Lucas Almeida",
  "email": "lucas@email.com",
  "phone": "(51) 99999-1234",
  "birthdate": "2002-08-15",
  "gym": "SmartFit",
  "notes": "Aluno iniciante"
}
```

---

## Listar alunos

```http
GET /students/list
```

---

## Buscar aluno por ID

```http
GET /students/list/{student_id}
```

---

## Atualizar aluno

```http
PUT /students/{student_id}
```

---

## Excluir aluno

```http
DELETE /students/{student_id}
```

---

## Listar alunos com paginação

```http
GET /students/list/paginator/{page}/{per_page}
```

### Exemplo

```http
GET /students/list/paginator/1/10
```

---

# Treinos

## Cadastrar treino

```http
POST /workouts
```

### Autenticação

Obrigatório token JWT de usuário treinador.

### Body

```json
{
  "student_id": 1,
  "goal_id": 1,
  "training_level_id": 2,
  "name": "Treino A - Hipertrofia",
  "description": "Treino focado em hipertrofia",
  "frequency": "5x por semana"
}
```

---

## Listar treinos

```http
GET /workouts/list
```

---

## Buscar treino por ID

```http
GET /workouts/list/{workout_id}
```

---

## Atualizar treino

```http
PUT /workouts/{workout_id}
```

---

## Excluir treino

```http
DELETE /workouts/{workout_id}
```

---

## Listar treinos com paginação

```http
GET /workouts/list/paginator/{page}/{per_page}
```

---

# Dias de Treino

Os dias de treino permitem dividir um treino em sessões específicas, como Dia A, Dia B e Dia C.

## Cadastrar dia de treino

```http
POST /workout-days
```

### Body

```json
{
  "workout_id": 1,
  "name": "Dia A - Peito e Tríceps",
  "display_order": 1
}
```

---

## Listar dias de um treino

```http
GET /workout-days/list/{workout_id}
```

---

## Buscar dia de treino por ID

```http
GET /workout-days/{workout_day_id}
```

---

## Atualizar dia de treino

```http
PUT /workout-days/{workout_day_id}
```

---

## Excluir dia de treino

```http
DELETE /workout-days/{workout_day_id}
```

---

## Listar dias de treino com paginação

```http
GET /workout-days/list/{workout_id}/paginator/{page}/{per_page}
```

### Exemplo

```http
GET /workout-days/list/1/paginator/1/10
```

---

# Exercícios

Cadastro dos exercícios disponíveis no sistema.

## Cadastrar exercício

```http
POST /exercises
```

### Body

```json
{
  "category_id": 1,
  "name": "Supino Reto",
  "description": "Exercício para peitoral"
}
```

---

## Listar exercícios

```http
GET /exercises/list
```

---

## Buscar exercício por ID

```http
GET /exercises/list/{exercise_id}
```

---

## Atualizar exercício

```http
PUT /exercises/{exercise_id}
```

---

## Excluir exercício

```http
DELETE /exercises/{exercise_id}
```

---

## Listar exercícios com paginação

```http
GET /exercises/list/paginator/{page}/{per_page}
```

---

# Exercícios dos Dias de Treino

Responsável por relacionar exercícios aos dias de treino.

## Adicionar exercício ao dia de treino

```http
POST /workout-day-exercises
```

### Body

```json
{
  "workout_day_id": 1,
  "exercise_id": 1,
  "sets": 4,
  "reps": "10-12",
  "rest_seconds": 60,
  "display_order": 1,
  "notes": "Executar próximo da falha."
}
```

---

## Listar exercícios do dia

```http
GET /workout-day-exercises/list/{workout_day_id}
```

---

## Buscar exercício do treino por ID

```http
GET /workout-day-exercises/{workout_day_exercise_id}
```

---

## Atualizar exercício do treino

```http
PUT /workout-day-exercises/{workout_day_exercise_id}
```

---

## Excluir exercício do treino

```http
DELETE /workout-day-exercises/{workout_day_exercise_id}
```

---

## Listar exercícios do treino com paginação

```http
GET /workout-day-exercises/list/{workout_day_id}/paginator/{page}/{per_page}
```

---

# Metas (Planejado)

## Listar metas

```http
GET /goals/list
```

---

## Buscar meta por ID

```http
GET /goals/list/{goal_id}
```

---

## Cadastrar meta

```http
POST /goals
```

---

## Atualizar meta

```http
PUT /goals/{goal_id}
```

---

## Excluir meta

```http
DELETE /goals/{goal_id}
```

---

# Níveis de Treinamento (Planejado)

## Listar níveis

```http
GET /training-levels/list
```

---

## Buscar nível por ID

```http
GET /training-levels/list/{training_level_id}
```

---

## Cadastrar nível

```http
POST /training-levels
```

---

## Atualizar nível

```http
PUT /training-levels/{training_level_id}
```

---

## Excluir nível

```http
DELETE /training-levels/{training_level_id}
```

---

# Categorias de Exercícios (Planejado)

## Listar categorias

```http
GET /exercise-categories/list
```

---

## Buscar categoria por ID

```http
GET /exercise-categories/list/{category_id}
```

---

## Cadastrar categoria

```http
POST /exercise-categories
```

---

## Atualizar categoria

```http
PUT /exercise-categories/{category_id}
```

---

## Excluir categoria

```http
DELETE /exercise-categories/{category_id}
```

---

# Dashboard (Planejado)

## Resumo do Dashboard

```http
GET /dashboard/summary
```

### Resposta

```json
{
  "total_students": 25,
  "active_students": 20,
  "total_workouts": 18,
  "total_exercises": 150
}
```

---

# Exportação PDF (Planejado)

## Exportar treino

```http
GET /workouts/{workout_id}/export-pdf
```

Retorna um arquivo PDF contendo todas as informações do treino selecionado.

---

# Paginação

As entidades paginadas seguem o padrão:

```http
GET /resource/list/paginator/{page}/{per_page}
```

Exemplo:

```http
GET /students/list/paginator/1/10
```

Onde:

- `page` = página atual.
- `per_page` = quantidade de registros por página.

---

# Estrutura da API

```text
api/
├── users
├── students
├── workouts
├── workout-days
├── exercises
├── workout-day-exercises
├── goals
├── training-levels
├── exercise-categories
├── dashboard
```

---

# Códigos HTTP

| Código | Significado |
| ------ | ----------- |
| 200 | Requisição realizada com sucesso |
| 201 | Registro criado com sucesso |
| 400 | Dados inválidos ou campos obrigatórios ausentes |
| 401 | Usuário não autenticado ou token inválido |
| 403 | Usuário sem permissão para acessar o recurso |
| 404 | Registro não encontrado |
| 500 | Erro interno ao processar a requisição |

---

# Versionamento

O código-fonte da API está versionado com Git e disponível no GitHub.

