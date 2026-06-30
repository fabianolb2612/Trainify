CREATE DATABASE IF NOT EXISTS `trainify_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `trainify_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `faqs`;
DROP TABLE IF EXISTS `faqs_categories`;
DROP TABLE IF EXISTS `workout_day_exercises`;
DROP TABLE IF EXISTS `exercises`;
DROP TABLE IF EXISTS `exercise_categories`;
DROP TABLE IF EXISTS `workout_days`;
DROP TABLE IF EXISTS `workouts`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `goals`;
DROP TABLE IF EXISTS `training_levels`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `users_types`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_types_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users_types` (`id`, `name`) VALUES
  (1, 'ADMIN'),
  (2, 'TRAINER');


CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `photo` VARCHAR(255) NULL DEFAULT NULL,
  `cref` VARCHAR(30) NULL DEFAULT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `bio` TEXT NULL DEFAULT NULL,
  `specialty` VARCHAR(255) NULL DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `fk_users_users_types_idx` (`type_id`),
  CONSTRAINT `fk_users_users_types`
    FOREIGN KEY (`type_id`) REFERENCES `users_types` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users`
  (`id`, `type_id`, `name`, `email`, `password`, `photo`, `cref`, `phone`, `city`, `bio`, `specialty`, `active`)
VALUES
  (1, 1, 'Admin TrainiFy', 'admin@trainify.com.br',
   '$2y$10$4SAEgSOLVK8SBT9VP4T4lObFmZBPv48WLLMDb/Wsh5MC63zd6GBOO',
   NULL, NULL, '(51) 99000-0000', 'Porto Alegre, RS', NULL, NULL, 1),

  (2, 2, 'João Dorea', 'joao@trainify.com.br',
   '$2y$10$4SAEgSOLVK8SBT9VP4T4lObFmZBPv48WLLMDb/Wsh5MC63zd6GBOO',
   NULL, '012345-G/RS', '(51) 99111-2233', 'Porto Alegre, RS',
   'Personal trainer com 8 anos de experiência em hipertrofia e treinamento funcional.',
   'Hipertrofia, Funcional', 1),

  (3, 2, 'Maria Oliveira', 'maria@trainify.com.br',
   '$2y$10$4SAEgSOLVK8SBT9VP4T4lObFmZBPv48WLLMDb/Wsh5MC63zd6GBOO',
   NULL, '054321-G/RS', '(51) 99222-4455', 'Canoas, RS',
   'Especialista em emagrecimento e condicionamento físico.',
   'Emagrecimento, Condicionamento', 1);

CREATE TABLE `training_levels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_training_levels_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `training_levels` (`id`, `name`) VALUES
  (1, 'Iniciante'),
  (2, 'Intermediário'),
  (3, 'Avançado');

CREATE TABLE `goals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_goals_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `goals` (`id`, `name`) VALUES
  (1, 'Hipertrofia'),
  (2, 'Emagrecimento'),
  (3, 'Definição muscular'),
  (4, 'Condicionamento físico'),
  (5, 'Ganho de massa'),
  (6, 'Força'),
  (7, 'Reabilitação');

CREATE TABLE `students` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `training_level_id` INT NOT NULL,
  `goal_id` INT NULL DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `birthdate` DATE NULL DEFAULT NULL,
  `gym` VARCHAR(255) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_students_users_idx` (`user_id`),
  KEY `fk_students_training_levels_idx` (`training_level_id`),
  KEY `fk_students_goals_idx` (`goal_id`),
  CONSTRAINT `fk_students_users`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_students_training_levels`
    FOREIGN KEY (`training_level_id`) REFERENCES `training_levels` (`id`),
  CONSTRAINT `fk_students_goals`
    FOREIGN KEY (`goal_id`) REFERENCES `goals` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `students`
  (`id`, `user_id`, `training_level_id`, `goal_id`, `name`, `email`, `phone`, `birthdate`, `gym`, `notes`, `active`)
