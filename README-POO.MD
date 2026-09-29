# TrainiFy — Etapa 06: JavaScript POO

## 1. Sobre a etapa

Nesta etapa, o frontend do **TrainiFy** foi refatorado utilizando conceitos de **Programação Orientada a Objetos em JavaScript**, mantendo as funcionalidades existentes.

A implementação foi dividida em:

- **Parte A:** classes, encapsulamento, herança, composição e services;
- **Parte B:** programação prototipal com `Object.create()`.

---

# 2. Estrutura

```text
views/assets/
├── _common/
│   ├── classes/
│   │   ├── HttpClientBase.js
│   │   ├── Student.js
│   │   ├── Workout.js
│   │   ├── WorkoutDay.js
│   │   ├── WorkoutDayExercise.js
│   │   └── Exercise.js
│   │
│   ├── services/
│   │   ├── StudentService.js
│   │   ├── WorkoutService.js
│   │   ├── WorkoutDayService.js
│   │   ├── WorkoutDayExerciseService.js
│   │   └── ExerciseService.js
│   │
│   └── prototypes/
│       ├── FormController.js
│       ├── Toast.js
│       └── test-prototypes.js
│
└── app/
    ├── student.js
    ├── student-workouts.js
    ├── student-workout-days.js
    └── student-workout-exercises.js
```

---

# 3. Parte A — Classes e Services

## Entidades

Foram criadas classes para as principais entidades utilizadas pelo frontend:

- `Student`
- `Workout`
- `WorkoutDay`
- `WorkoutDayExercise`
- `Exercise`

As classes possuem:

- construtor;
- propriedades privadas quando necessário;
- getters e setters;
- validações simples;
- `fromJSON()` para transformar dados da API em objetos;
- `toPayload()` para preparar dados enviados à API.

Exemplo:

```js
const workout = new Workout({
    studentId: 1,
    name: "Treino A",
    description: "Hipertrofia"
});
```

## Encapsulamento

As propriedades internas das entidades podem ser privadas, sendo acessadas através de getters e setters. Os setters permitem validar os valores antes de armazená-los.

## Services

Cada entidade possui um service responsável pela comunicação com a API:

```text
StudentService
WorkoutService
WorkoutDayService
WorkoutDayExerciseService
ExerciseService
```

Os services disponibilizam operações como:

```text
list()
find()
create()
update()
remove()
```

As telas utilizam os services em vez de realizar `fetch()` diretamente.

## Herança

Os services herdam de `HttpClientBase`:

```text
HttpClientBase
├── StudentService
├── WorkoutService
├── WorkoutDayService
├── WorkoutDayExerciseService
└── ExerciseService
```

`HttpClientBase` centraliza as requisições `GET`, `POST`, `PUT` e `DELETE`, além de headers e autenticação.

## Composição

As telas utilizam diferentes objetos e services em conjunto. Por exemplo:

```text
StudentWorkouts
├── WorkoutService
├── WorkoutDayService
└── StudentWorkoutDays
```

Isso mantém cada responsabilidade separada.

---

# 4. CRUD e integração com a API

Os CRUDs foram integrados às rotas reais do backend.

### Alunos

```text
Listar → Cadastrar → Editar → Remover
```

### Treinos

```text
Listar → Cadastrar → Editar → Remover
```

### Dias de treino

São gerenciados dentro dos treinos através de `WorkoutDayService`.

Os scripts das telas controlam a interface, enquanto os services realizam a comunicação com a API.

---

# 5. Parte B — Programação Prototipal

Foram implementadas duas funcionalidades reutilizáveis utilizando `Object.create()`:

```text
FormController
Toast
```

Nenhuma delas utiliza `class`.

## FormController

Arquivo:

```text
_common/prototypes/FormController.js
```

Responsável por operações comuns de formulários:

```js
serialize()
validateRequired()
clear()
```

Objetos são criados através de:

```js
const controller =
    createFormController();
```

Internamente:

```js
Object.create(FormControllerPrototype);
```

É utilizado em telas como:

```text
student.js
student-workouts.js
```

---

## Toast

Arquivo:

```text
_common/prototypes/Toast.js
```

Responsável pelas mensagens da interface:

```text
success → verde
warning → amarelo
error   → vermelho
```

Exemplo:

```js
toast.showSuccess(
    "Treino criado com sucesso!"
);
```

Também interpreta respostas da API através de `showResponse()`.

Status como:

```text
success
created
updated
deleted
```

são tratados como sucesso.

Respostas inesperadas não são ignoradas silenciosamente.

O Toast é utilizado em diferentes telas, incluindo:

```text
student.js
student-workouts.js
```

---

# 6. Demonstração dos protótipos

O arquivo:

```text
_common/prototypes/test-prototypes.js
```

demonstra que objetos diferentes podem compartilhar o mesmo protótipo.

Exemplo:

```js
const toastA = createToast();
const toastB = createToast();

console.log(
    Object.getPrototypeOf(toastA) ===
    Object.getPrototypeOf(toastB)
);
```

Resultado:

```text
true
```

O mesmo teste é realizado com `FormController`.

Isso demonstra o uso de programação prototipal através de `Object.create()`.

---

# 7. Estados da interface

As operações possuem feedback visual para:

- carregamento;
- sucesso;
- aviso;
- erro.

Exemplo:

```text
🟢 Treino criado com sucesso!
🟡 Informe o nome do treino.
🔴 Erro ao salvar treino.
```

---

# 8. Como executar

1. Iniciar Apache/PHP e MySQL.
2. Garantir que a API esteja funcionando.
3. Abrir o frontend pelo servidor local.
4. Realizar login.
5. Acessar a área de alunos.
6. Testar cadastro, edição e remoção de alunos e treinos.

---

# 9. Como testar

### Alunos

- cadastrar aluno;
- editar aluno;
- remover aluno;
- verificar mensagens de sucesso e erro.

### Treinos

- criar treino;
- editar treino;
- remover treino;
- tentar salvar sem nome para testar o warning.

### Protótipos

Abrir o Console do navegador com `F12` e verificar no `test-prototypes.js`:

```text
Toast compartilha protótipo: true
FormController compartilha protótipo: true
```

---

# 10. Conceitos utilizados

| Conceito | Aplicação |
|---|---|
| Encapsulamento | Propriedades privadas, getters e setters |
| Abstração | Classes representam as entidades |
| Herança | Services herdam de `HttpClientBase` |
| Composição | Classes utilizam services e outros objetos |
| POO com classes | Entidades e services |
| Programação prototipal | `Toast` e `FormController` |
| Reutilização | Services e protótipos compartilhados |

---

# 11. Resultado

A Etapa 06 organiza o frontend do TrainiFy separando:

```text
Classes
   ↓
Entidades

Services
   ↓
API

Scripts
   ↓
Telas

Protótipos
   ↓
Funcionalidades reutilizáveis
```

Com isso, o projeto mantém as funcionalidades anteriores e passa a utilizar uma estrutura mais organizada, reutilizável e alinhada aos conceitos de POO e programação prototipal.