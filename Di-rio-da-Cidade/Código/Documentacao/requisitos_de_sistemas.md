# Requisitos de Sistema — Diário da Cidade
Funcionais (O que a aplicação faz):

    Integração com Mapa: Carregar o mapa interativo de Barra do Garças (ex.: Google Maps ou Leaflet).

    Registro de Dados: Salvar local (latitude/longitude), categoria, descrição e foto do problema no banco de dados.

    Marcadores Dinâmicos: Exibir pinos no mapa sinalizando as reclamações e seus status.

    Painel do Gestor: Tela restrita para a prefeitura alterar o status e dar baixa nos chamados resolvidos.
    

Não funcionais (Como o sistema opera):

    Responsividade: Funcionar bem tanto em celulares quanto em computadores.

    Desempenho & Disponibilidade: Carregar o mapa de forma rápida e permanecer online 24h.
**Projeto:** Diário da Cidade — Plataforma de Denúncias Urbanas  
**Versão:** 1.0  
**Data:** 02 de setembro de 2026  
**Conformidade:** UML 2.5.1, ISO/IEC/IEEE 29148:2018, FURPS+/ISO/IEC 25010  
**Stack Tecnológica:** Node.js + Express + SQLite/PostgreSQL + HTML5/JS  

---

## Sumário

