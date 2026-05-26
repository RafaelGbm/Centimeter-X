# Centimeter-X — Contrato da API (Spring Boot)

Base URL (dev): `http://localhost:8080/api/v1` (todas as rotas abaixo são relativas a esse prefixo).
Formato: `application/json` em todas as rotas (exceto upload de foto, que é `multipart/form-data`).
Autenticação: **JWT** no header `Authorization: Bearer <token>` (exceto `/auth/*`).

Convenções:
- Datas em **ISO-8601 UTC** (`2026-05-26T14:03:11Z`).
- Coordenadas em graus decimais (WGS84). Acurácia em **centímetros**.
- Erros seguem o formato padrão da seção [Erros](#erros).

---

## Sumário de rotas

| # | Método | Rota | Auth | Descrição |
|---|---|---|---|---|
| 1 | POST | `/auth/register` | ❌ | Cria usuário |
| 2 | POST | `/auth/login` | ❌ | Autentica e retorna access + refresh token |
| 2b | POST | `/auth/refresh` | ❌* | Renova access token a partir do refresh token |
| 3 | GET | `/me` | ✅ | Dados do usuário logado |
| 4 | GET | `/rovers` | ✅ | Lista rovers do usuário |
| 5 | GET | `/rovers/{id}` | ✅ | Detalhe de um rover |
| 6 | POST | `/rovers` | ✅ | Cadastra rover |
| 7 | PUT | `/rovers/{id}` | ✅ | Atualiza rover |
| 8 | DELETE | `/rovers/{id}` | ✅ | Remove rover |
| 9 | GET | `/base-stations` | ✅ | Estações-base GNSS disponíveis |
| 10 | GET | `/base-stations/{id}` | ✅ | Detalhe da estação |
| 11 | POST | `/rovers/{id}/sessions` | ✅ | Inicia sessão de correção |
| 12 | GET | `/sessions` | ✅ | Histórico de sessões |
| 13 | GET | `/sessions/{id}` | ✅ | Detalhe/status de uma sessão |
| 14 | POST | `/occurrences` | ✅ | Registra ocorrência (GPS + foto) |
| 15 | GET | `/occurrences` | ✅ | Histórico de ocorrências |
| 16 | GET | `/dashboard` | ✅ | Resumo para a tela inicial |

---

## 1. POST /auth/register
**Request**
```json
{ "name": "Maria Silva", "email": "maria@fazenda.com", "password": "senha123" }
```
**Validações**: `name` ≥ 2 chars; `email` válido e único; `password` ≥ 6 chars.
**201 Created**
```json
{ "id": 1, "name": "Maria Silva", "email": "maria@fazenda.com" }
```
**Erros**: `409` email já cadastrado, `400` validação.

## 2. POST /auth/login
**Request**
```json
{ "email": "maria@fazenda.com", "password": "senha123" }
```
**200 OK**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "def50200a1b2...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@fazenda.com" }
}
```
`expiresIn` em segundos (access token curto, ~15 min). O refresh token tem validade longa
(ex.: 7 dias), é **rotacionado** a cada uso e pode ser revogado (persistido com hash).
**Erros**: `401` credenciais inválidas. **Rate limited** (ver Segurança).

## 2b. POST /auth/refresh
**Request**
```json
{ "refreshToken": "def50200a1b2..." }
```
**200 OK** → novo `accessToken` + novo `refreshToken` (o anterior é invalidado).
**Erros**: `401` refresh token inválido/expirado/revogado.

## 3. GET /me
**200 OK**
```json
{ "id": 1, "name": "Maria Silva", "email": "maria@fazenda.com" }
```

---

## 4. GET /rovers
Lista os rovers do usuário autenticado. Suporta `?search=` (nome) e paginação `?page=&size=`.
**200 OK**
```json
[
  {
    "id": 7,
    "name": "Trator John Deere 01",
    "type": "AGRICULTURAL",
    "status": "ACTIVE",
    "baseStationId": 3,
    "lastAccuracyCm": 1.8,
    "lastSessionAt": "2026-05-26T13:40:00Z"
  }
]
```
`type`: `AGRICULTURAL | DRONE | AUTONOMOUS_VEHICLE | SURVEY`
`status`: `ACTIVE | IDLE | OFFLINE`

## 5. GET /rovers/{id}
**200 OK**
```json
{
  "id": 7,
  "name": "Trator John Deere 01",
  "type": "AGRICULTURAL",
  "status": "ACTIVE",
  "baseStation": {
    "id": 3,
    "code": "BRAZ",
    "name": "Brasília IGS Station",
    "latitude": -15.9475,
    "longitude": -47.8779,
    "distanceKm": 12.4
  },
  "lastAccuracyCm": 1.8,
  "createdAt": "2026-05-20T10:00:00Z"
}
```
**Erros**: `404` rover não encontrado / não pertence ao usuário.

## 6. POST /rovers
**Request**
```json
{ "name": "Drone Mapper 02", "type": "DRONE", "baseStationId": 3 }
```
**Validações**: `name` obrigatório; `type` no enum; `baseStationId` deve existir.
**201 Created** → mesmo corpo do GET /rovers/{id}.

## 7. PUT /rovers/{id}
Atualiza `name`, `type` ou `baseStationId`. **200 OK** com o rover atualizado.

## 8. DELETE /rovers/{id}
**204 No Content**. **Erros**: `404`.

---

## 9. GET /base-stations
Estações-base GNSS (estações IGS reais). Pode receber `?lat=&lon=` para ordenar por proximidade.
**200 OK**
```json
[
  {
    "id": 3,
    "code": "BRAZ",
    "name": "Brasília IGS Station",
    "latitude": -15.9475,
    "longitude": -47.8779,
    "online": true,
    "constellations": ["GPS", "GALILEO"]
  }
]
```

## 10. GET /base-stations/{id}
**200 OK** → estação + `lastProductUpdate` (quando o ingestor atualizou os produtos GNSS).

---

## 11. POST /rovers/{id}/sessions
Inicia uma sessão de correção. O backend usa os produtos GNSS reais (SP3/CLK do IGS/CDDIS)
associados à estação-base do rover para computar a correção e a acurácia resultante.
**Request** (opcional — posição aproximada do rover vinda do GPS do celular)
```json
{ "latitude": -15.95, "longitude": -47.88 }
```
**201 Created**
```json
{
  "id": 42,
  "roverId": 7,
  "baseStationId": 3,
  "baseStationCode": "BRAZ",
  "constellation": "GPS+GALILEO",
  "fixStatus": "FIX",
  "horizontalAccuracyCm": 1.8,
  "verticalAccuracyCm": 3.2,
  "satellitesUsed": 14,
  "correctionSource": "IGS_RAPID",
  "startedAt": "2026-05-26T14:03:11Z"
}
```
`fixStatus`: `FIX (cm) | FLOAT (dm) | SINGLE (m)`
`correctionSource`: `IGS_FINAL | IGS_RAPID | IGS_ULTRA | BROADCAST`
**Erros**: `404` rover; `409` se não houver produto GNSS disponível para a estação ainda.

## 12. GET /sessions
Histórico do usuário. Filtros: `?roverId=&from=&to=`.
**200 OK** → lista de objetos como o da rota 11.

## 13. GET /sessions/{id}
**200 OK** → uma sessão (mesmo corpo). Usado pela tela de status (pode ser consultado em polling).

---

## 14. POST /occurrences
Registra uma ocorrência de campo (recurso mobile: **GPS + Câmera**).
**Content-Type**: `multipart/form-data` (NÃO base64 em JSON — ver Segurança).

Campos:
- `data` (part JSON):
```json
{
  "roverId": 7,
  "type": "SIGNAL_LOSS",
  "description": "Perda de fix próximo à mata",
  "latitude": -15.9512,
  "longitude": -47.8801
}
```
- `photo` (part binário): imagem JPEG/PNG, **máx 5 MB**.

`type`: `SIGNAL_LOSS | DRIFT | OBSTRUCTION | OTHER`
**Validações**: `roverId` existe e pertence ao usuário; `type` no enum; `description` ≤ 500;
lat/lon obrigatórios e em faixa válida (−90..90 / −180..180); `photo` ≤ 5 MB e content-type de
imagem (validar magic bytes, não só a extensão). A imagem é salva em **object storage** (S3/MinIO),
o banco guarda só a URL.
**201 Created**
```json
{
  "id": 100,
  "roverId": 7,
  "type": "SIGNAL_LOSS",
  "description": "Perda de fix próximo à mata",
  "latitude": -15.9512,
  "longitude": -47.8801,
  "photoUrl": "/occurrences/100/photo",
  "createdAt": "2026-05-26T14:10:00Z"
}
```

## 15. GET /occurrences
Histórico. Filtros: `?roverId=&type=`. **200 OK** → lista.

---

## 16. GET /dashboard
Resumo para a tela inicial.
**200 OK**
```json
{
  "activeRovers": 3,
  "totalRovers": 5,
  "onlineBaseStations": 2,
  "lastAccuracyCm": 1.8,
  "lastSessionAt": "2026-05-26T13:40:00Z",
  "recentOccurrences": 1
}
```

---

## Erros

Formato padrão (todas as falhas):
```json
{
  "timestamp": "2026-05-26T14:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "email deve ser válido",
  "path": "/auth/register",
  "fieldErrors": { "email": "deve ser válido" }
}
```

| Código | Quando |
|---|---|
| 400 | validação de payload (Bean Validation) |
| 401 | sem token / token inválido ou expirado / login incorreto |
| 403 | acessando recurso de outro usuário |
| 404 | recurso não encontrado |
| 409 | conflito (email duplicado, produto GNSS indisponível) |
| 500 | erro inesperado (logar, não vazar stack pro cliente) |

---

## Modelo de dados (entidades JPA)

```
User           (id, name, email, passwordHash, role, createdAt)
RefreshToken   (id, user_id, tokenHash, expiresAt, revokedAt, createdAt)
BaseStation    (id, code, name, latitude, longitude, online, constellations, lastProductUpdate)
Rover          (id, user_id, name, type, status, baseStation_id, createdAt)
CorrectionSession (id, rover_id, baseStation_id, constellation, fixStatus,
                   horizontalAccuracyCm, verticalAccuracyCm, satellitesUsed,
                   correctionSource, startedAt)
