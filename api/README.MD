# TrainiFy API

API REST desenvolvida em PHP para gerenciamento de usuários, alunos e treinos do sistema TrainiFy.

## URL Base

```http
http://localhost/trainify/api
```

## Autenticação

As rotas protegidas utilizam JWT. Após realizar login, copie o token retornado e envie nas próximas requisições pelo header:

```http
Authorization: Bearer SEU_TOKEN_AQUI
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
  "name": "Fabiano Braga",
  "email": "fabiano@trainify.com.br",
  "password": "12345678",
  "cref": "012345-G/RS",
  "phone": "(51) 99999-9999",
  "city": "Charqeuadas",
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
  "message": "Usuário cadastrado com sucesso",
  "data": {
    "id": 4,
    "name": "Fabiano Braga",
    "email": "fabiano@trainify.com.br"
  }
}
```

### Resposta 400

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Nome, e-mail e senha são obrigatórios. O e-mail deve ser válido.",
  "data": null
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
  "email": "fabiano@trainify.com.br",
  "password": "12345678"
}
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Usuário logado com sucesso",
  "data": {
    "id": 2,
    "type_id": 2,
    "name": "Fabiano Braga",
    "email": "fabiano@trainify.com.br",
    "token": "TOKEN_JWT"
  }
}
```

### Resposta 401

```json
{
  "code": 401,
  "type": "error",
  "status": "unauthorized",
  "message": "Usuário não encontrado ou inativo",
  "data": null
}
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
  "goal_id": 5,
  "name": "Alex Possamai",
  "email": "alex@email.com",
  "phone": "(51) 99999-1234",
  "birthdate": "2002-08-15",
  "gym": "fitness academy",
  "notes": "Aluno iniciante"
}
```

### Resposta 201

```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Aluno cadastrado com sucesso",
  "data": {
    "id": 9,
    "user_id": 2,
    "training_level_id": 1,
    "goal_id": 5,
    "name": "Alex Possamai"
  }
}
```

---

## Listar alunos

```http
GET /students/list
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de alunos",
  "data": []
}
```

---

## Buscar aluno por ID

```http
GET /students/list/{student_id}
```

### Exemplo

```http
GET /students/list/1
```

---

## Atualizar aluno

```http
PUT /students/{student_id}
```

### Body

```json
{
  "training_level_id": 2,
  "goal_id": 1,
  "name": "Alex Atualizado",
  "email": "alex@email.com",
  "phone": "(51) 98888-7777",
  "birthdate": "2002-08-15",
  "gym": "fitness",
  "notes": "Aluno atualizado"
}
```

---

## Excluir aluno

```http
DELETE /students/{student_id}
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Aluno excluído com sucesso",
  "data": null
}
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
  "description": "Foco em volume e intensidade moderada.",
  "frequency": "4x por semana"
}
```

### Resposta 201

```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Treino cadastrado com sucesso",
  "data": {
    "id": 4,
    "name": "Treino A - Hipertrofia",
    "student_name": "Alex Possamai",
    "goal_name": "Hipertrofia",
    "training_level": "Intermediário"
  }
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

### Exemplo

```http
GET /workouts/list/1
```

---

## Atualizar treino

```http
PUT /workouts/{workout_id}
```

### Body

```json
{
  "student_id": 1,
  "goal_id": 1,
  "training_level_id": 2,
  "name": "Treino A - Atualizado",
  "description": "Treino atualizado com foco em progressão de carga.",
  "frequency": "5x por semana"
}
```

---

## Excluir treino

```http
DELETE /workouts/{workout_id}
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Treino excluído com sucesso",
  "data": null
}
```
# Dias de Treino

Os dias de treino permitem dividir um treino em sessões específicas, como Dia A, Dia B e Dia C.

## Cadastrar dia de treino

```http
POST /workout-days
```

### Autenticação

Obrigatório token JWT de usuário treinador.

### Body