VALUES
  (1, 2, 2, 1, 'João Silva', 'joao.silva@email.com', '(51) 99111-0001', '1992-03-15',
   'SmartFit Centro',
   'Tendinite no joelho esquerdo — evitar agachamento profundo. Histórico de hérnia de disco L4-L5 em 2023, já recuperado.', 1),

  (2, 2, 3, 3, 'Maria Cardoso', 'maria.c@email.com', '(51) 99111-0002', '1989-07-22',
   'BioFit', 'Sem restrições. Prefere treinos à tarde.', 1),

  (3, 2, 1, 5, 'Pedro Tavares', 'pedro.t@email.com', '(51) 99111-0003', '2000-11-05',
   'BlueGym', 'Iniciou recentemente. Foco em técnica de execução nos primeiros meses.', 0),

  (4, 2, 2, 4, 'Ana Lima', 'ana.lima@email.com', '(51) 99111-0004', '1995-04-18',
   'FitClub', NULL, 1),

  (5, 2, 3, 1, 'Carlos Rocha', 'carlos.r@email.com', '(51) 99111-0005', '1987-09-30',
   'SmartFit Norte', 'Atleta de bodybuilding. Alta tolerância ao volume.', 1),

  (6, 2, 1, 2, 'Fernanda Souza', 'feh.souza@email.com', '(51) 99111-0006', '2001-02-14',
   'AcquaFit', 'Evitar exercícios de alto impacto — problema no tornozelo direito.', 1),

  (7, 2, 2, 6, 'Ricardo Melo', 'rico.melo@email.com', '(51) 99111-0007', '1993-06-08',
   'BlueGym', NULL, 0),

  (8, 2, 3, 1, 'Juliana Neves', 'ju.neves@email.com', '(51) 99111-0008', '1991-12-01',
   'BioFit', 'Experiência avançada em crossfit. Quer focar em hipertrofia isolada.', 1);

