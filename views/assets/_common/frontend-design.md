# Frontend Design - TrainiFy

## Contexto geral da interface
- Nome do sistema: TrainiFy
- Objetivo principal: Plataforma para personal trainers gerenciarem alunos, montarem treinos e acompanhar resultados de forma simples e visual.
- Público principal: Personal trainers e administradores do serviço.
- Dispositivos prioritários: combinação mobile e desktop (design responsivo para ambos).
- Estilo desejado: moderno e comercial com foco em clareza, navegação rápida e visual profissional.

## Área Pública (public)
- Quem acessa: visitantes sem login.
- Objetivo da área: apresentar a solução, explicar benefícios, permitir contato, registro e login.
- Telas previstas: home (landing), sobre (seções na home), contato (seção na home), login, cadastro.
- Componentes principais: header semântico, nav, banner hero, cards de destaque, seção de benefícios, FAQ, footer.
- Ação principal esperada do usuário: criar conta ou entrar na plataforma.

## Área de Aplicação (app)
- Quem acessa: usuário autenticado (personal trainer).
- Objetivo da área: acompanhar alunos, gerenciar treinos e editar perfil.
- Telas previstas: dashboard, perfil, listagem de alunos, detalhes do aluno, treinos.
- Componentes principais: sidebar, topbar, cards de métricas, tabelas semânticas, formulários de perfil, filtros.
- Ação principal esperada do usuário: consultar alunos e criar/editar treinos.

## Área Administrativa (admin)
- Quem acessa: administrador do sistema.
- Objetivo da área: gerenciar usuários, FAQs e monitorar indicadores do serviço.
- Telas previstas: painel administrativo, gestão de usuários, gestão de FAQs.
- Componentes principais: sidebar de navegação, toolbar, cards de indicadores, tabelas semânticas, filtros.
- Ação principal esperada do usuário: revisar dados do sistema e atualizar cadastros.

## Navegação e organização visual
- Estrutura de navegação principal: menu superior para público, sidebar lateral para app e admin.
- Fluxo entre telas: visitante chega à landing page → login/cadastro → app dashboard → perfil ou alunos → admin via painel restrito.
- Hierarquia visual: Home dá destaque ao CTA principal (registrar/login) e às principais vantagens; dashboard destaca métricas e ações rápidas; admin destaca indicadores do sistema.
- Estados importantes da interface: vazio (tabelas com mensagem sem dados), carregando (spinners), erro visual (alertas em vermelho), sucesso (toasts ou alertas verdes).

## Responsividade e acessibilidade
- Breakpoints desejados: mobile, tablet e desktop.
- Ajustes esperados por tela: menu colapsado em mobile, cards empilhados, tabelas com scroll horizontal, formulários ajustados para largura total.
- Cuidados de acessibilidade: contraste forte, legibilidade tipográfica, ordem lógica de foco, textos claros e botões descritivos.
- Elementos semânticos esperados: header, nav, main, section, article, aside, footer.

## Identidade visual
- Paleta principal: detalhes em verde neon, base escura com cinza e branco para contraste.
- Tipografia: fontes modernas e limpas, peso forte para títulos e leitura clara em parágrafos.
- Referências visuais: dashboards SaaS e plataformas de gestão com visual escuro/profissional.
- Sensação que a interface deve transmitir: confiança, agilidade e organização.

## Organização de arquivos esperada
- Estilos compartilhados: `views/assets/_common/styles/[arquivo.css]`
- Scripts compartilhados: `views/assets/_common/scripts/[arquivo.js]`
- Estilos da área pública: `views/assets/public/styles/[arquivo.css]`
- Scripts da área pública: `views/assets/public/scripts/[arquivo.js]`
- Estilos da aplicação: `views/assets/app/styles/[arquivo.css]`
- Scripts da aplicação: `views/assets/app/scripts/[arquivo.js]`
- Estilos da área administrativa: `views/assets/admin/styles/[arquivo.css]`
- Scripts da área administrativa: `views/assets/admin/scripts/[arquivo.js]`

## Limite entre etapa atual e integração futura
- Agora: criar HTML semântico, CSS e interações estáticas em JavaScript.
- Depois: integrar com a API usando `HttpClientBase.js`, tratar erros assíncronos e renderizar dados dinamicamente.

## Observações de implementação
- O frontend deve manter HTML semântico e usar `document.querySelector` no JavaScript.
- Eventos não devem ser declarados inline em HTML.
- A área pública pode usar seções internas da home para Sobre e Contato.
- A área administrativa agora inclui uma página de FAQ estática para controle de conteúdo.
