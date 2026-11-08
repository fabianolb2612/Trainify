# TrainiFy — Documentação da API e Galeria de Imagens (Etapa 07)

Documentação oficial da **Etapa 07** do projeto **TrainiFy**, cobrindo o envio, armazenamento, listagem e remoção de fotos de perfil do utilizador e da galeria de evolução corporal dos alunos (relação 1:N).

---

## 1. Visão Geral e Arquitetura

O módulo de imagens é composto por duas frentes principais:
* **Foto de Perfil do Treinador (1:1):** Permite ao utilizador autenticado gerir a sua imagem de perfil.
* **Galeria de Evolução do Aluno (1:N):** Permite registar múltiplas fotos de acompanhamento físico para um único aluno especificado por `student_id`.

### Premissas Tecnológicas
* **Uploads:** Processados via `multipart/form-data`.
* **Backend:** PHP nativo, persistência via PDO (`prepared statements`) e gravação de ficheiros físicos através da classe `Source\Support\Upload`.
* **Frontend:** JavaScript ES Modules orientado a objetos, integrando o `HttpClientBase` para consumo da API REST.

---

## 2. Estrutura do Banco de Dados

### Tabela `student_images` (Galeria de Evolução 1:N)

```sql
USE `trainify_db`;

CREATE TABLE IF NOT EXISTS `student_images` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `student_id` INT NOT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `alt_text` VARCHAR(255) DEFAULT NULL,
    `position` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_student_images_student_id` (`student_id`),
    CONSTRAINT `fk_student_images_students`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Contratos da API (Endpoints)

Todas as requisições exigem autenticação via Bearer Token.

### Cabeçalhos Padrão (Headers)
| Header | Valor | Obrigatório |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <TOKEN_JWT>` | Sim |
| `Accept` | `application/json` | Sim |

---

### Parte A — Foto do Utilizador Autenticado

#### `POST /users/photo`
Atualiza a foto de perfil do utilizador autenticado.

* **Nível de Acesso:** Utilizador Autenticado (Nível 2+)
* **Formato:** `multipart/form-data`
* **Corpo da Requisição (Form Data):**
  * `photo`: Ficheiro de imagem (JPEG, PNG, WEBP — máx. 5MB)

##### Resposta de Sucesso (`200 OK`):
```json
{
    "code": 200,
    "type": "success",
    "message": "Foto de perfil atualizada com sucesso.",
    "data": {
        "photo": "uploads/images/2026/11/hash-name.jpg"
    }
}
```

---

### Parte B — Galeria de Evolução do Aluno (1:N)

#### 1. Listar Imagens do Aluno
`GET /students/{student_id}/images`

* **Nível de Acesso:** Personal Trainer dono do aluno ou Admin.
* **Parâmetros de URL:** `student_id` (Integer)

##### Resposta de Sucesso (`200 OK`):
```json
{
    "code": 200,
    "type": "success",
    "message": "Galeria de imagens do aluno",
    "data": [
        {
            "id": 12,
            "student_id": 4,
            "image_path": "uploads/gallery/66ab123456789.jpg",
            "alt_text": "foto_costas_novembro.jpg",
            "position": 0,
            "created_at": "2026-11-08 14:30:00"
        }
    ]
}
```

---

#### 2. Adicionar Foto(s) à Galeria
`POST /students/{student_id}/images`

* **Nível de Acesso:** Personal Trainer dono do aluno ou Admin.
* **Formato:** `multipart/form-data`
* **Parâmetros de URL:** `student_id` (Integer)
* **Corpo da Requisição (Form Data):**
  * `images[]` (ou `image`): Um ou múltiplos ficheiros de imagem.

##### Resposta de Sucesso (`201 Created`):
```json
{
    "code": 201,
    "type": "created",
    "message": "Imagens adicionadas à galeria do aluno com sucesso.",
    "data": [
        {
            "id": 12,
            "student_id": 4,
            "image_path": "uploads/gallery/66ab123456789.jpg",
            "alt_text": "foto_costas_novembro.jpg"
        }
    ]
}
```

---

#### 3. Remover Foto da Galeria
`DELETE /students/{student_id}/images/{image_id}`

* **Nível de Acesso:** Personal Trainer dono do aluno ou Admin.
* **Parâmetros de URL:** 
  * `student_id` (Integer)
  * `image_id` (Integer)

##### Resposta de Sucesso (`200 OK`):
```json
{
    "code": 200,
    "type": "success",
    "message": "Imagem removida da galeria do aluno com sucesso.",
    "data": null
}
```

---

## 4. Códigos de Erro da API

| Código | Mensagem de Exemplo | Causa |
| :--- | :--- | :--- |
| `400 Bad Request` | `"Nenhuma imagem foi enviada."` | Ficheiro ausente, formato inválido ou tamanho excedido. |
| `401 Unauthorized` | `"Usuário não está autenticado ou token inválido."` | Token ausente ou expirado. |
| `403 Forbidden` | `"Você não tem permissão para alterar a galeria deste aluno."` | Tentativa de alterar aluno pertencente a outro treinador. |
| `404 Not Found` | `"Aluno não encontrado."` ou `"Imagem não encontrada."` | ID inexistente na base de dados. |
| `500 Internal Error` | `"Não foi possível registrar a imagem no banco."` | Falha de persistência (com rollback automático do ficheiro). |

---

## 5. Regras de Negócio e Segurança

1. **Rollback de Ficheiro (Atomacidade):** Se o upload do ficheiro físico for concluído, mas a gravação no MySQL falhar, o servidor elimina automaticamente o ficheiro recém-criado no disco para evitar ficheiros órfãos.
2. **Exclusão em Cascata:**
   * Na eliminação de uma foto individual (`DELETE`), o registo é removido da base de dados e o ficheiro físico é desvinculado (`unlink`) do disco.
   * Na remoção de um aluno, a Foreign Key `ON DELETE CASCADE` elimina os registos em `student_images`.
3. **Validação Estrita:** O backend valida a extensão real da imagem através de MIME Type (não confiando apenas na extensão enviada pelo navegador).
4. **Isolamento de Escopo:** Treinadores só conseguem visualizar, enviar ou remover fotos de alunos sob a sua própria responsabilidade.