```json
{
  "workout_id": 1,
  "name": "Dia A - Peito e Tríceps",
  "description": "Treino focado em movimentos de empurrar."
}
```

### Resposta 201

```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Dia de treino cadastrado com sucesso",
  "data": {
    "id": 1,
    "workout_id": 1,
    "name": "Dia A - Peito e Tríceps"
  }
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

### Body

```json
{
  "name": "Dia A - Peito, Ombro e Tríceps",
  "description": "Treino atualizado."
}
```

---

## Excluir dia de treino

```http
DELETE /workout-days/{workout_day_id}
```

---

# Exercícios

Cadastro dos exercícios disponíveis no sistema.

## Cadastrar exercício

```http
POST /exercises
```

### Autenticação

Obrigatório token JWT de usuário treinador.

### Body

```json
{
  "category_id": 1,
  "name": "Supino Reto",
  "description": "Exercício para peitoral realizado com barra."
}
```

### Resposta 201

```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Exercício cadastrado com sucesso",
  "data": {
    "id": 1,
    "name": "Supino Reto"
  }
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

### Body

```json
{
  "category_id": 1,
  "name": "Supino Inclinado",
  "description": "Exercício atualizado."
}
```

---

## Excluir exercício

```http
DELETE /exercises/{exercise_id}
```

---

# Exercícios dos Dias de Treino

Responsável por relacionar exercícios aos dias de treino.

## Adicionar exercício ao dia de treino

```http
POST /workout-day-exercises
```

### Autenticação

Obrigatório token JWT de usuário treinador.

### Body

```json
{
  "workout_day_id": 1,
  "exercise_id": 1,
  "sets": 4,
  "reps": "10-12",
  "rest_seconds": 60,
  "display_order": 1,
  "notes": "Executar até próximo da falha."
}
```

### Resposta 201

```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Exercício adicionado ao treino com sucesso",
  "data": {
    "id": 1,
    "exercise_id": 1,
    "sets": 4,
    "reps": "10-12"
  }
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

# Metas

Metas utilizadas para definir o objetivo principal dos alunos.

## Listar metas

```http
GET /goals/list
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de metas",
  "data": [
    {
      "id": 1,
      "name": "Hipertrofia"
    },
    {
      "id": 2,
      "name": "Emagrecimento"
    }
  ]
}
```

---

## Buscar meta por ID

```http
GET /goals/list/{goal_id}
```

---

# Níveis de Treinamento

Níveis utilizados para classificar os alunos.

## Listar níveis de treinamento

```http
GET /training-levels/list
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de níveis",
  "data": [
    {
      "id": 1,
      "name": "Iniciante"
    },
    {
      "id": 2,
      "name": "Intermediário"
    },
    {
      "id": 3,
      "name": "Avançado"
    }
  ]
}
```

---

## Buscar nível por ID

```http
GET /training-levels/list/{training_level_id}
```

---

# Dashboard

Resumo geral dos dados do treinador autenticado.

## Resumo do Dashboard

```http
GET /dashboard/summary
```

### Resposta 200

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Resumo do dashboard",
  "data": {
    "total_students": 12,
    "active_students": 10,
    "total_workouts": 8,
    "active_workouts": 8
  }
}
```

---

# Exportação PDF

Funcionalidade para geração de fichas de treino em PDF.

## Exportar treino em PDF

```http
GET /workouts/{workout_id}/export-pdf
```

### Resposta 200

Retorna um arquivo PDF contendo todas as informações do treino selecionado.

---

# Códigos HTTP

| Código | Significado                                     |
| ------ | ----------------------------------------------- |
| 200    | Requisição realizada com sucesso                |
| 201    | Registro criado com sucesso                     |
| 400    | Dados inválidos ou campos obrigatórios ausentes |
| 401    | Usuário não autenticado ou token inválido       |
| 404    | Registro não encontrado                         |
| 500    | Erro interno ao processar a requisição          |

---