CREATE TABLE `workouts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `student_id` INT NULL DEFAULT NULL,
  `goal_id` INT NULL DEFAULT NULL,
  `training_level_id` INT NULL DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `frequency` VARCHAR(50) NULL DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_workouts_users_idx` (`user_id`),
  KEY `fk_workouts_students_idx` (`student_id`),
  KEY `fk_workouts_goals_idx` (`goal_id`),
  KEY `fk_workouts_training_levels_idx` (`training_level_id`),
  CONSTRAINT `fk_workouts_users`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_workouts_students`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_workouts_goals`
    FOREIGN KEY (`goal_id`) REFERENCES `goals` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_workouts_training_levels`
    FOREIGN KEY (`training_level_id`) REFERENCES `training_levels` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `workouts`
  (`id`, `user_id`, `student_id`, `goal_id`, `training_level_id`, `name`, `description`, `frequency`, `active`)
VALUES
  (1, 2, 1, 1, 2, 'Treino A — Hipertrofia João',
   'Foco em volume e intensidade moderada para ganho de massa muscular.', '4x por semana', 1),

  (2, 2, 2, 3, 3, 'Treino B — Definição Maria',
   'Circuito metabólico com cargas moderadas e pouco descanso.', '5x por semana', 1),

  (3, 2, NULL, 1, 1, 'Template — Iniciante Fullbody',
   'Treino fullbody para alunos iniciantes. Foco em técnica.', '3x por semana', 1);

CREATE TABLE `workout_days` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `workout_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_workout_days_workouts_idx` (`workout_id`),
  CONSTRAINT `fk_workout_days_workouts`
    FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
  

INSERT INTO `workout_days` (`id`, `workout_id`, `name`, `display_order`) VALUES
  (1, 1, 'Dia A — Peito, Tríceps e Ombro', 1),
  (2, 1, 'Dia B — Costas e Bíceps', 2),
  (3, 1, 'Dia C — Pernas', 3),
  (4, 2, 'Dia A — Superior', 1),
  (5, 2, 'Dia B — Inferior', 2),
  (6, 3, 'Dia Único — Fullbody', 1);

ALTER TABLE workout_days
ADD active TINYINT(1) NOT NULL DEFAULT 1;
CREATE TABLE `exercise_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_exercise_categories_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exercise_categories` (`id`, `name`) VALUES
  (1, 'Peito'),
  (2, 'Costas'),
  (3, 'Pernas'),
  (4, 'Ombros'),
  (5, 'Bíceps'),
  (6, 'Tríceps'),
  (7, 'Abdômen e Core'),
  (8, 'Cardio e Aeróbico');

CREATE TABLE `exercises` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_exercises_exercise_categories_idx` (`category_id`),
  CONSTRAINT `fk_exercises_exercise_categories`
    FOREIGN KEY (`category_id`) REFERENCES `exercise_categories` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exercises` (`id`, `category_id`, `name`, `description`) VALUES
  (1, 1, 'Supino Reto c/ Barra', 'Deite no banco, desça a barra até o peito e empurre.'),
  (2, 1, 'Crucifixo no Banco Inclinado', 'Abra os braços com halteres em arco controlado.'),
  (3, 1, 'Supino Inclinado c/ Halteres', 'Banco inclinado 30–45°, amplitude total.'),
  (4, 1, 'Crossover no Cabo', 'Puxada de cima para baixo cruzando os cabos.'),
  (5, 2, 'Puxada Frente c/ Barra', 'Puxe a barra à frente até a linha do queixo.'),
  (6, 2, 'Remada Curvada c/ Barra', 'Tronco inclinado aproximadamente 45°, puxe a barra até o abdômen.'),
  (7, 2, 'Remada Unilateral c/ Halter', 'Apoie joelho e mão no banco, puxe o halter com a outra mão.'),
  (8, 2, 'Levantamento Terra', 'Quadril atrás, coluna neutra, suba com os quadris.'),
  (9, 3, 'Agachamento Livre', 'Pés na largura dos ombros, desça até a paralela.'),
  (10, 3, 'Leg Press 45°', 'Empurre a plataforma sem travar os joelhos no topo.'),
  (11, 3, 'Cadeira Extensora', 'Extensão de joelhos até a paralela, desça controlado.'),
  (12, 3, 'Mesa Flexora', 'Flexão de joelhos até aproximadamente 90°, retorno controlado.'),
  (13, 3, 'Panturrilha em Pé', 'Suba nas pontas dos pés, desça abaixo da linha do calcanhar.'),
  (14, 4, 'Desenvolvimento c/ Halteres', 'Empurre os halteres acima da cabeça, controle a descida.'),
  (15, 4, 'Elevação Lateral', 'Braços semicerrados, suba até a altura dos ombros.'),
  (16, 4, 'Elevação Frontal', 'Halteres à frente até a altura do ombro, alternado.'),
  (17, 5, 'Rosca Direta c/ Barra', 'Cotovelos fixos ao tronco, flexione até o pico.'),
  (18, 5, 'Rosca Alternada c/ Halteres', 'Um braço de cada vez, supinação ao subir.'),
  (19, 5, 'Rosca Scott', 'Apoie os tríceps no suporte inclinado, amplitude completa.'),
  (20, 6, 'Tríceps Testa c/ Barra EZ', 'Deite, desça a barra em direção à testa, estenda.'),
  (21, 6, 'Tríceps Corda no Cabo', 'Puxe a corda para baixo, abra as pontas ao final.'),
  (22, 6, 'Mergulho entre Bancos', 'Apoie as mãos atrás, desça até aproximadamente 90° nos cotovelos.'),
  (23, 7, 'Abdominal Supra', 'Elevação do tronco com as mãos atrás da cabeça.'),
  (24, 7, 'Prancha Isométrica', 'Apoio nos antebraços e pontas dos pés, mantenha.'),
  (25, 8, 'Esteira — Caminhada Inclinada', 'Inclinação 5–8%, velocidade 5–6 km/h.'),
  (26, 8, 'HIIT — Bicicleta Ergométrica', '30s sprints / 30s recuperação, 10 ciclos.');

CREATE TABLE `workout_day_exercises` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `workout_day_id` INT NOT NULL,
  `exercise_id` INT NOT NULL,
  `sets` TINYINT NOT NULL DEFAULT 3,
  `reps` VARCHAR(20) NOT NULL DEFAULT '12',
  `rest_seconds` SMALLINT NOT NULL DEFAULT 60,
  `display_order` TINYINT NOT NULL DEFAULT 1,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wde_workout_days_idx` (`workout_day_id`),
  KEY `fk_wde_exercises_idx` (`exercise_id`),
  CONSTRAINT `fk_wde_workout_days`
    FOREIGN KEY (`workout_day_id`) REFERENCES `workout_days` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_wde_exercises`
    FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `workout_day_exercises`
  (`id`, `workout_day_id`, `exercise_id`, `sets`, `reps`, `rest_seconds`, `display_order`, `notes`)
VALUES
  (1, 1, 1, 4, '10-12', 60, 1, NULL),
  (2, 1, 2, 3, '12-15', 45, 2, NULL),
  (3, 1, 14, 4, '10', 60, 3, NULL),
  (4, 1, 15, 3, '15', 45, 4, NULL),
  (5, 1, 20, 4, '10', 60, 5, NULL),
  (6, 1, 21, 3, '12', 45, 6, NULL),
  (7, 2, 5, 4, '10-12', 60, 1, NULL),
  (8, 2, 6, 4, '10', 60, 2, NULL),
  (9, 2, 7, 3, '12', 45, 3, NULL),
  (10, 2, 17, 3, '10-12', 45, 4, NULL),
  (11, 2, 18, 3, '12', 45, 5, NULL),
  (12, 3, 9, 4, '8-10', 90, 1, 'Evitar agachamento profundo — tendinite'),
  (13, 3, 10, 4, '12', 60, 2, NULL),
  (14, 3, 11, 3, '15', 45, 3, NULL),
  (15, 3, 12, 3, '12', 45, 4, NULL),
  (16, 3, 13, 4, '20', 30, 5, NULL),
  (17, 4, 1, 4, '12', 45, 1, NULL),
  (18, 4, 14, 3, '12', 45, 2, NULL),
  (19, 4, 5, 4, '12', 45, 3, NULL),
  (20, 4, 17, 3, '15', 30, 4, NULL),
  (21, 5, 10, 4, '15', 45, 1, NULL),
  (22, 5, 11, 3, '20', 30, 2, NULL),
  (23, 5, 12, 3, '15', 30, 3, NULL),
  (24, 5, 26, 1, '10 ciclos', 0, 4, 'HIIT ao final'),
  (25, 6, 1, 3, '12', 60, 1, NULL),
  (26, 6, 9, 3, '12', 60, 2, NULL),
  (27, 6, 5, 3, '12', 60, 3, NULL),
  (28, 6, 23, 3, '20', 30, 4, NULL);

CREATE TABLE `faqs_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faqs_categories_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faqs_categories` (`id`, `name`) VALUES
  (1, 'Planos e Preços'),
  (2, 'Funcionalidades'),
  (3, 'Conta e Segurança'),
  (4, 'Treinos e Alunos'),
  (5, 'Suporte Técnico');

CREATE TABLE `faqs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `faqs_category_id` INT NOT NULL,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_faqs_faqs_categories_idx` (`faqs_category_id`),
  CONSTRAINT `fk_faqs_faqs_categories`
    FOREIGN KEY (`faqs_category_id`) REFERENCES `faqs_categories` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faqs` (`id`, `faqs_category_id`, `question`, `answer`, `active`, `display_order`) VALUES
  (1, 1, 'O TrainiFy é gratuito?',
   'Sim! O plano Starter é 100% gratuito e permite cadastrar até 5 alunos, criar treinos básicos e acessar o dashboard. Para alunos e treinos ilimitados, confira os planos Pro e Business.', 1, 1),
  (2, 1, 'Posso cancelar minha assinatura a qualquer momento?',
   'Sim. Não há fidelidade nem multa por cancelamento. Você pode cancelar sua assinatura quando quiser pelo painel de configurações.', 1, 2),
  (3, 1, 'Existe período de teste gratuito para os planos pagos?',
   'Sim. Todos os planos pagos oferecem 14 dias de teste gratuito, sem necessidade de cartão de crédito.', 1, 3),
  (4, 2, 'Meus alunos precisam criar uma conta no TrainiFy?',
   'Não. Apenas o personal trainer precisa de conta. Você cadastra seus alunos dentro da plataforma e pode exportar as fichas de treino em PDF.', 1, 1),
  (5, 2, 'Como funciona a exportação em PDF?',
   'Com um clique, o TrainiFy gera um PDF profissional da ficha de treino do aluno com layout formatado e pronto para impressão ou envio.', 1, 2),
  (6, 2, 'Preciso instalar algum aplicativo?',
   'Não. O TrainiFy é uma plataforma web responsiva que funciona diretamente no navegador.', 1, 3),
  (7, 2, 'Posso migrar minha base de alunos de outra plataforma?',
   'Sim. Oferecemos importação via planilha CSV. Nossa equipe de suporte também pode auxiliar no processo.', 1, 4),
  (8, 3, 'Como altero minha senha?',
   'Acesse Meu Perfil e utilize a seção Alterar Senha.', 1, 1),
  (9, 3, 'Os dados dos meus alunos estão seguros?',
   'Sim. O sistema foi projetado para manter os dados organizados e protegidos, respeitando boas práticas de segurança.', 1, 2),
  (10, 4, 'Quantos treinos posso criar por aluno?',
   'O sistema permite criar treinos personalizados para cada aluno e também manter modelos de treino reutilizáveis.', 1, 1),
  (11, 4, 'É possível duplicar um treino para outro aluno?',
   'Sim. Um treino pode ser utilizado como modelo e adaptado para outro aluno.', 1, 2),
  (12, 5, 'Como entro em contato com o suporte?',
   'Você pode entrar em contato pelo e-mail suporte@trainify.com.br ou pelo formulário na página de contato.', 1, 1),
  (13, 5, 'O sistema funciona offline?',
   'Não. O TrainiFy requer conexão com a internet para funcionar.', 0, 2);