1. [Requisitos Funcionais de Sistema (RSF)](#1-requisitos-funcionais-de-sistema-rsf)
2. [Requisitos Não Funcionais (RSNF)](#2-requisitos-não-funcionais-rsnf)
3. [Diagramas de Sequência de Backend](#3-diagramas-de-sequência-de-backend)
4. [Diagrama Estrutural de Classes](#4-diagrama-estrutural-de-classes)
5. [Dicionário Técnico de Dados](#5-dicionário-técnico-de-dados)
6. [Contratos de API RESTful](#6-contratos-de-api-restful)
7. [Matriz de Rastreabilidade Técnica](#7-matrize-de-rastreabilidade-técnica)

---

## 1. Requisitos Funcionais de Sistema (RSF)

### RSF01 — Cadastro de Usuário

| Campo | Valor |
|-------|-------|
| **ID** | RSF01 |
| **Título** | Cadastro de Usuário no Sistema |
| **Descrição** | O sistema deve permitir o cadastro de novos usuários (cidadãos e administradores) com validação de dados e persistência segura |
| **Rota HTTP** | `POST /api/usuarios` |
| **Método** | POST |
| **Content-Type** | `application/json` |
| **Autenticação** | Não requerida (rota pública) |

**Payload de Requisição:**

```json
{
  "nome": "string (3-100 caracteres, obrigatório)",
  "email": "string (formato email, obrigatório, único)",
  "senha": "string (mínimo 8 caracteres, obrigatório)",
  "confirmar_senha": "string (deve coincidir com senha, obrigatório)"
}
```

**Payload de Resposta (201 Created):**

```json
{
  "message": "Usuário cadastrado com sucesso",
  "usuario": {
    "id": "integer (auto-increment)",
    "nome": "string",
    "email": "string",
    "perfil": "string (default: 'cidadao')",
    "data_criacao": "datetime (ISO 8601)",
    "ativo": true
  }
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `201 Created` | Cadastro realizado com sucesso |
| `400 Bad Request` | Dados inválidos (email malformado, senhas não conferem, campos obrigatórios ausentes) |
| `409 Conflict` | Email já cadastrado no sistema |
| `422 Unprocessable Entity` | Validação de negócio falhou (senha fraca, nome com caracteres inválidos) |
| `429 Too Many Requests` | Rate limit excedido (máximo 5 tentativas/minuto por IP) |
| `500 Internal Server Error` | Erro interno do servidor |

**Middlewares Express Aplicados:**

| Middleware | Função |
|-----------|--------|
| `express.json()` | Parse do body JSON (limite: 10KB) |
| `express-validator.body()` | Validação dos campos de entrada |
| `rateLimiter` | Limitação de taxa (5 req/min/IP) |
| `sanitizeInput` | Sanitização contra XSS e injeção |
| `helmet` | Headers de segurança HTTP |

**Regras de Validação:**

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| `nome` | Obrigatório, 3-100 caracteres, apenas letras/acentos/espaços | "Nome deve ter entre 3 e 100 caracteres" |
| `email` | Obrigatório, formato válido (RFC 5322), único no banco | "Email inválido" ou "Email já cadastrado" |
| `senha` | Obrigatório, mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número | "Senha deve ter no mínimo 8 caracteres com ao menos 1 maiúscula, 1 minúscula e 1 número" |
| `confirmar_senha` | Obrigatório, deve coincidir com `senha` | "As senhas não conferem" |

**Fluxo Interno:**

1. Express recebe a requisição `POST /api/usuarios`
2. Middleware `helmet` adiciona headers de segurança
3. Middleware `rateLimiter` verifica taxa de requisições
4. Middleware `express.json()` faz parse do body
5. Middleware `sanitizeInput` limpa dados contra XSS
6. `express-validator` valida os campos
7. Controller `UsuariosController.criar()` é invocado
8. Service `UsuariosService.criar()` executa:
   - Verifica se email já existe (`SELECT` parametrizado)
   - Gera hash da senha com bcrypt (cost factor: 12)
   - Insere no banco (`INSERT` parametrizado)
   - Retorna dados do usuário criado (sem senha)
9. Registra trilha de auditoria: `{ tipo: "CRIACAO_USUARIO", usuario_id, data, ip }`
10. Retorna `201 Created` com dados do usuário

---

### RSF02 — Autenticação (Login)

| Campo | Valor |
|-------|-------|
| **ID** | RSF02 |
| **Título** | Autenticação de Usuário via JWT |
| **Descrição** | O sistema deve autenticar usuários via credenciais e emitir token JWT stateless |
| **Rota HTTP** | `POST /api/auth/login` |
| **Método** | POST |
| **Content-Type** | `application/json` |
| **Autenticação** | Não requerida (rota pública) |

**Payload de Requisição:**

```json
{
  "email": "string (formato email, obrigatório)",
  "senha": "string (obrigatório)"
}
```

**Payload de Resposta (200 OK):**

```json
{
  "token": "string (JWT, expira em 24h)",
  "usuario": {
    "id": "integer",
    "nome": "string",
    "email": "string",
    "perfil": "string ('cidadao' | 'admin' | 'moderador')"
  }
}
```

**Payload de Erro (401 Unauthorized):**

```json
{
  "error": "Email ou senha incorretos"
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Autenticação bem-sucedida, token emitido |
| `400 Bad Request` | Payload inválido (email ausente, senha ausente) |
| `401 Unauthorized` | Credenciais inválidas |
| `403 Forbidden` | Conta bloqueada por tentativas excessivas |
| `429 Too Many Requests` | Rate limit excedido (10 tentativas/minuto/IP) |
| `500 Internal Server Error` | Erro interno |

**Estrutura do JWT (Payload):**

```json
{
  "sub": "integer (ID do usuário)",
  "email": "string",
  "perfil": "string",
  "iat": "integer (issued at — timestamp)",
  "exp": "integer (expiration — iat + 86400s = 24h)"
}
```

**Configuração JWT:**

| Parâmetro | Valor |
|-----------|-------|
| Algoritmo | HS256 (HMAC-SHA256) |
| Chave Secreta | Variável de ambiente `JWT_SECRET` (mínimo 256 bits) |
| Expiração | 24 horas (86400 segundos) |
| Issuer | `diario-da-cidade-api` |
| Audience | `diario-da-cidade-app` |

**Regras de Bloqueio:**

| Tentativas Incorretas | Ação |
|----------------------|------|
| 1-4 | Conta permanece ativa, incrementa contador |
| 5 | Conta bloqueada por 30 minutos |
| Após 30 min | Contador de tentativas é resetado |
| Após 10 bloqueios em 24h | Conta bloqueada até revisão manual |

---

### RSF03 — Criar Denúncia

| Campo | Valor |
|-------|-------|
| **ID** | RSF03 |
| **Título** | Registro de Nova Denúncia |
| **Descrição** | O sistema deve permitir que cidadãos registrem denúncias com dados georreferenciados |
| **Rota HTTP** | `POST /api/denuncias` |
| **Método** | POST |
| **Content-Type** | `application/json` |
| **Autenticação** | Opcional (aceita token JWT para vincular ao usuário) |

**Payload de Requisição:**

```json
{
  "tipo": "string (enum, obrigatório)",
  "descricao": "string (10-1000 caracteres, obrigatório)",
  "endereco": "string (obrigatório)",
  "lat": "number (float, obrigatório, range: -90 a 90)",
  "lng": "number (float, obrigatório, range: -180 a 180)",
  "termo_aceito": "boolean (obrigatório, deve ser true)"
}
```

**Enum de Tipos Válidos:**

```typescript
enum TipoProblema {
  BURACO_RUA = "Buraco na rua",
  LIXO_ACUMULADO = "Lixo acumulado",
  LUZ_APAGADA = "Luz apagada",
  AGUA_PARADA = "Água parada",
  OUTRO = "Outro"
}
```

**Payload de Resposta (201 Created):**

```json
{
  "message": "Denúncia registrada com sucesso",
  "denuncia": {
    "id": "integer (auto-increment)",
    "tipo": "string",
    "descricao": "string",
    "endereco": "string",
    "lat": "number",
    "lng": "number",
    "termo_aceito": true,
    "status": "Pendente",
    "usuario_id": "integer|null (null se anônimo)",
    "data_criacao": "datetime (ISO 8601)",
    "data_atualizacao": "datetime (ISO 8601)"
  }
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `201 Created` | Denúncia registrada com sucesso |
| `400 Bad Request` | Payload inválido (campos ausentes, tipo inválido) |
| `401 Unauthorized` | Token inválido (se fornecido) |
| `422 Unprocessable Entity` | Violação de regra de negócio (termos não aceitos, coordenadas inválidas) |
| `429 Too Many Requests` | Rate limit excedido (20 denúncias/hora por IP) |
| `500 Internal Server Error` | Erro interno |

**Regras de Validação:**

| Campo | Regra |
|-------|-------|
| `tipo` | Obrigatório, deve ser um dos valores do enum |
| `descricao` | Obrigatório, 10-1000 caracteres, sanitizado contra XSS |
| `endereco` | Obrigatório, string não vazia |
| `lat` | Obrigatório, float entre -90 e 90 |
| `lng` | Obrigatório, float entre -180 e 180 |
| `termo_aceito` | Obrigatório, deve ser `true` |

---

### RSF04 — Listar Denúncias Públicas

| Campo | Valor |
|-------|-------|
| **ID** | RSF04 |
| **Título** | Listagem de Denúncias para Visualização Pública |
| **Descrição** | O sistema deve retornar lista paginada de denúncias para visualização no mapa e lista |
| **Rota HTTP** | `GET /api/denuncias` |
| **Método** | GET |
| **Autenticação** | Não requerida |

**Parâmetros de Query:**

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| `page` | integer | Não | 1 | Número da página |
| `limit` | integer | Não | 20 | Itens por página (máx: 100) |
| `status` | string | Não | — | Filtrar por status |
| `tipo` | string | Não | — | Filtrar por tipo |
| `lat_min` | float | Não | — | Bounding box — latitude mínima |
| `lat_max` | float | Não | — | Bounding box — latitude máxima |
| `lng_min` | float | Não | — | Bounding box — longitude mínima |
| `lng_max` | float | Não | — | Bounding box — longitude máxima |

**Payload de Resposta (200 OK):**

```json
{
  "denuncias": [
    {
      "id": "integer",
      "tipo": "string",
      "descricao": "string (truncada a 200 chars na listagem)",
      "endereco": "string",
      "lat": "number",
      "lng": "number",
      "status": "string",
      "data_criacao": "datetime (ISO 8601)"
    }
  ],
  "paginacao": {
    "pagina_atual": "integer",
    "itens_por_pagina": "integer",
    "total_itens": "integer",
    "total_paginas": "integer"
  }
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Lista retornada com sucesso |
| `400 Bad Request` | Parâmetros de query inválidos |
| `500 Internal Server Error` | Erro interno |

---

### RSF05 — Obter Detalhes da Denúncia

| Campo | Valor |
|-------|-------|
| **ID** | RSF05 |
| **Título** | Consulta de Detalhes de Denúncia |
| **Descrição** | O sistema deve retornar todos os dados de uma denúncia específica |
| **Rota HTTP** | `GET /api/denuncias/:id` |
| **Método** | GET |
| **Autenticação** | Não requerida |

**Payload de Resposta (200 OK):**

```json
{
  "id": "integer",
  "tipo": "string",
  "descricao": "string (completa)",
  "endereco": "string",
  "lat": "number",
  "lng": "number",
  "termo_aceito": "boolean",
  "status": "string",
  "usuario_id": "integer|null",
  "data_criacao": "datetime",
  "data_atualizacao": "datetime",
  "historico_status": [
    {
      "status_anterior": "string",
      "status_novo": "string",
      "data_alteracao": "datetime",
      "admin_id": "integer"
    }
  ]
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Denúncia encontrada |
| `404 Not Found` | Denúncia não encontrada com o ID informado |
| `500 Internal Server Error` | Erro interno |

---

### RSF06 — Atualizar Status da Denúncia (Admin)

| Campo | Valor |
|-------|-------|
| **ID** | RSF06 |
| **Título** | Atualização de Status de Denúncia |
| **Descrição** | Administradores devem poder alterar o status de qualquer denúncia |
| **Rota HTTP** | `PUT /api/denuncias/:id/status` |
| **Método** | PUT |
| **Content-Type** | `application/json` |
| **Autenticação** | Obrigatória (JWT com perfil `admin` ou `moderador`) |

**Payload de Requisição:**

```json
{
  "status": "string (enum, obrigatório)"
}
```

**Enum de Status Válidos:**

```typescript
enum StatusDenuncia {
  PENDENTE = "Pendente",
  EM_ANALISE = "Em Análise",
  EM_MANUTENCAO = "Em Manutenção",
  RESOLVIDO = "Resolvido"
}
```

**Regras de Transição de Status (Máquina de Estados):**

| Status Atual | Transições Permitidas |
|--------------|----------------------|
| Pendente | → Em Análise, Em Manutenção, Resolvido |
| Em Análise | → Em Manutenção, Resolvido |
| Em Manutenção | → Resolvido |
| Resolvido | NENHUMA (imutável) |

**Payload de Resposta (200 OK):**

```json
{
  "message": "Status atualizado com sucesso",
  "denuncia": {
    "id": "integer",
    "status_anterior": "string",
    "status_novo": "string",
    "data_atualizacao": "datetime"
  }
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Status atualizado com sucesso |
| `400 Bad Request` | Payload inválido ou transição não permitida |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Usuário não tem permissão (perfil insuficiente) |
| `404 Not Found` | Denúncia não encontrada |
| `500 Internal Server Error` | Erro interno |

**Middlewares Express Aplicados:**

| Middleware | Função |
|-----------|--------|
| `authenticate` | Verifica e valida token JWT no header `Authorization: Bearer <token>` |
| `authorize(['admin', 'moderador'])` | Verifica se o perfil do usuário tem permissão |
| `validateStatusTransition` | Valida se a transição de status é permitida pela máquina de estados |

---

### RSF07 — Excluir Denúncia (Admin)

| Campo | Valor |
|-------|-------|
| **ID** | RSF07 |
| **Título** | Exclusão Permanente de Denúncia |
| **Descrição** | Administradores devem poder excluir denúncias com confirmação em duas etapas |
| **Rota HTTP** | `DELETE /api/denuncias/:id` |
| **Método** | DELETE |
| **Autenticação** | Obrigatória (JWT com perfil `admin`) |

**Cabeçalho de Confirmação (Obrigatório):**

```
X-Confirm-Delete: CONFIRMAR
```

**Payload de Resposta (200 OK):**

```json
{
  "message": "Denúncia excluída permanentemente",
  "denuncia_excluida": {
    "id": "integer",
    "tipo": "string",
    "data_exclusao": "datetime"
  }
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Denúncia excluída com sucesso |
| `400 Bad Request` | Header `X-Confirm-Delete` ausente ou inválido |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Usuário não é admin |
| `404 Not Found` | Denúncia não encontrada |
| `500 Internal Server Error` | Erro interno |

---

### RSF08 — Listar Usuários (Admin)

| Campo | Valor |
|-------|-------|
| **ID** | RSF08 |
| **Título** | Listagem de Usuários para Gestão |
| **Descrição** | Administradores devem poder listar todos os usuários cadastrados |
| **Rota HTTP** | `GET /api/usuarios` |
| **Método** | GET |
| **Autenticação** | Obrigatória (JWT com perfil `admin`) |

**Parâmetros de Query:**

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens por página |
| `status` | string | — | Filtrar por ativo/inativo |

**Payload de Resposta (200 OK):**

```json
{
  "usuarios": [
    {
      "id": "integer",
      "nome": "string",
      "email": "string",
      "perfil": "string",
      "ativo": "boolean",
      "data_criacao": "datetime",
      "total_denuncias": "integer"
    }
  ],
  "paginacao": {
    "pagina_atual": "integer",
    "itens_por_pagina": "integer",
    "total_itens": "integer",
    "total_paginas": "integer"
  }
}
```

---

### RSF09 — Atualizar Perfil de Usuário (Admin)

| Campo | Valor |
|-------|-------|
| **ID** | RSF09 |
| **Título** | Atualização de Perfil e Status de Usuário |
| **Descrição** | Administradores devem poder alterar perfil e status de ativação de usuários |
| **Rota HTTP** | `PATCH /api/usuarios/:id` |
| **Método** | PATCH |
| **Content-Type** | `application/json` |
| **Autenticação** | Obrigatória (JWT com perfil `admin`) |

**Payload de Requisição:**

```json
{
  "perfil": "string (enum: 'cidadao', 'admin', 'moderador') — opcional",
  "ativo": "boolean — opcional"
}
```

**Regras:**
- Um admin não pode desativar a própria conta
- Um admin não pode rebaixar o próprio perfil
- Apenas campos presentes no payload são atualizados

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Usuário atualizado com sucesso |
| `400 Bad Request` | Payload inválido |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Tentativa de auto-desativação ou auto-rebaixamento |
| `404 Not Found` | Usuário não encontrado |
| `409 Conflict` | Tentativa de desativar último admin |
| `500 Internal Server Error` | Erro interno |

---

### RSF10 — Gerar Relatório (Admin)

| Campo | Valor |
|-------|-------|
| **ID** | RSF10 |
| **Título** | Geração de Relatório Estatístico |
| **Descrição** | O sistema deve gerar relatórios consolidados de denúncias |
| **Rota HTTP** | `GET /api/relatorios` |
| **Método** | GET |
| **Autenticação** | Obrigatória (JWT com perfil `admin`) |

**Parâmetros de Query:**

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `data_inicio` | string (ISO 8601) | Primeiro dia do mês atual | Data inicial do período |
| `data_fim` | string (ISO 8601) | Dia atual | Data final do período |
| `tipo` | string | — | Filtrar por tipo de problema |
| `formato` | string | `json` | Formato de saída (`json` ou `csv`) |

**Payload de Resposta (200 OK):**

```json
{
  "periodo": {
    "data_inicio": "datetime",
    "data_fim": "datetime"
  },
  "resumo": {
    "total_denuncias": "integer",
    "por_tipo": [
      { "tipo": "string", "quantidade": "integer", "percentual": "number" }
    ],
    "por_status": [
      { "status": "string", "quantidade": "integer", "percentual": "number" }
    ],
    "tempo_medio_resolucao_dias": "number",
    "denuncias_por_dia": [
      { "data": "date", "quantidade": "integer" }
    ]
  }
}
```

**Códigos de Status HTTP:**

| Código | Condição |
|--------|----------|
| `200 OK` | Relatório gerado com sucesso |
| `400 Bad Request` | Parâmetros de data inválidos |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Perfil insuficiente |
| `500 Internal Server Error` | Erro interno |

---

## 2. Requisitos Não Funcionais (RSNF)

### 2.1 Taxonomia FURPS+ / ISO 25010

#### 2.1.1 Segurança (ISO 25010 — Segurança da Informação)

##### RSNF-S01 — Criptografia de Senhas

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S01 |
| **Categoria** | Segurança |
| **Prioridade** | Crítica |
| **Descrição** | Todas as senhas devem ser armazenadas com criptografia unidirecional (hash) usando algoritmo seguro com salt aleatório |

**Especificação Técnica:**

| Parâmetro | Especificação |
|-----------|---------------|
| Algoritmo | bcrypt (recomendado) ou argon2id |
| Cost Factor (bcrypt) | 12 (mínimo 10, recomendado 12) |
| Salt | Gerado automaticamente pelo bcrypt (128 bits) |
| Tamanho do Hash | 60 caracteres (bcrypt) |
| Formato Armazenamento | `$2b$12$<salt><hash>` |

**Operações:**

| Função | Biblioteca | Uso |
|--------|-----------|-----|
| `bcrypt.hash(senha, 12)` | `bcryptjs` | Geração do hash no cadastro |
| `bcrypt.compare(senha, hash)` | `bcryptjs` | Verificação no login |

**Restrições:**
- Nunca armazenar senhas em texto puro
- Nunca logar senhas ou hashes em arquivos de log
- Nunca retornar hashes em respostas de API
- Nunca permitir que senhas sejam transmitidas sem HTTPS

##### RSNF-S02 — Autenticação e Autorização Stateless (JWT)

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S02 |
| **Categoria** | Segurança |
| **Prioridade** | Crítica |
| **Descrição** | Autenticação via JSON Web Token (JWT) stateless, sem sessões server-side |

**Especificação Técnica:**

| Componente | Especificação |
|------------|---------------|
| Padrão | RFC 7519 — JSON Web Token |
| Algoritmo de Assinatura | HS256 (HMAC-SHA256) |
| Chave Secreta | Variável de ambiente `JWT_SECRET` (mínimo 32 bytes / 256 bits) |
| Expiração do Token | 24 horas (86400 segundos) |
| Localização do Token | Header HTTP: `Authorization: Bearer <token>` |
| Armazenamento (Frontend) | Cookie HTTP-Only (recomendado) ou localStorage (alternativa) |

**Claims Obrigatórias:**

```json
{
  "iss": "diario-da-cidade-api",
  "sub": "<user_id>",
  "aud": "diario-da-cidade-app",
  "iat": "<unix_timestamp>",
  "exp": "<unix_timestamp + 86400>",
  "email": "<user_email>",
  "perfil": "<user_profile>"
}
```

**Middleware de Autenticação (Express):**

```javascript
// Pseudocódigo do middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
```

**Middleware de Autorização (Perfis):**

```javascript
function authorize(allowedProfiles) {
  return (req, res, next) => {
    if (!req.user || !allowedProfiles.includes(req.user.perfil)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    next();
  };
}
```

##### RSNF-S03 — Sanitização contra XSS

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S03 |
| **Categoria** | Segurança |
| **Prioridade** | Crítica |
| **Descrição** | O sistema deve realizar sanitização ativa contra Cross-Site Scripting (XSS) em todas as entradas de dados |

**Estratégias de Sanitização:**

| Camada | Ferramenta | Uso |
|--------|-----------|-----|
| **Backend — Validação** | `express-validator` | Validação e sanitização de campos no Express |
| **Backend — Escape HTML** | `DOMPurify` (via `jsdom`) | Limpeza de HTML perigoso em campos de texto |
| **Backend — Headers** | `helmet` | Headers Content-Security-Policy, X-XSS-Protection |
| **Frontend — DOM** | `textContent` (nativo) | Inserção segura de texto no DOM (nunca `innerHTML`) |
| **Frontend — Escape** | Função `escaparHTML()` | Escape manual de caracteres especiais |

**Regras de Sanitização Backend:**

```javascript
// Pseudocódigo
const { body, validationResult } = require('express-validator');

const sanitizeInput = [
  body('descricao')
    .trim()
    .escape() // Converte < para &lt;, > para &gt;, etc.
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  body('tipo')
    .trim()
    .isIn(['Buraco na rua', 'Lixo acumulado', 'Luz apagada', 'Água parada', 'Outro'])
    .withMessage('Tipo inválido'),
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude inválida'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude inválida'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

**Headers de Segurança (Helmet):**

```javascript
const helmet = require('helmet');
app.use(helmet());
// Adiciona automaticamente:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
// Content-Security-Policy: default-src 'self'
// Strict-Transport-Security: max-age=31536000; includeSubDomains
// Referrer-Policy: strict-origin-when-cross-origin
// Permissions-Policy: geolocation=(), camera=(), microphone=()
```

##### RSNF-S04 — Prevenção de SQL Injection

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S04 |
| **Categoria** | Segurança |
| **Prioridade** | Crítica |
| **Descrição** | Todas as queries ao banco de dados devem utilizar Prepared Statements ou ORM/Query Builder parametrizado |

**Estratégias de Prevenção:**

| Camada | Ferramenta | Uso |
|--------|-----------|-----|
| **Prepared Statements** | `sqlite3` / `pg` | Queries parametrizadas nativas |
| **Query Builder** | `knex.js` | Construção de queries seguras |
| **ORM** | `prisma` ou `sequelize` | Mapeamento objeto-relacional com sanitização automática |
| **Validação de Input** | `express-validator` | Validação antes de chegar ao banco |

**Exemplo de Prepared Statement (SQLite):**

```javascript
// SEGURO — Prepared Statement
const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
const user = stmt.get(email); // email é passado como parâmetro, não concatenado

// PERIGOSO — NUNCA FAZER ISSO
// const query = `SELECT * FROM usuarios WHERE email = '${email}'`; // SQL INJECTION!
```

**Exemplo com Knex.js:**

```javascript
// SEGURO — Query Builder parametrizado
const user = await knex('usuarios')
  .where('email', email)
  .first();

// SEGURO — Insert parametrizado
await knex('reclamacoes').insert({
  tipo: dados.tipo,
  descricao: dados.descricao,
  lat: dados.lat,
  lng: dados.lng
});
```

##### RSNF-S05 — Headers de Segurança HTTP

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S05 |
| **Categoria** | Segurança |
| **Prioridade** | Alta |
| **Descrição** | O servidor deve retornar headers HTTP de segurança em todas as respostas |

**Headers Obrigatórios:**

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Força HTTPS |
| `X-Content-Type-Options` | `nosniff` | Previne MIME sniffing |
| `X-Frame-Options` | `DENY` | Previne clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Ativa filtro XSS do navegador |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; ...` | Define política de conteúdo |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla envio de referrer |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` | Desabilita APIs perigosas |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | Previne cache de dados sensíveis |

##### RSNF-S06 — Rate Limiting

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S06 |
| **Categoria** | Segurança |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve limitar a taxa de requisições por IP para prevenir abuso |

**Configurações de Rate Limit:**

| Rota | Limite | Janela | Ação |
|------|--------|--------|------|
| `POST /api/auth/login` | 10 tentativas | 1 minuto | `429 Too Many Requests` |
| `POST /api/usuarios` | 5 cadastros | 1 minuto | `429 Too Many Requests` |
| `POST /api/denuncias` | 20 denúncias | 1 hora | `429 Too Many Requests` |
| `DELETE /api/denuncias/:id` | 10 exclusões | 1 hora | `429 Too Many Requests` |
| Geral (todas as rotas) | 100 requisições | 1 minuto | `429 Too Many Requests` |

**Implementação:**

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

##### RSNF-S07 — HTTPS Obrigatório

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-S07 |
| **Categoria** | Segurança |
| **Prioridade** | Crítica |
| **Descrição** | Todo o tráfego deve ser criptografado via TLS 1.2+ |

**Configurações:**

| Parâmetro | Valor |
|-----------|-------|
| Protocolo mínimo | TLS 1.2 |
| Cifras aceitas | AES-256-GCM, AES-128-GCM, CHACHA20-POLY1305 |
| Redirect HTTP→HTTPS | Obrigatório (301 Permanent Redirect) |
| HSTS | `max-age=31536000; includeSubDomains; preload` |
| Certificado | Let's Encrypt (produção) ou auto-assinado (desenvolvimento) |

---

#### 2.1.2 Performance (ISO 25010 — Eficiência de Desempenho)

##### RSNF-P01 — Tempo de Resposta da API

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-P01 |
| **Categoria** | Performance |
| **Prioridade** | Alta |
| **Descrição** | A API deve responder a requisições dentro de limites aceitáveis de tempo |

**Limites de Tempo de Resposta:**

| Endpoint | Tempo Máximo (p95) | Tempo Máximo (p99) |
|----------|--------------------|--------------------|
| `GET /api/denuncias` | 200ms | 500ms |
| `GET /api/denuncias/:id` | 100ms | 300ms |
| `POST /api/denuncias` | 300ms | 600ms |
| `POST /api/auth/login` | 250ms | 500ms |
| `PUT /api/denuncias/:id/status` | 150ms | 400ms |
| `DELETE /api/denuncias/:id` | 150ms | 400ms |

**Métricas de Coleta:**

```javascript
// Middleware de métricas de performance
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordRequest(req.method, req.path, res.statusCode, duration);
    if (duration > 500) {
      logger.warn(`Requisição lenta: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});
```

##### RSNF-P02 — Throughput da API

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-P02 |
| **Categoria** | Performance |
| **Prioridade** | Média |
| **Descrição** | A API deve suportar carga concorrente adequada ao número esperado de usuários |

**Capacidade Esperada:**

| Métrica | Valor |
|---------|-------|
| Requisições simultâneas | 100+ (mínimo) |
| Requisições por segundo | 50+ (mínimo) |
| Conexões simultâneas ao banco | Pool de 10-20 conexões |

##### RSNF-P03 — Concorrência de I/O Não Bloqueante

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-P03 |
| **Categoria** | Performance |
| **Prioridade** | Crítica |
| **Descrição** | Todas as operações de I/O devem ser não bloqueantes para manter a responsividade do Event Loop do Node.js |

**Princípios do Event Loop:**

| Fase | Descrição | Tempo Máximo |
|------|-----------|--------------|
| Timers | `setTimeout`, `setInterval` | — |
| Pending I/O | `setImmediate`, callbacks de I/O | — |
| Idle/Prepare | Interno do Node.js | — |
| Poll | Leitura de arquivos, queries de banco | < 50ms por operação |
| Check | `setImmediate` callbacks | — |
| Close Callbacks | Fechamento de sockets | — |

**Regras de Concorrência:**

| Operação | Abordagem |
|----------|-----------|
| Queries ao banco | `async/await` com `sqlite3.run()` ou `knex.raw()` assíncrono |
| Leitura de arquivos | `fs.readFile()` assíncrono (nunca `fs.readFileSync()`) |
| Requisições HTTP externas | `axios` ou `fetch` com `Promise.all()` para paralelismo |
| Processamento CPU-intensive | `worker_threads` ou `child_process` (nunca no主线程) |

**Exemplo de Código Assíncrono:**

```javascript
// SEGURO — Async/Await não bloqueante
async function criarDenuncia(dados) {
  try {
    const resultado = await knex('reclamacoes').insert(dados);
    return resultado;
  } catch (error) {
    throw new Error('Erro ao criar denúncia');
  }
}

// PERIGOSO — Nunca usar operações síncronas no主线程
// const resultado = fs.readFileSync('arquivo.txt'); // BLOQUEIA O EVENT LOOP!
// const resultado = child_process.execSync('comando'); // BLOQUEIA!
```

##### RSNF-P04 — Gerenciamento de Pool de Conexões

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-P04 |
| **Categoria** | Performance |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve gerenciar pool de conexões com o banco de dados para otimizar performance |

**Configurações do Pool (SQLite):**

```javascript
// SQLite — database único (sem pool nativo)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Erro ao conectar ao SQLite:', err.message);
});

// Habilitar WAL mode para melhor concorrência
db.run('PRAGMA journal_mode=WAL');
db.run('PRAGMA busy_timeout=5000');
```

**Configurações do Pool (PostgreSQL):**

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,           // Máximo de conexões no pool
  min: 5,            // Mínimo de conexões mantidas
  idleTimeoutMillis: 30000,  // Timeout de conexão ociosa
  connectionTimeoutMillis: 2000, // Timeout de nova conexão
});
```

---

#### 2.1.3 Confiabilidade (ISO 25010 — Confiabilidade de Sistema)

##### RSNF-C01 — Tratamento de Erros

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-C01 |
| **Categoria** | Confiabilidade |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve tratar erros de formaGraceful, sem expor detalhes internos ao cliente |

**Estrutura de Erro Padrão:**

```json
{
  "error": {
    "code": "DENUNCIA_NAO_ENCONTRADA",
    "message": "Denúncia não encontrada com o ID informado",
    "timestamp": "2026-09-02T10:30:00.000Z",
    "path": "/api/denuncias/999"
  }
}
```

**Códigos de Erro Padronizados:**

| Código HTTP | Code Interno | Mensagem |
|-------------|--------------|----------|
| 400 | `PAYLOAD_INVALIDO` | Dados de entrada inválidos |
| 401 | `NAO_AUTENTICADO` | Token não fornecido ou inválido |
| 403 | `NAO_AUTORIZADO` | Perfil insuficiente para a operação |
| 404 | `RECURSO_NAO_ENCONTRADO` | Recurso não existe |
| 409 | `CONFLITO` | Conflito de dados (email duplicado, etc.) |
| 422 | `REGRA_NEGOCIO` | Violação de regra de negócio |
| 429 | `RATE_LIMIT` | Limite de requisições excedido |
| 500 | `ERRO_INTERNO` | Erro inesperado no servidor |

**Global Error Handler (Express):**

```javascript
app.use((err, req, res, next) => {
  logger.error(`${err.message}`, { stack: err.stack, path: req.path });
  
  const statusCode = err.statusCode || 500;
  const response = {
    error: {
      code: err.code || 'ERRO_INTERNO',
      message: process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  };
  
  res.status(statusCode).json(response);
});
```

##### RSNF-C02 — Trilha de Auditoria

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-C02 |
| **Categoria** | Confiabilidade |
| **Prioridade** | Alta |
| **Descrição** | Todas as operações de escrita devem gerar registros de auditoria |

**Eventos Auditados:**

| Evento | Dados Registrados |
|--------|-------------------|
| Login | `usuario_id, email, ip, data, sucesso, tentativa` |
| Logout | `usuario_id, ip, data` |
| Criação de Denúncia | `denuncia_id, usuario_id, ip, data, tipo` |
| Alteração de Status | `denuncia_id, status_anterior, status_novo, admin_id, data` |
| Exclusão de Denúncia | `denuncia_id, dados_completos, admin_id, data, ip` |
| Cadastro de Usuário | `usuario_id, email, ip, data` |
| Atualização de Perfil | `usuario_id, campo_alterado, valor_anterior, valor_novo, admin_id, data` |

**Schema da Tabela de Auditoria:**

```sql
CREATE TABLE auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento VARCHAR(50) NOT NULL,
  usuario_id INTEGER,
  dados_json TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  data_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

##### RSNF-C03 — Backup e Recuperação

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-C03 |
| **Categoria** | Confiabilidade |
| **Prioridade** | Média |
| **Descrição** | O banco de dados deve ter backup automático periódico |

**Política de Backup:**

| Tipo | Frequência | Retenção | Armazenamento |
|------|-----------|----------|---------------|
| Completo | Diário (02:00) | 30 dias | Storage externo |
| Incremental | A cada 6 horas | 7 dias | Storage externo |
| WAL (SQLite) | Contínuo | 24 horas | Mesmo servidor |

**Procedimento de Recuperação:**

1. Identificar ponto de recuperação desejado
2. Restaurar backup completo mais recente
3. Aplicar backups incrementais sequencialmente
4. Verificar integridade do banco (`PRAGMA integrity_check` para SQLite)
5. Testar conectividade e operações básicas

---

#### 2.1.4 Usabilidade (ISO 25010 — Usabilidade)

##### RSNF-U01 — Compatibilidade Cross-Browser

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-U01 |
| **Categoria** | Usabilidade |
| **Prioridade** | Alta |
| **Descrição** | A interface deve funcionar corretamente nos principais navegadores modernos |

**Navegadores Suportados:**

| Navegador | Versão Mínima | Notas |
|-----------|---------------|-------|
| Google Chrome | 90+ | Suporte completo |
| Mozilla Firefox | 88+ | Suporte completo |
| Safari | 14+ | Suporte completo |
| Microsoft Edge | 90+ | Suporte completo |
| Samsung Internet | 15+ | Testar em dispositivos móveis |
| Opera | 76+ | Suporte completo |

**Tecnologias Utilizadas:**

| Tecnologia | Uso | Compatibilidade |
|------------|-----|-----------------|
| HTML5 Semântico | Estrutura | Todos modernos |
| CSS3 | Estilos | Todos modernos |
| JavaScript ES6+ | Lógica | Todos modernos (transpilar para ES5 se necessário) |
| Leaflet.js | Mapas | Todos modernos |
| Geolocation API | GPS | Todos modernos (requer HTTPS) |

##### RSNF-U02 — Design Responsivo

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-U02 |
| **Categoria** | Usabilidade |
| **Prioridade** | Alta |
| **Descrição** | A interface deve ser responsiva e adaptável a diferentes tamanhos de tela |

**Breakpoints:**

| Dispositivo | Largura | Layout |
|-------------|---------|--------|
| Mobile | < 576px | Coluna única, formulário full-width |
| Tablet | 576px - 991px | Dois painéis lado a lado |
| Desktop | 992px - 1199px | Layout completo com mapa e painel lateral |
| Large Desktop | >= 1200px | Layout expandido |

**Testes de Responsividade:**

```css
/* Breakpoints mínimos a testar */
@media (max-width: 575.98px) { /* Mobile */ }
@media (min-width: 576px) and (max-width: 991.98px) { /* Tablet */ }
@media (min-width: 992px) and (max-width: 1199.98px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

##### RSNF-U03 — Acessibilidade (WCAG 2.1)

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-U03 |
| **Categoria** | Usabilidade |
| **Prioridade** | Média |
| **Descrição** | A interface deve atender aos critérios WCAG 2.1 nível A |

**Requisitos de Acessibilidade:**

| Critério | Implementação |
|----------|---------------|
| Texto alternativo em imagens | Atributo `alt` em todas as imagens |
| Contraste mínimo | Razão 4.5:1 para texto normal |
| Navegação por teclado | Todos os elementos interativos acessíveis via Tab |
| Labels em formulários | `label` associado a cada `input` via `for`/`id` |
| Mensagens de erro | Descrições claras de erros de validação |
| Indicador de foco | Visível para elementos em foco |

---

#### 2.1.5 Arquitetura (ISO 25010 — Manutenibilidade)

##### RSNF-A01 — Arquitetura em Camadas (Layered Architecture)

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-A01 |
| **Categoria** | Arquitetura |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve seguir arquitetura em camadas com separação de responsabilidades |

**Camadas Definidas:**

```
┌─────────────────────────────────────────┐
│           CAMADA DE APRESENTAÇÃO        │
│  (HTML5 + CSS3 + JavaScript Vanilla)    │
│  - Formulários HTML5 semânticos         │
│  - Validação client-side                │
│  - Interação com DOM                    │
│  - Comunicação via Fetch API            │
├─────────────────────────────────────────┤
│           CAMADA DE API (REST)          │
│  (Node.js + Express)                    │
│  - Rotas HTTP REST                      │
│  - Middlewares (Auth, Validação, etc.)  │
│  - Controllers (orquestração)           │
├─────────────────────────────────────────┤
│           CAMADA DE NEGÓCIO             │
│  (Services)                             │
│  - Lógica de negócio                    │
│  - Validações complexas                 │
│  - Transformação de dados               │
├─────────────────────────────────────────┤
│           CAMADA DE DADOS               │
│  (Models + Repository)                  │
│  - Acesso ao banco de dados             │
│  - Prepared Statements                  │
│  - Mapeamento objeto-relacional         │
├─────────────────────────────────────────┤
│           BANCO DE DADOS                │
│  (SQLite ou PostgreSQL)                 │
│  - Persistência                         │
│  - Integridade referencial              │
│  - Índices de performance              │
└─────────────────────────────────────────┘
```

**Princípios de Separação:**

| Camada | Responsabilidade | Dependências |
|--------|-----------------|--------------|
| Apresentação | UI/UX, validação visual | API (via HTTP) |
| API/Controllers | Receber requisições, delegar para Services | Services |
| Services | Lógica de negócio | Models |
| Models/Repository | Acesso a dados | Banco de Dados |
| Banco de Dados | Persistência | Nenhuma |

##### RSNF-A02 — Injeção de Dependência

| Campo | Valor |
|-------|-------|
| **ID** | RSNF-A02 |
| **Categoria** | Arquitetura |
| **Prioridade** | Média |
| **Descrição** | As dependências devem ser injetadas para facilitar testes e substituições |

**Exemplo de Injeção de Dependência:**

```javascript
// Controller recebe Service via construtor
class DenunciasController {
  constructor(denunciasService) {
    this.denunciasService = denunciasService;
  }

  async criar(req, res, next) {
    try {
      const denuncia = await this.denunciasService.criar(req.body, req.user);
      res.status(201).json({ message: 'Denúncia criada', denuncia });
    } catch (error) {
      next(error);
    }
  }
}

// Injeção no main.js
const denunciasRepository = new DenunciasRepository(db);
const denunciasService = new DenunciasService(denunciasRepository);
const denunciasController = new DenunciasController(denunciasService);
```

##### RSNF-A03 — Padrão de Nomenclatura

| Camada | Padrão | Exemplo |
|--------|--------|---------|
| Controllers | `*Controller.js` | `DenunciasController.js` |
| Services | `*Service.js` | `UsuariosService.js` |
| Models/Repositories | `*Repository.js` | `DenunciasRepository.js` |
| Middlewares | `*.middleware.js` | `authenticate.middleware.js` |
| Validações | `*.validation.js` | `denuncias.validation.js` |
| Rotas | `*.routes.js` | `denuncias.routes.js` |
| Utils/Helpers | `*.helper.js` | `sanitize.helper.js` |
| Config | `config.js` | `database.js`, `jwt.js` |

---

## 3. Diagramas de Sequência de Backend

### 3.1 DS-BE01 — Fluxo Completo: Rota Express → Middleware → Controller → Service → Banco → Auditoria

```plantuml
@startuml DS_BE01_FluxoCompleto
!theme plain
skinparam sequenceMessageAlign center
skinparam maxMessageSize 250

title Diagrama de Sequência Backend 01:\nFluxo Completo de Criação de Denúncia

participant "Cliente\n(Frontend)" as Client
participant "Express\nRouter" as Router
participant "Middleware\nSanitização" as Sanitize
participant "Middleware\nAutenticação" as Auth
participant "Controller\nDenunciasCtrl" as Controller
participant "Service\nDenunciasService" as Service
participant "Repository\nDenunciasRepo" as Repo
database "SQLite /\nPostgreSQL" as DB
participant "Auditoria\nService" as Audit

== Requisição do Cliente ==

Client -> Router : POST /api/denuncias\nContent-Type: application/json\nAuthorization: Bearer <token>\nBody: { tipo, descricao, lat, lng, ... }
activate Router

== Fase 1: Middlewares Express ==

Router -> Sanitize : 1. Sanitização de Input
activate Sanitize
Sanitize -> Sanitize : express-validator.body()\n.trim().escape().custom()
Sanitize -> Sanitize : Verifica XSS patterns\n<script>, javascript:, onerror=
Sanitize -> Sanitize : Remove caracteres perigosos
Sanitize --> Router : Input sanitizado\nou erro 400
deactivate Sanitize

Router -> Auth : 2. Autenticação JWT
activate Auth
Auth -> Auth : Extrai token do header\nAuthorization: Bearer <token>
Auth -> Auth : jwt.verify(token, JWT_SECRET)
Auth -> Auth : Decodifica payload:\n{ sub, email, perfil, exp }
Auth -> Auth : Verifica expiração
alt Token inválido ou expirado
  Auth --> Router : 401 Unauthorized\n{ error: "Token inválido" }
else Token válido
  Auth -> Auth : req.user = decoded
  Auth --> Router : Autenticado OK
end
deactivate Auth

Router -> Router : 3. Validação de Perfil\nauthorize(['cidadao', 'admin'])
alt Perfil não autorizado
  Router --> Client : 403 Forbidden
else Perfil autorizado
  Router -> Controller : 4. Invoca Controller
end

== Fase 2: Controller ==

activate Controller
Controller -> Controller : Extrai dados do req.body
Controller -> Controller : Valida campos obrigatórios
Controller -> Service : 5. delega para Service\nService.criar(dados, usuario)
activate Service

== Fase 3: Service (Lógica de Negócio) ==

Service -> Service : Valida regras de negócio:\n- termo_aceito === true\n- tipo ∈ enum válido\n- 10 ≤ descricao.length ≤ 1000\n- lat ∈ [-90, 90]\n- lng ∈ [-180, 180]

Service -> Repo : 6. Repository.inserir(dados)
activate Repo

== Fase 4: Repository (Acesso a Dados) ==

Repo -> DB : 7. Prepared Statement\nINSERT INTO reclamacoes\n(tipo, descricao, endereco, lat, lng,\ntermo_aceito, status, usuario_id,\ndata_criacao, data_atualizacao)\nVALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
activate DB
DB -> DB : Executa INSERT parametrizado
DB -> DB : Gera ID auto-increment
DB --> Repo : { id: 42, ... }
deactivate DB

Repo -> Repo : Monta objeto de retorno\n(sem dados sensíveis)
Repo --> Service : { id: 42, tipo: "...", ... }
deactivate Repo

== Fase 5: Auditoria ==

Service -> Audit : 8. Audit.registrar({\n  evento: 'CRIACAO_DENUNCIA',\n  usuario_id: 42,\n  denuncia_id: 42,\n  dados: { tipo, lat, lng },\n  ip: '192.168.1.100',\n  data: new Date()\n})
activate Audit
Audit -> DB : INSERT INTO auditoria\n(evento, usuario_id, dados_json, ip, data_evento)\nVALUES (?, ?, ?, ?, ?)
activate DB
DB --> Audit : OK
deactivate DB
Audit --> Service : Auditoria registrada
deactivate Audit

== Retorno ao Cliente ==

Service --> Controller : { id: 42, tipo: "...", ... }
deactivate Service

Controller -> Controller : Monta resposta HTTP 201
Controller --> Router : res.status(201).json({\n  message: "Denúncia criada",\n  denuncia: { ... }\n})
deactivate Controller

Router --> Client : HTTP 201 Created\n{ message: "Denúncia criada", denuncia: { ... } }
deactivate Router

@enduml
```

---

### 3.2 DS-BE02 — Fluxo de Autenticação com Validação e Bloqueio

```plantuml
@startuml DS_BE02_Autenticacao
!theme plain
skinparam sequenceMessageAlign center

title Diagrama de Sequência Backend 02:\nFluxo de Autenticação com Validação e Bloqueio

participant "Cliente\n(Frontend)" as Client
participant "Express\nRouter" as Router
participant "Middleware\nRate Limit" as RateLimit
participant "Controller\nAuthController" as Controller
participant "Service\nAuthService" as Service
database "SQLite /\nPostgreSQL" as DB
participant "JWT\nService" as JWT

Client -> Router : POST /api/auth/login\nBody: { email, senha }
activate Router

Router -> RateLimit : Rate Limiting
activate RateLimit
RateLimit -> RateLimit : Verifica contador de\nrequisições por IP
RateLimit -> RateLimit : Redis/memória:\nGET rate:192.168.1.1:login
alt Limite excedido (10/min)
  RateLimit --> Client : 429 Too Many Requests\n"Limite excedido"
else Limite OK
  RateLimit -> RateLimit : INCR rate:192.168.1.1:login\nEXPIRE 60
  RateLimit --> Router : Prossegue
end
deactivate RateLimit

Router -> Controller : Invoca AuthController.login()
activate Controller

Controller -> Service : AuthService.autenticar(email, senha)
activate Service

== Verificação de Bloqueio ==

Service -> DB : SELECT id, nome, email, senha_hash,\nperfil, tentativas, bloqueio_ate\nFROM usuarios WHERE email = ?
activate DB
DB --> Service : usuario (null ou objeto)
deactivate DB

alt Usuário não encontrado
  Service -> Service : Incrementa tentativas falsa\n(por segurança, mesma resposta)
  Service --> Controller : Erro 401
  Controller --> Client : 401 "Email ou senha incorretos"
else Usuário encontrado
  Service -> Service : Verifica se conta bloqueada:\nSELECT bloqueio_ate\nWHERE id = ?
  
  alt Conta bloqueada
    Service -> Service : Calcula tempo restante\n(bloqueio_ate - NOW())
    Service --> Controller : Erro 403\n"Conta bloqueada por X minutos"
    Controller --> Client : 403 "Conta bloqueada"
  else Conta ativa
    Service -> Service : bcrypt.compare(senha, senha_hash)
    
    alt Senha incorreta
      Service -> Service : tentativas += 1
      alt tentativas >= 5
        Service -> DB : UPDATE usuarios\nSET tentativas = 0,\nbloqueio_ate = NOW() + 30min\nWHERE id = ?
        DB --> Service : OK
        Service --> Controller : Erro 403\n"Conta bloqueada por 30 minutos"
        Controller --> Client : 403 "Conta bloqueada"
      else tentativas < 5
        Service --> Controller : Erro 401\n"Email ou senha incorretos"
        Controller --> Client : 401 "Email ou senha incorretos"
      end
    else Senha correta
      Service -> DB : UPDATE usuarios\nSET tentativas = 0,\nbloqueio_ate = NULL,\nultimo_login = NOW()\nWHERE id = ?
      DB --> Service : OK
      
      Service -> JWT : jwt.sign({\n  sub: usuario.id,\n  email: usuario.email,\n  perfil: usuario.perfil,\n  iat: Math.floor(Date.now()/1000),\n  exp: Math.floor(Date.now()/1000) + 86400\n}, JWT_SECRET)
      activate JWT
      JWT --> Service : token
      deactivate JWT
      
      Service -> DB : INSERT INTO auditoria\n(evento, usuario_id, dados_json, ip)\nVALUES ('LOGIN', ?, '{"sucesso":true}', ?)
      DB --> Service : OK
      
      Service --> Controller : { token, usuario: { id, nome, email, perfil } }
    end
  end
end

deactivate DB

Controller --> Router : 200 OK\n{ token, usuario: { ... } }
deactivate Controller

Router --> Client : HTTP 200 OK\n{ token: "eyJhbG...", usuario: { ... } }
deactivate Router

@enduml
```

---

### 3.3 DS-BE03 — Fluxo de Exclusão com Confirmação em Duas Etapas

```plantuml
@startuml DS_BE03_Exclusao
!theme plain
skinparam sequenceMessageAlign center

title Diagrama de Sequência Backend 03:\nFluxo de Exclusão Segura com Duas Etapas

participant "Cliente\n(Frontend)" as Client
participant "Express\nRouter" as Router
participant "Middleware\nAuth + Admin" as Auth
participant "Controller\nDenunciasCtrl" as Controller
participant "Service\nDenunciasService" as Service
participant "Repository\nDenunciasRepo" as Repo
database "SQLite /\nPostgreSQL" as DB
participant "Auditoria\nService" as Audit

Client -> Router : DELETE /api/denuncias/42\nAuthorization: Bearer <admin_token>\nX-Confirm-Delete: CONFIRMAR
activate Router

== Middlewares de Segurança ==

Router -> Auth : Autenticação + Verificação de Admin
activate Auth
Auth -> Auth : jwt.verify() → perfil = 'admin'
Auth --> Router : Autorizado
deactivate Auth

Router -> Controller : Invoca Controller.deletar(42, req.headers)
activate Controller

== Validação da Confirmação ==

Controller -> Controller : Verifica header\nX-Confirm-Delete
alt Header ausente ou != "CONFIRMAR"
  Controller --> Router : 400 Bad Request\n{ error: "Confirmação necessária" }
  Router --> Client : 400 "Header X-Confirm-Delete obrigatório"
else Header = "CONFIRMAR"
  Controller -> Service : Service.deletar(42, adminId)
end

activate Service

== Busca da Denúncia ==

Service -> Repo : Repository.buscarPorId(42)
activate Repo
Repo -> DB : SELECT * FROM reclamacoes WHERE id = 42
activate DB
DB --> Repo : denuncia { id, tipo, descricao, ... }
deactivate DB
Repo --> Service : denuncia (objeto completo)
deactivate Repo

alt Denúncia não encontrada
  Service --> Controller : Erro 404 "Denúncia não encontrada"
  Controller --> Client : 404
else Denúncia encontrada
  Service -> Service : Salva dados_completos\npara auditoria

  == Registro de Auditoria (ANTES da exclusão) ==

  Service -> Audit : Audit.registrar({\n  evento: 'EXCLUSAO_DENUNCIA',\n  denuncia_id: 42,\n  dados_completos: { ... },\n  admin_id: adminId,\n  ip: ip,\n  data: new Date()\n})
  activate Audit
  Audit -> DB : INSERT INTO auditoria\n(evento, usuario_id, dados_json, ip, data_evento)\nVALUES ('EXCLUSAO_DENUNCIA', 1, ?, ?, ?)
  activate DB
  DB --> Audit : OK
  deactivate DB
  Audit --> Service : Auditoria registrada
  deactivate Audit

  == Exclusão Permanente ==

  Service -> Repo : Repository.deletar(42)
  activate Repo
  Repo -> DB : DELETE FROM reclamacoes WHERE id = 42
  activate DB
  DB -> DB : Executa DELETE
  DB --> Repo : Linhas afetadas: 1
  deactivate DB
  Repo --> Service : Exclusão confirmada
  deactivate Repo

  Service --> Controller : { mensagem: "Excluída", dados: { ... } }
end

deactivate DB

Controller --> Router : 200 OK\n{ message: "Denúncia excluída permanentemente",\ndenuncia_excluida: { id: 42, ... } }
deactivate Controller

Router --> Client : HTTP 200 OK
deactivate Router

@enduml
```

---

## 4. Diagrama Estrutural de Classes

### 4.1 Diagrama de Classes de Domínio e Controladores (PlantUML)

```plantuml
@startuml DS_Classes_Dominio
!theme plain
skinparam classAttributeIconSize 0
skinparam classFontSize 12

title Diagrama de Classes de Domínio e Controladores\ncom Invariantes OCL

' ============================================================
' CLASSES DE DOMÍNIO
' ============================================================

abstract class "AbstractEntity" as AbstractEntity {
  +id: Integer <<PK>>
  +data_criacao: DateTime
  +data_atualizacao: DateTime
  --
  +validate(): Boolean
  +toJSON(): Object
}

class "Usuario" as Usuario {
  +id: Integer <<PK>>
  +nome: String (3-100)
  +email: String (unique)
  +senha_hash: String (bcrypt)
  +perfil: Enum { cidadao, admin, moderador }
  +ativo: Boolean
  +tentativas_login: Integer
  +bloqueio_ate: DateTime?
  +ultimo_login: DateTime?
  +data_criacao: DateTime
  --
  +criar(dados: Object): Usuario
  +autenticar(senha: String): Boolean
  +estaBloqueado(): Boolean
  +resetarTentativas(): void
  +incrementarTentativas(): void
  +bloquear(duracaoMinutos: Integer): void
  +toJSON(): Object
}

class "Reclamacao" as Reclamacao {
  +id: Integer <<PK>>
  +tipo: Enum { buraco_rua, lixo_acumulado, luz_apagada, agua_parada, outro }
  +descricao: String (10-1000)
  +endereco: String
  +lat: Float (-90 a 90)
  +lng: Float (-180 a 180)
  +termo_aceito: Boolean
  +status: Enum { pendente, em_analise, em_manutencao, resolvido }
  +usuario_id: Integer <<FK>>
  +data_criacao: DateTime
  +data_atualizacao: DateTime
  --
  +criar(dados: Object): Reclamacao
  +atualizarStatus(novoStatus: Enum): Boolean
  +podeAlterarStatus(): Boolean
  +toJSON(): Object
}

class "Auditoria" as Auditoria {
  +id: Integer <<PK>>
  +evento: String
  +usuario_id: Integer <<FK?>>
  +dados_json: String (JSON)
  +ip_address: String
  +user_agent: String
  +data_evento: DateTime
  --
  +registrar(evento: Object): Auditoria
}

class "StatusHistory" as StatusHistory {
  +id: Integer <<PK>>
  +reclamacao_id: Integer <<FK>>
  +status_anterior: Enum
  +status_novo: Enum
  +admin_id: Integer <<FK>>
  +data_alteracao: DateTime
  --
  +registrar(mudanca: Object): StatusHistory
}

' ============================================================
' ENUMS
' ============================================================

enum "TipoProblema" as TipoProblema {
  BURACO_RUA = "Buraco na rua"
  LIXO_ACUMULADO = "Lixo acumulado"
  LUZ_APAGADA = "Luz apagada"
  AGUA_PARADA = "Água parada"
  OUTRO = "Outro"
}

enum "StatusDenuncia" as StatusDenuncia {
  PENDENTE = "Pendente"
  EM_ANALISE = "Em Análise"
  EM_MANUTENCAO = "Em Manutenção"
  RESOLVIDO = "Resolvido"
}

enum "PerfilUsuario" as PerfilUsuario {
  CIDADAO = "cidadao"
  ADMIN = "admin"
  MODERADOR = "moderador"
}

' ============================================================
' CLASSES DE CONTROLLER
' ============================================================

class "UsuariosController" as UsuariosController {
  -usuariosService: UsuariosService
  --
  +criar(req, res, next): Response
  +listar(req, res, next): Response
  +atualizar(req, res, next): Response
  +deletar(req, res, next): Response
}

class "AuthController" as AuthController {
  -authService: AuthService
  -jwtService: JwtService
  --
  +login(req, res, next): Response
  +logout(req, res, next): Response
  +verificarToken(req, res, next): Response
}

class "DenunciasController" as DenunciasController {
  -denunciasService: DenunciasService
  --
  +criar(req, res, next): Response
  +listar(req, res, next): Response
  +buscarPorId(req, res, next): Response
  +atualizarStatus(req, res, next): Response
  +deletar(req, res, next): Response
}

class "RelatoriosController" as RelatoriosController {
  -relatoriosService: RelatoriosService
  --
  +gerar(req, res, next): Response
  +exportarCSV(req, res, next): Response
}

' ============================================================
' CLASSES DE SERVICE
' ============================================================

class "UsuariosService" as UsuariosService {
  -usuariosRepository: UsuariosRepository
  --
  +criar(dados: Object): Usuario
  +listar(filtros: Object): PaginatedResult
  +atualizar(id, dados, adminId): Usuario
  +deletar(id, adminId): Boolean
  +buscarPorEmail(email): Usuario?
}

class "AuthService" as AuthService {
  -usuariosRepository: UsuariosRepository
  -jwtService: JwtService
  --
  +autenticar(email, senha): AuthResult
  +validarToken(token): TokenPayload
  +bloquearConta(usuarioId, minutos): void
}

class "DenunciasService" as DenunciasService {
  -denunciasRepository: DenunciasRepository
  -auditoriaService: AuditoriaService
  --
  +criar(dados, usuario?): Reclamacao
  +listar(filtros, paginacao): PaginatedResult
  +buscarPorId(id): Reclamacao
  +atualizarStatus(id, novoStatus, adminId): Reclamacao
  +deletar(id, adminId): Boolean
  +validarTransicaoStatus(atual, novo): Boolean
}

class "RelatoriosService" as RelatoriosService {
  -denunciasRepository: DenunciasRepository
  --
  +gerarRelatorio(periodo, filtros): Relatorio
  +calcularEstatisticas(dados): Estatisticas
}

class "AuditoriaService" as AuditoriaService {
  -auditoriaRepository: AuditoriaRepository
  --
  +registrar(evento: Object): Auditoria
  +buscarPorDenuncia(denunciaId): Auditoria[]
}

' ============================================================
' CLASSES DE REPOSITORY
' ============================================================

class "UsuariosRepository" as UsuariosRepository {
  -db: Database
  --
  +inserir(dados: Object): Usuario
  +buscarPorId(id: Integer): Usuario?
  +buscarPorEmail(email: String): Usuario?
  +atualizar(id, dados): Usuario
  +deletar(id): Boolean
  +existeEmail(email): Boolean
}

class "DenunciasRepository" as DenunciasRepository {
  -db: Database
  --
  +inserir(dados: Object): Reclamacao
  +buscarPorId(id: Integer): Reclamacao?
  +listar(filtros, paginacao): Reclamacao[]
  +atualizarStatus(id, status): Reclamacao
  +deletar(id): Boolean
  +contarPorStatus(): StatusCount[]
  +contarPorTipo(): TipoCount[]
}

class "AuditoriaRepository" as AuditoriaRepository {
  -db: Database
  --
  +inserir(dados: Object): Auditoria
  +buscarPorEvento(evento): Auditoria[]
  +buscarPorUsuario(usuarioId): Auditoria[]
  +buscarPorPeriodo(inicio, fim): Auditoria[]
}

' ============================================================
' CLASSES DE MIDDLEWARE
' ============================================================

class "AuthenticateMiddleware" as AuthenticateMiddleware {
  --
  +use(req, res, next): void
}

class "AuthorizeMiddleware" as AuthorizeMiddleware {
  -allowedProfiles: String[]
  --
  +use(req, res, next): void
}

class "SanitizeMiddleware" as SanitizeMiddleware {
  --
  +use(req, res, next): void
}

class "RateLimitMiddleware" as RateLimitMiddleware {
  -windowMs: Number
  -max: Number
  --
  +use(req, res, next): void
}

' ============================================================
' INvariantes OCL
' ============================================================

note right of Reclamacao
  **{inv} Invariantes de Status:**
  
  context Reclamacao
  inv statusValido:
    self.status = StatusDenuncia::PENDENTE or
    self.status = StatusDenuncia::EM_ANALISE or
    self.status = StatusDenuncia::EM_MANUTENCAO or
    self.status = StatusDenuncia::RESOLVIDO
  
  inv transicaoPermitida:
    -- Pendente → qualquer
    (self.status_anterior = PENDENTE) implies
      (self.status_novo = EM_ANALISE or
       self.status_novo = EM_MANUTENCAO or
       self.status_novo = RESOLVIDO)
    
    -- Em Análise → Em Manutenção ou Resolvido
    (self.status_anterior = EM_ANALISE) implies
      (self.status_novo = EM_MANUTENCAO or
       self.status_novo = RESOLVIDO)
    
    -- Em Manutenção → Resolvido
    (self.status_anterior = EM_MANUTENCAO) implies
      (self.status_novo = RESOLVIDO)
    
    -- Resolvido → NENHUMA
    (self.status_anterior = RESOLVIDO) implies false
  
  inv resolvidoImutavel:
    -- Se status = Resolvido, não pode ser alterado
    (self.status = RESOLVIDO) implies
      -- Qualquer tentativa de alteração é rejeitada
      self.status_novo = self.status
end note

note left of Usuario
  **{inv} Invariantes de Segurança:**
  
  context Usuario
  inv senhaNuncaExposta:
    -- senha_hash nunca deve ser retornado
    -- nas respostas de API (toJSON exclui)
    not self.ownedAttributes()
      .select(a | a.name = 'senha_hash')
      .forAll(a | a visibility = #private)
  
  inv emailUnico:
    -- Não pode existir dois usuários
    -- com o mesmo email
    Usuario.allInstances()
      ->forAll(u1, u2 |
        u1 <> u2 implies u1.email <> u2.email)
  
  inv bloqueioValido:
    -- Se bloqueio_ate está definido,
    -- deve ser no futuro
    self.bloqueio_ate <> null implies
      self.bloqueio_ate > DateTime::now()
  
  inv tentativasLimitadas:
    -- tentativas_login não pode exceder 5
    self.tentativas_login >= 0 and
    self.tentativas_login <= 5
end note

note bottom of Auditoria
  **{inv} Invariantes de Auditoria:**
  
  context Auditoria
  inv dadosObrigatorios:
    -- dados_json não pode ser vazio
    self.dados_json <> null and
    self.dados_json.size() > 0
  
  inv ipValido:
    -- IP deve ser IPv4 ou IPv6 válido
    self.ip_address.matches(
      '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    ) or self.ip_address.matches(
      '([a-f0-9:]+:+)+[a-f0-9]+'
    )
end note

' ============================================================
' RELACIONAMENTOS
' ============================================================

AbstractEntity <|-- Usuario
AbstractEntity <|-- Reclamacao
AbstractEntity <|-- Auditoria

Usuario "1" -- "0..*" Reclamacao : cria >
Usuario "1" -- "0..*" Auditoria : gera >
Reclamacao "1" -- "0..*" Auditoria : registra >
Reclamacao "1" -- "0..*" StatusHistory : possui >

Reclamacao ..> TipoProblema : utiliza
Reclamacao ..> StatusDenuncia : utiliza
Usuario ..> PerfilUsuario : utiliza
StatusHistory ..> StatusDenuncia : referencia

UsuariosController --> UsuariosService
AuthController --> AuthService
DenunciasController --> DenunciasService
RelatoriosController --> RelatoriosService

UsuariosService --> UsuariosRepository
AuthService --> UsuariosRepository
DenunciasService --> DenunciasRepository
DenunciasService --> AuditoriaService
RelatoriosService --> DenunciasRepository

UsuariosRepository --> DB : Prepared Statements
DenunciasRepository --> DB : Prepared Statements
AuditoriaRepository --> DB : Prepared Statements

AuthenticateMiddleware --> AuthService
AuthorizeMiddleware ..> PerfilUsuario

@enduml
```

---

## 5. Dicionário Técnico de Dados

### 5.1 Schema Físico DDL (SQLite)

```sql
-- ============================================================
-- ARQUIVO: database/schema.sql
-- DESCRIÇÃO: Esquema físico DDL do banco de dados Diário da Cidade
-- COMPATIBILIDADE: SQLite 3.35+ / PostgreSQL 13+
-- ============================================================

-- Habilitar chaves estrangeiras (SQLite)
PRAGMA foreign_keys = ON;

-- Habilitar WAL mode para melhor concorrência (SQLite)
PRAGMA journal_mode = WAL;

-- ============================================================
-- TABELA: usuarios
-- DESCRIÇÃO: Armazena dados de autenticação e perfil dos usuários
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nome            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,  -- bcrypt hash (60 chars)
  perfil          VARCHAR(20) NOT NULL DEFAULT 'cidadao'
                  CHECK (perfil IN ('cidadao', 'admin', 'moderador')),
  ativo           BOOLEAN NOT NULL DEFAULT 1,
  tentativas_login INTEGER NOT NULL DEFAULT 0
                  CHECK (tentativas_login >= 0 AND tentativas_login <= 5),
  bloqueio_ate    DATETIME,  -- NULL = não bloqueado
  ultimo_login    DATETIME,
  data_criacao    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Trigger para atualizar data_atualizacao automaticamente
CREATE TRIGGER IF NOT EXISTS trg_usuarios_update
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
  UPDATE usuarios SET data_atualizacao = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- ============================================================
-- TABELA: reclamacoes
-- DESCRIÇÃO: Armazena denúncias/registrar problemas urbanos
-- ============================================================
CREATE TABLE IF NOT EXISTS reclamacoes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo            VARCHAR(50) NOT NULL
                  CHECK (tipo IN (
                    'Buraco na rua',
                    'Lixo acumulado',
                    'Luz apagada',
                    'Água parada',
                    'Outro'
                  )),
  descricao       TEXT NOT NULL
                  CHECK (LENGTH(descricao) >= 10 AND LENGTH(descricao) <= 1000),
  endereco        VARCHAR(255) NOT NULL,
  lat             REAL NOT NULL
                  CHECK (lat >= -90 AND lat <= 90),
  lng             REAL NOT NULL
                  CHECK (lng >= -180 AND lng <= 180),
  termo_aceito    BOOLEAN NOT NULL DEFAULT 1
                  CHECK (termo_aceito = 1),  -- Deve ser sempre true
  status          VARCHAR(30) NOT NULL DEFAULT 'Pendente'
                  CHECK (status IN (
                    'Pendente',
                    'Em Análise',
                    'Em Manutenção',
                    'Resolvido'
                  )),
  usuario_id      INTEGER,
  data_criacao    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  --
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reclamacoes_tipo ON reclamacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_reclamacoes_status ON reclamacoes(status);
CREATE INDEX IF NOT EXISTS idx_reclamacoes_data ON reclamacoes(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_reclamacoes_usuario ON reclamacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reclamacoes_coordenadas ON reclamacoes(lat, lng);

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER IF NOT EXISTS trg_reclamacoes_update
AFTER UPDATE ON reclamacoes
FOR EACH ROW
BEGIN
  UPDATE reclamacoes SET data_atualizacao = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- ============================================================
-- TABELA: auditoria
-- DESCRIÇÃO: Registra trilha de auditoria de todas as operações críticas
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  evento          VARCHAR(50) NOT NULL
                  CHECK (evento IN (
                    'CRIACAO_USUARIO',
                    'LOGIN',
                    'LOGIN_FALHA',
                    'LOGOUT',
                    'CRIACAO_DENUNCIA',
                    'ALTERACAO_STATUS',
                    'EXCLUSAO_DENUNCIA',
                    'ATUALIZACAO_USUARIO',
                    'ATIVACAO_USUARIO',
                    'DESATIVACAO_USUARIO'
                  )),
  usuario_id      INTEGER,
  dados_json      TEXT NOT NULL,  -- JSON com dados do evento
  ip_address      VARCHAR(45),    -- IPv4 ou IPv6
  user_agent      TEXT,
  data_evento     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  --
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_evento ON auditoria(evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_data ON auditoria(data_evento DESC);

-- ============================================================
-- TABELA: status_historico
-- DESCRIÇÃO: Histórico completo de mudanças de status de cada denúncia
-- ============================================================
CREATE TABLE IF NOT EXISTS status_historico (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reclamacao_id   INTEGER NOT NULL,
  status_anterior VARCHAR(30) NOT NULL,
  status_novo     VARCHAR(30) NOT NULL,
  admin_id        INTEGER NOT NULL,
  observacao      TEXT,
  data_alteracao  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  --
  FOREIGN KEY (reclamacao_id) REFERENCES reclamacoes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  --
  CHECK (status_anterior IN (
    'Pendente', 'Em Análise', 'Em Manutenção', 'Resolvido'
  )),
  CHECK (status_novo IN (
    'Pendente', 'Em Análise', 'Em Manutenção', 'Resolvido'
  ))
);

-- Índices para histórico
CREATE INDEX IF NOT EXISTS idx_status_historico_reclamacao ON status_historico(reclamacao_id);
CREATE INDEX IF NOT EXISTS idx_status_historico_data ON status_historico(data_alteracao DESC);

-- ============================================================
-- VIEWS DE CONSULTA
-- ============================================================

-- View para denúncias com contagem de mudanças de status
CREATE VIEW IF NOT EXISTS vw_denuncias_resumo AS
SELECT
  r.id,
  r.tipo,
  r.descricao,
  r.endereco,
  r.lat,
  r.lng,
  r.status,
  r.data_criacao,
  r.data_atualizacao,
  u.nome AS nome_usuario,
  u.email AS email_usuario,
  (SELECT COUNT(*) FROM status_historico sh
   WHERE sh.reclamacao_id = r.id) AS total_mudancas_status,
  (SELECT sh.data_alteracao FROM status_historico sh
   WHERE sh.reclamacao_id = r.id
   ORDER BY sh.data_alteracao DESC LIMIT 1) AS ultima_mudanca
FROM reclamacoes r
LEFT JOIN usuarios u ON r.usuario_id = u.id;

-- View para estatísticas por tipo
CREATE VIEW IF NOT EXISTS vw_estatisticas_tipo AS
SELECT
  tipo,
  COUNT(*) AS total,
  COUNT(CASE WHEN status = 'Pendente' THEN 1 END) AS pendentes,
  COUNT(CASE WHEN status = 'Em Análise' THEN 1 END) AS em_analise,
  COUNT(CASE WHEN status = 'Em Manutenção' THEN 1 END) AS em_manutencao,
  COUNT(CASE WHEN status = 'Resolvido' THEN 1 END) AS resolvidos
FROM reclamacoes
GROUP BY tipo;

-- View para estatísticas por status
CREATE VIEW IF NOT EXISTS vw_estatisticas_status AS
SELECT
  status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reclamacoes), 2) AS percentual
FROM reclamacoes
GROUP BY status;

-- ============================================================
-- DADOS INICIAIS (Seed Data)
-- ============================================================

-- Usuário administrador padrão (senha: Admin@123)
-- NOTA: Em produção, alterar esta senha imediatamente!
INSERT INTO usuarios (nome, email, senha_hash, perfil)
VALUES (
  'Administrador',
  'admin@diariodacidade.com.br',
  '$2b$12$LJ3m4ys3Gz9HJy4Kz5V6ZuV7d2d2d2d2d2d2d2d2d2d2d2d2d',  -- hash placeholder
  'admin'
);
```

### 5.2 Diagrama ER (Crow's Foot Notation)

```plantuml
@startuml DatabaseER
!theme plain
skinparam linetype ortho

title Diagrama Entidade-Relacionamento — Diário da Cidade

entity "usuarios" as usuarios {
  * id : INTEGER <<PK>>
  --
  nome : VARCHAR(100)
  email : VARCHAR(255) <<UNIQUE>>
  senha_hash : VARCHAR(255)
  perfil : VARCHAR(20) <<CHECK>>
  ativo : BOOLEAN
  tentativas_login : INTEGER <<CHECK>>
  bloqueio_ate : DATETIME
  ultimo_login : DATETIME
  data_criacao : DATETIME
  data_atualizacao : DATETIME
}

entity "reclamacoes" as reclamacoes {
  * id : INTEGER <<PK>>
  --
  tipo : VARCHAR(50) <<CHECK>>
  descricao : TEXT <<CHECK>>
  endereco : VARCHAR(255)
  lat : REAL <<CHECK>>
  lng : REAL <<CHECK>>
  termo_aceito : BOOLEAN <<CHECK>>
  status : VARCHAR(30) <<CHECK>>
  usuario_id : INTEGER <<FK>>
  data_criacao : DATETIME
  data_atualizacao : DATETIME
}

entity "auditoria" as auditoria {
  * id : INTEGER <<PK>>
  --
  evento : VARCHAR(50) <<CHECK>>
  usuario_id : INTEGER <<FK>>
  dados_json : TEXT
  ip_address : VARCHAR(45)
  user_agent : TEXT
  data_evento : DATETIME
}

entity "status_historico" as status_historico {
  * id : INTEGER <<PK>>
  --
  reclamacao_id : INTEGER <<FK>>
  status_anterior : VARCHAR(30) <<CHECK>>
  status_novo : VARCHAR(30) <<CHECK>>
  admin_id : INTEGER <<FK>>
  observacao : TEXT
  data_alteracao : DATETIME
}

usuarios ||--o{ reclamacoes : "cria (0..*)"
usuarios ||--o{ auditoria : "gera (0..*)"
usuarios ||--o{ status_historico : "admin (0..*)"
reclamacoes ||--o{ auditoria : "registra (0..*)"
reclamacoes ||--o{ status_historico : "possui (0..*)"

@enduml
```

---

## 6. Contratos de API RESTful

### 6.1 Rotas Públicas (Sem Autenticação)

| Método | Rota | Descrição | Autenticação | Rate Limit |
|--------|------|-----------|--------------|------------|
| `POST` | `/api/usuarios` | Cadastrar novo usuário | Não | 5/min/IP |
| `POST` | `/api/auth/login` | Autenticar e obter token JWT | Não | 10/min/IP |
| `GET` | `/api/denuncias` | Listar denúncias públicas | Não | 100/min/IP |
| `GET` | `/api/denuncias/:id` | Obter detalhes de denúncia | Não | 100/min/IP |
| `POST` | `/api/denuncias` | Criar nova denúncia | Opcional | 20/hora/IP |

### 6.2 Rotas Administrativas (Autenticação JWT Obrigatória)

| Método | Rota | Descrição | Perfil | Rate Limit |
|--------|------|-----------|--------|------------|
| `GET` | `/api/usuarios` | Listar todos os usuários | admin | 100/min |
| `GET` | `/api/usuarios/:id` | Obter detalhes do usuário | admin | 100/min |
| `PATCH` | `/api/usuarios/:id` | Atualizar perfil/status usuário | admin | 50/min |
| `DELETE` | `/api/usuarios/:id` | Desativar usuário | admin | 10/min |
| `PUT` | `/api/denuncias/:id/status` | Alterar status da denúncia | admin, moderador | 100/min |
| `DELETE` | `/api/denuncias/:id` | Excluir denúncia permanentemente | admin | 10/min |
| `GET` | `/api/relatorios` | Gerar relatório estatístico | admin | 20/min |
| `GET` | `/api/auditoria` | Consultar trilha de auditoria | admin | 50/min |

### 6.3 Detalhes dos Contratos de API

#### 6.3.1 POST /api/usuarios — Cadastro

```
REQUEST:
  Method: POST
  URL: /api/usuarios
  Headers:
    Content-Type: application/json
  Body:
    {
      "nome": "João da Silva",
      "email": "joao@email.com",
      "senha": "Senha@123",
      "confirmar_senha": "Senha@123"
    }

RESPONSE (201 Created):
  Headers:
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
  Body:
    {
      "message": "Usuário cadastrado com sucesso",
      "usuario": {
        "id": 1,
        "nome": "João da Silva",
        "email": "joao@email.com",
        "perfil": "cidadao",
        "data_criacao": "2026-09-02T10:30:00.000Z",
        "ativo": true
      }
    }

RESPONSE (400 Bad Request):
  Body:
    {
      "error": {
        "code": "PAYLOAD_INVALIDO",
        "message": "Dados de entrada inválidos",
        "errors": [
          { "field": "email", "message": "Email inválido" },
          { "field": "senha", "message": "Senha deve ter mínimo 8 caracteres" }
        ]
      }
    }

RESPONSE (409 Conflict):
  Body:
    {
      "error": {
        "code": "CONFLITO",
        "message": "Email já cadastrado no sistema"
      }
    }
```

#### 6.3.2 POST /api/auth/login — Autenticação

```
REQUEST:
  Method: POST
  URL: /api/auth/login
  Headers:
    Content-Type: application/json
  Body:
    {
      "email": "admin@diariodacidade.com.br",
      "senha": "Admin@123"
    }

RESPONSE (200 OK):
  Headers:
    Cache-Control: no-store
  Body:
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "usuario": {
        "id": 1,
        "nome": "Administrador",
        "email": "admin@diariodacidade.com.br",
        "perfil": "admin"
      }
    }

RESPONSE (401 Unauthorized):
  Body:
    {
      "error": {
        "code": "NAO_AUTENTICADO",
        "message": "Email ou senha incorretos"
      }
    }

RESPONSE (403 Forbidden):
  Body:
    {
      "error": {
        "code": "CONTA_BLOQUEADA",
        "message": "Conta temporariamente bloqueada por 30 minutos"
      }
    }
```

#### 6.3.3 POST /api/denuncias — Criar Denúncia

```
REQUEST:
  Method: POST
  URL: /api/denuncias
  Headers:
    Content-Type: application/json
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Body:
    {
      "tipo": "Buraco na rua",
      "descricao": "Existe um buraco muito grande na Rua das Flores, próximo à padaria Central. O buraco tem mais de 1 metro de diâmetro e apresenta risco aos pedestres e veículos.",
      "endereco": "Rua das Flores, 123 - Centro, Barra do Garças-MT",
      "lat": -15.8901,
      "lng": -52.2567,
      "termo_aceito": true
    }

RESPONSE (201 Created):
  Body:
    {
      "message": "Denúncia registrada com sucesso",
      "denuncia": {
        "id": 42,
        "tipo": "Buraco na rua",
        "descricao": "Existe um buraco muito grande na Rua das Flores...",
        "endereco": "Rua das Flores, 123 - Centro, Barra do Garças-MT",
        "lat": -15.8901,
        "lng": -52.2567,
        "termo_aceito": true,
        "status": "Pendente",
        "usuario_id": 5,
        "data_criacao": "2026-09-02T10:30:00.000Z",
        "data_atualizacao": "2026-09-02T10:30:00.000Z"
      }
    }

RESPONSE (422 Unprocessable Entity):
  Body:
    {
      "error": {
        "code": "REGRA_NEGOCIO",
        "message": "É necessário aceitar os Termos de Uso"
      }
    }
```

#### 6.3.4 GET /api/denuncias — Listar Denúncias

```
REQUEST:
  Method: GET
  URL: /api/denuncias?page=1&limit=20&status=Pendente
  Headers:
    Accept: application/json

RESPONSE (200 OK):
  Body:
    {
      "denuncias": [
        {
          "id": 42,
          "tipo": "Buraco na rua",
          "descricao": "Existe um buraco muito grande na Rua das Flores...",
          "endereco": "Rua das Flores, 123 - Centro",
          "lat": -15.8901,
          "lng": -52.2567,
          "status": "Pendente",
          "data_criacao": "2026-09-02T10:30:00.000Z"
        }
      ],
      "paginacao": {
        "pagina_atual": 1,
        "itens_por_pagina": 20,
        "total_itens": 156,
        "total_paginas": 8
      }
    }
```

#### 6.3.5 PUT /api/denuncias/:id/status — Atualizar Status

```
REQUEST:
  Method: PUT
  URL: /api/denuncias/42/status
  Headers:
    Content-Type: application/json
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Body:
    {
      "status": "Em Manutenção"
    }

RESPONSE (200 OK):
  Body:
    {
      "message": "Status atualizado com sucesso",
      "denuncia": {
        "id": 42,
        "status_anterior": "Pendente",
        "status_novo": "Em Manutenção",
        "data_atualizacao": "2026-09-02T14:00:00.000Z"
      }
    }

RESPONSE (400 Bad Request — Transição inválida):
  Body:
    {
      "error": {
        "code": "TRANSICAO_INVALIDA",
        "message": "Não é possível reabrir uma denúncia resolvida"
      }
    }
```

#### 6.3.6 DELETE /api/denuncias/:id — Excluir Denúncia

```
REQUEST:
  Method: DELETE
  URL: /api/denuncias/42
  Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    X-Confirm-Delete: CONFIRMAR

RESPONSE (200 OK):
  Body:
    {
      "message": "Denúncia excluída permanentemente",
      "denuncia_excluida": {
        "id": 42,
        "tipo": "Buraco na rua",
        "data_exclusao": "2026-09-02T14:30:00.000Z"
      }
    }

RESPONSE (400 Bad Request — Sem confirmação):
  Body:
    {
      "error": {
        "code": "CONFIRMACAO_OBRIGATORIA",
        "message": "Header X-Confirm-Delete com valor 'CONFIRMAR' é obrigatório"
      }
    }
```

#### 6.3.7 GET /api/relatorios — Gerar Relatório

```
REQUEST:
  Method: GET
  URL: /api/relatorios?data_inicio=2026-08-01&data_fim=2026-08-31
  Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

RESPONSE (200 OK):
  Body:
    {
      "periodo": {
        "data_inicio": "2026-08-01T00:00:00.000Z",
        "data_fim": "2026-08-31T23:59:59.000Z"
      },
      "resumo": {
        "total_denuncias": 234,
        "por_tipo": [
          { "tipo": "Buraco na rua", "quantidade": 89, "percentual": 38.0 },
          { "tipo": "Lixo acumulado", "quantidade": 67, "percentual": 28.6 },
          { "tipo": "Luz apagada", "quantidade": 45, "percentual": 19.2 },
          { "tipo": "Água parada", "quantidade": 23, "percentual": 9.8 },
          { "tipo": "Outro", "quantidade": 10, "percentual": 4.3 }
        ],
        "por_status": [
          { "status": "Pendente", "quantidade": 112, "percentual": 47.9 },
          { "status": "Em Análise", "quantidade": 45, "percentual": 19.2 },
          { "status": "Em Manutenção", "quantidade": 38, "percentual": 16.2 },
          { "status": "Resolvido", "quantidade": 39, "percentual": 16.7 }
        ],
        "tempo_medio_resolucao_dias": 12.5,
        "denuncias_por_dia": [
          { "data": "2026-08-01", "quantidade": 8 },
          { "data": "2026-08-02", "quantidade": 12 }
        ]
      }
    }
```

---

## 7. Matriz de Rastreabilidade Técnica

### 7.1 Matriz Bidirecional: Requisitos de Usuário ↔ Componentes Técnicos

| Requisito de Usuário | Rota(s) HTTP | Controller | Service | Repository | Tabela(s) BD |
|----------------------|--------------|------------|---------|------------|--------------|
| RU01 — Selecionar Local no Mapa | `GET /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU02 — Preencher Formulário | `POST /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU03 — Aceitar Termos de Uso | `POST /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU04 — Enviar Denúncia | `POST /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes, auditoria |
| RU05 — Visualizar Denúncias no Mapa | `GET /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU06 — Visualizar Lista de Denúncias | `GET /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU07 — Usar Minha Localização GPS | (client-side) | — | — | — | — |
| RU08 — Acessar Termos de Uso | (client-side) | — | — | — | — |
| RU09 — Cadastrar Conta | `POST /api/usuarios` | UsuariosController | UsuariosService | UsuariosRepository | usuarios |
| RU10 — Fazer Login | `POST /api/auth/login` | AuthController | AuthService | UsuariosRepository | usuarios, auditoria |
| RU11 — Acessar Painel Admin | `GET /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU12 — Visualizar Todas as Denúncias | `GET /api/denuncias` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU13 — Alterar Status de Denúncia | `PUT /api/denuncias/:id/status` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes, status_historico, auditoria |
| RU14 — Excluir Denúncia | `DELETE /api/denuncias/:id` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes, auditoria |
| RU15 — Filtrar Denúncias por Status | `GET /api/denuncias?status=` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes |
| RU16 — Visualizar Detalhes da Denúncia | `GET /api/denuncias/:id` | DenunciasController | DenunciasService | DenunciasRepository | reclamacoes, status_historico |
| RU17 — Gerenciar Usuários | `GET/PATCH/DELETE /api/usuarios` | UsuariosController | UsuariosService | UsuariosRepository | usuarios |
| RU18 — Gerar Relatórios | `GET /api/relatorios` | RelatoriosController | RelatoriosService | DenunciasRepository | reclamacoes |

### 7.2 Matriz: Requisitos Não Funcionais × Componentes Técnicos

| Requisito Não Funcional | Componente(s) Técnico(s) | Local de Implementação |
|------------------------|-------------------------|----------------------|
| RSNF-S01 — Criptografia de Senhas | `bcryptjs` | `UsuariosService.criar()`, `AuthService.autenticar()` |
| RSNF-S02 — JWT | `jsonwebtoken` | `AuthService`, `AuthenticateMiddleware` |
| RSNF-S03 — Sanitização XSS | `express-validator`, `helmet`, `escape-html` | `SanitizeMiddleware`, validações |
| RSNF-S04 — SQL Injection | `knex.js` ou Prepared Statements | `*Repository` (todas as queries) |
| RSNF-S05 — Headers Segurança | `helmet` | `app.use(helmet())` no main.js |
| RSNF-S06 — Rate Limiting | `express-rate-limit` | `RateLimitMiddleware` por rota |
| RSNF-S07 — HTTPS | `https` module ou reverse proxy | Configuração de servidor |
| RSNF-P01 — Tempo de Resposta | Profiling, índices de BD | Todas as rotas, `CREATE INDEX` |
| RSNF-P02 — Throughput | Connection pooling | Configuração do banco |
| RSNF-P03 — I/O Não Bloqueante | `async/await`, Event Loop | Todas as operações de I/O |
| RSNF-P04 — Pool de Conexões | `pg.Pool` ou `sqlite3` WAL | `config/database.js` |
| RSNF-C01 — Tratamento de Erros | Global Error Handler | `app.use(errorHandler)` |
| RSNF-C02 — Auditoria | `AuditoriaService` | `AuditoriaMiddleware` |
| RSNF-C03 — Backup | Cron jobs, scripts de backup | `scripts/backup.js` |
| RSNF-U01 — Cross-Browser | CSS/JS compatíveis | Frontend |
| RSNF-U02 — Responsivo | Media queries | Frontend CSS |
| RSNF-U03 — Acessibilidade | WCAG 2.1 | Frontend HTML/CSS |
| RSNF-A01 — Arquitetura Camadas | Separation of concerns | Estrutura do projeto |
| RSNF-A02 — Injeção Dependência | Construtor injection | Controllers → Services → Repos |
| RSNF-A03 — Nomenclatura Padrão | Padrões de nomenclatura | Todos os arquivos |

---

## Referências Normativas

| Norma | Descrição |
|-------|-----------|
| OMG UML 2.5.1 | Unified Modeling Language |
| ISO/IEC/IEEE 29148:2018 | Engenharia de Requisitos |
| ISO/IEC 25010:2011 | Modelo de Qualidade (FURPS+) |
| RFC 7519 | JSON Web Token (JWT) |
| RFC 5322 | Formato de Email |
| OWASP Top 10 | Vulnerabilidades de Segurança |
| WCAG 2.1 | Acessibilidade Web |
| PMBOK 7ª Edição | Gerenciamento de Projetos |

---

**Documento elaborado conforme padrões de engenharia de software e arquitetura de sistemas distribuídos.**