Occurrence     (id, rover_id, type, description, latitude, longitude, photoUrl, createdAt)
GnssProduct    (id, baseStation_id, source, epoch, storageRef, ingestedAt)  // produtos NASA/IGS ingeridos
```

Relacionamentos: `User 1—N Rover`, `User 1—N RefreshToken`, `BaseStation 1—N Rover`,
`Rover 1—N CorrectionSession`, `Rover 1—N Occurrence`, `BaseStation 1—N GnssProduct`.
`role`: `USER | ADMIN` (admin gerencia estações/ingestor). IDs internos são sequenciais, mas
considere **UUID** público se não quiser expor volume/ordem de criação.

Use **UTC** em todo timestamp e **migrações Flyway** para versionar o schema (sem `ddl-auto=update`
em produção). Índices em `rover.user_id`, `occurrence.rover_id`, `correction_session.rover_id`,
`base_station(latitude, longitude)` (ou PostGIS) e `refresh_token.tokenHash`.

---

## Observações para o back

- CORS liberado para o app Expo em dev (`*` ou IP da rede local).
- Seed inicial: cadastrar algumas **estações IGS reais** (ex.: `BRAZ` Brasília, `CHPI` Cachoeira
  Paulista, `POVE` Porto Velho) em `BaseStation` para o app já ter dados.
- O **Ingestor GNSS** (`@Scheduled`) popula `GnssProduct` a partir do CDDIS/IGS; a rota 11 lê
  esses produtos para calcular a sessão. Enquanto o ingestor não roda, retornar `409` em /sessions.
- Senhas com BCrypt; nunca retornar `passwordHash`.

---

## Requisitos de Segurança (OBRIGATÓRIOS)

Não são opcionais — fazem parte da definição de pronto de cada rota.

1. **Autenticação**: access token JWT curto (~15 min) + refresh token longo, rotacionado e
   revogável (persistido com hash, nunca em claro). Logout = revogar o refresh token.
2. **Autorização / anti-IDOR**: toda rota com `{id}` DEVE filtrar pelo usuário do token
   (`WHERE user_id = :currentUser`). Nunca confiar só no id da URL. Recurso de outro usuário →
   `404` (não `403`, para não vazar existência). Rotas de admin exigem `role = ADMIN`.
3. **Rate limiting**: `/auth/login`, `/auth/register` e `/auth/refresh` com limite por IP+email
   (ex.: 5/min, bucket no Redis) + backoff. Limite global por usuário nas demais rotas.
4. **Política de senha**: mínimo 8 caracteres; rejeitar senhas vazadas comuns; BCrypt (cost ≥ 10).
5. **Upload de foto**: `multipart`, máx 5 MB, validar **magic bytes** (não extensão), content-type
   imagem; armazenar em S3/MinIO; servir com `Content-Type` correto e `Content-Disposition:
   attachment` (nunca inline/HTML) → evita XSS via arquivo.
6. **Validação de entrada**: Bean Validation em todos os DTOs; rejeitar campos desconhecidos;
   limites de tamanho de corpo; sanitizar strings livres (`description`).
7. **Transporte**: HTTPS obrigatório em produção (HSTS). Segredos (JWT secret, credenciais
   **Earthdata**, chaves S3) só via variáveis de ambiente / secret manager — **nunca no git**.
8. **Headers de segurança**: CORS restrito por ambiente (lista de origens, não `*` em prod),
   `X-Content-Type-Options`, `X-Frame-Options`, CSP onde aplicável.
9. **Não vazar informação**: respostas de erro sem stack trace; logs não registram senha, token
   nem PII sensível; mensagens de login genéricas ("credenciais inválidas").
10. **Auditoria**: registrar login, refresh, criação/remoção de recursos e ações de admin.

## Escalabilidade e contrato de listagem

- **Paginação padrão** em toda rota de listagem (`/rovers`, `/sessions`, `/occurrences`):
  `?page=0&size=20&sort=createdAt,desc`. Resposta envelopada:
```json
{
  "content": [ /* itens */ ],
  "page": 0, "size": 20, "totalElements": 134, "totalPages": 7
}
```
- **Idempotência**: `POST /rovers/{id}/sessions` e `/occurrences` aceitam header
  `Idempotency-Key` para evitar duplicação em retry de rede do app.
- **Cache**: produtos GNSS e correções por estação são compartilhados entre rovers → cachear
  (Redis) com TTL atrelado à validade do produto IGS; `ETag`/`Cache-Control` em `/base-stations`.
- **Stateless**: API sem estado em memória → escala horizontal atrás de load balancer.
- **Ingestor desacoplado** do request path (worker/scheduler próprio).

## Observabilidade

- **Health/readiness**: Spring Boot Actuator (`/actuator/health`, `/actuator/info`).
- **Métricas**: Micrometer → Prometheus (latência por rota, taxa de erro, lag do ingestor).
- **Logs estruturados** (JSON) com correlação por `traceId`; tracing distribuído (OpenTelemetry).
- **Versionamento da API**: prefixo `/api/v1` para permitir evolução sem quebrar o app.
- **Documentação viva**: `springdoc-openapi` expondo Swagger UI a partir deste contrato.
