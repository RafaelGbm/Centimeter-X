# Centimeter-X — Solução Mobile (Global Solution FIAP "Space Connect")

> App mobile em **React Native + Expo** consumindo uma **API Java Spring Boot**, que entrega
> posicionamento de alta precisão (nível de centímetros) como serviço — combinando correção
> GNSS (GPS/Galileo, do espaço) com uma rede de estações-base terrestres.

---

## 1. Tema e narrativa

**Centimeter-X** é uma plataforma de *High-Precision Positioning as a Service*. O app mobile é o
painel do cliente (agro de precisão, veículos autônomos, drones, topografia) para:

- Cadastrar e gerenciar seus **rovers** (máquinas/dispositivos que recebem a correção).
- Visualizar as **estações-base GNSS** disponíveis e o satélite/constelação em uso.
- Iniciar uma **sessão de correção** e acompanhar a precisão atingida em tempo real.
- Registrar **ocorrências de campo** (perda de sinal, deriva, obstrução) usando GPS + câmera.
- Consultar o **histórico** de sessões e ocorrências.

Encaixe no tema espacial: a solução depende intrinsecamente de dados orbitais (GNSS) corrigidos
por infraestrutura terrestre — exatamente a ponte "espaço + solo" da Global Solution. ODS
relacionadas: Indústria/Inovação (9), Cidades Sustentáveis (11), Fome Zero / agro de precisão (2).

---

## 2. Como cada requisito é coberto (100 pontos)

| Critério | Pontos | Como atendemos |
|---|---|---|
| Interface Mobile | 20 | 6 telas organizadas + componentes reutilizáveis e layout responsivo |
| Navegação e Fluxo | 20 | Fluxo completo: login → listar rovers → detalhe → iniciar sessão → registrar ocorrência → histórico → status |
| Manipulação de Dados | 15 | **Dados reais GNSS da NASA (CDDIS/IGS)** processados pelo backend + AsyncStorage (token/cache offline) |
| Recursos Mobile | 15 | **GPS/localização** (expo-location) e **Câmera** (expo-camera) na tela de ocorrência |
| Tratamento de Erros/Validações | 10 | Validação de formulários, mensagens de erro, permissão negada, falha de rede, 404 |
| Organização do Projeto | 20 | Estrutura por camadas (screens/components/services), README, evidências |

---

## 3. Telas (mínimo 6)

1. **Login / Cadastro** — autenticação contra a API (JWT). *(tela de cadastro/registro)*
2. **Home / Dashboard** — resumo: nº de rovers ativos, última precisão, estações online. *(tela inicial)*
3. **Listagem de Rovers** — lista vinda da API, com pull-to-refresh e busca. *(tela de listagem)*
4. **Detalhe do Rover** — dados do dispositivo, estação-base associada, botão "Iniciar sessão". *(tela de detalhes)*
5. **Sessão / Status de Correção** — mostra a precisão em cm chegando da API + status (FIX/FLOAT/SINGLE). *(tela de confirmação/status)*
6. **Nova Ocorrência** — usa **GPS** para capturar coordenada e **Câmera** para foto do problema; envia para a API.
7. *(extra)* **Histórico** — sessões e ocorrências anteriores.

### Fluxo de uso completo
`Login` → `Dashboard` → `Listar rovers` → `Detalhe` → `Iniciar sessão de correção`
→ (campo) `Registrar ocorrência com GPS+foto` → `Ver histórico` → `Receber status do sistema`.

---

## 4. Arquitetura

```
┌──────────────────────────┐      HTTPS / JSON       ┌──────────────────────────────┐      HTTPS      ┌─────────────────────┐
│   App Mobile (Expo RN)   │  ─────────────────────► │   API Java Spring Boot       │  ─────────────► │  NASA CDDIS / IGS   │
│                          │  ◄───────────────────── │                              │  ◄───────────── │  (dados GNSS)       │
│  - screens/              │   JWT no Authorization  │  - Controllers REST          │   RINEX/SP3/CLK │                     │
│  - components/           │                         │  - Services (cálculo PPP)    │   broadcast nav │  - Earthdata login  │
│  - services/api.ts       │                         │  - Ingestor GNSS (scheduler) │                 │  - IGS products     │
│  - AsyncStorage (token)  │                         │  - Repositories (JPA)        │                 │  - JPL GDGPS        │
│  - expo-location/camera  │                         │  - Entidades: User, Rover,   │                 └─────────────────────┘
└──────────────────────────┘                         │    BaseStation, Session,     │
                                                      │    Occurrence, GnssProduct   │
                                                      │  - Banco: H2 (dev)/Postgres  │
                                                      └──────────────────────────────┘
```

O **Ingestor GNSS** (job agendado no Spring, `@Scheduled`) baixa periodicamente os produtos
do CDDIS/IGS, faz parse e armazena. O cálculo de correção/acurácia consome esses dados reais.

### Visão de escala (produção)

O desenho acima é o MVP, mas a arquitetura já é pensada para crescer sem reescrita:

- **Stateless + horizontal scaling**: API sem estado em memória (JWT, nada de sessão de
  servidor) → roda em N réplicas atrás de load balancer.
- **Ingestor desacoplado**: em produção o ingestor GNSS vira um **worker separado** (ou job
  em fila/scheduler distribuído tipo Quartz/cron k8s), não acoplado ao processo da API, evitando
  que o download pesado do CDDIS afete a latência das requisições.
- **Cache de correções**: produtos GNSS e correções por estação são cacheados (**Redis**), pois
  são os mesmos para todos os rovers de uma região → reduz recomputação.
- **Fotos em object storage**: ocorrências guardam a imagem em **S3/MinIO** (URL no banco), não
  como blob no Postgres — escala e barateia.
- **Banco**: PostgreSQL (PostGIS para consultas geoespaciais de estação mais próxima) desde já;
  H2 só em teste local.
- **Observabilidade**: logs estruturados, métricas (Actuator/Prometheus), tracing — ver `API.md`.
- **Tempo real (evolução)**: status de sessão pode migrar de polling para **WebSocket/SSE**.

A "precisão em centímetros" usa **dados reais e abertos da NASA**, não simulação. O backend
ingere produtos GNSS do **NASA CDDIS** / **IGS** e, a partir deles, calcula e serve as correções:

- **RINEX** (observações das estações terrestres) — `CDDIS`
- **Broadcast ephemeris** (navegação) — posição "grosseira" dos satélites
- **SP3** (órbitas precisas) e **CLK** (relógios precisos) dos produtos IGS — é o que leva de
  ~metros para **centímetros** (PPP — Precise Point Positioning)

O serviço compara a órbita/relógio *broadcast* com os produtos *precisos* para derivar a
correção, e calcula a acurácia resultante por sessão a partir desses dados reais.

---

## 5. Estrutura de pastas (mobile)

```
centimeter-x-app/
├── App.tsx
├── app.json
├── package.json
├── src/
│   ├── navigation/
│   │   └── RootNavigator.tsx        # Stack + Tabs
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── RoverListScreen.tsx
│   │   ├── RoverDetailScreen.tsx
│   │   ├── SessionStatusScreen.tsx
│   │   ├── NewOccurrenceScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── components/
│   │   ├── RoverCard.tsx
│   │   ├── PrecisionBadge.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── FormInput.tsx
│   │   └── EmptyState.tsx
│   ├── services/
│   │   ├── api.ts                   # axios + interceptors (JWT, erros)
│   │   ├── auth.service.ts
│   │   ├── rover.service.ts
│   │   ├── session.service.ts
│   │   └── occurrence.service.ts
│   ├── hooks/
│   │   ├── useLocation.ts           # expo-location + permissão
│   │   └── useCamera.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── utils/
│   │   ├── validators.ts
│   │   └── storage.ts               # AsyncStorage helpers
│   └── types/
│       └── models.ts
└── assets/
```

## 6. Estrutura de pastas (backend Spring Boot)

```
centimeter-x-api/
├── pom.xml
└── src/main/java/io/guardline/centimeterx/
    ├── CentimeterXApplication.java
    ├── config/         # SecurityConfig, CorsConfig, RateLimitConfig, OpenApiConfig
    ├── controller/     # AuthController, RoverController, SessionController, OccurrenceController
    ├── service/        # regras de negócio + cálculo PPP a partir dos produtos GNSS reais
    ├── gnss/           # Ingestor (CDDIS/IGS), parsers SP3/RINEX, motor de correção
    ├── repository/     # Spring Data JPA
    ├── model/          # User, Rover, BaseStation, CorrectionSession, Occurrence, GnssProduct
    ├── dto/            # request/response (nunca expõe entidade direto)
    ├── exception/      # GlobalExceptionHandler (@ControllerAdvice)
    └── security/       # JwtFilter, JwtService, refresh tokens, ownership checks
```

---

## 7. Contrato da API (REST)

O contrato completo (request/response, validações, erros, segurança e modelo de dados) está em
**[`API.md`](./API.md)**. Resumo das rotas:

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | cria usuário |
| POST | `/auth/login` | retorna access token + refresh token |
| POST | `/auth/refresh` | renova o access token |
| GET | `/me` | usuário logado |
| GET/POST/PUT/DELETE | `/rovers` `/rovers/{id}` | CRUD de rovers (filtrado por dono) |
| GET | `/base-stations` `/base-stations/{id}` | estações-base GNSS |
| POST | `/rovers/{id}/sessions` | inicia sessão de correção (acurácia derivada de dados reais NASA) |
| GET | `/sessions` `/sessions/{id}` | histórico / status de sessão |
| POST/GET | `/occurrences` | registra/lista ocorrências (GPS + foto via multipart) |
| GET | `/dashboard` | resumo da tela inicial |

### Exemplo de resposta de sessão
```json
{
  "id": 42,
  "roverId": 7,
  "baseStationId": 3,
  "constellation": "GPS+GALILEO",
  "fixStatus": "FIX",
  "horizontalAccuracyCm": 1.8,
  "verticalAccuracyCm": 3.2,
  "startedAt": "2026-05-26T14:03:11Z"
}
```

---

## 8. Recurso mobile nativo (15 pts)

- **GPS / Localização** (`expo-location`): captura lat/long na tela de ocorrência e mostra no
  detalhe; trata permissão negada com fallback e mensagem clara.
- **Câmera** (`expo-camera` / `expo-image-picker`): foto da ocorrência em campo, enviada à API.

> Descrição para a entrega: *"O app utiliza o GPS do dispositivo para georreferenciar
> ocorrências de campo e a câmera para anexar evidência visual, refletindo o uso real por
> operadores de máquinas agrícolas e topógrafos."*

---

## 9. Tratamento de erros e validações (10 pts)

- Campos obrigatórios + formato (email, senha mínima) em login/cadastro/ocorrência.
- Mensagens de erro amigáveis (toast/Alert) por campo.
- **Permissão negada** de GPS/câmera → tela explicativa com botão "Abrir configurações".
- **Falha de rede / timeout** → estado de erro com botão "Tentar novamente".
- **404 / registro não encontrado** → EmptyState dedicado.
- Interceptor do axios trata `401` (token expirado → logout) globalmente.

---

## 10. Stack e dependências principais

**Mobile**
- `expo`, `react-native`
- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- `axios`
- `@react-native-async-storage/async-storage`
- `expo-location`, `expo-camera` (ou `expo-image-picker`)
- `react-native-maps` — mapa de posicionamento (rover ↔ estação-base, com baseline em km)
- `expo-linear-gradient`, `@expo/vector-icons` — UI

> **Google Maps (Android):** no **Expo Go** o mapa renderiza com a chave do próprio Expo (ok para
> desenvolvimento/demonstração). Para um **build standalone** (APK/AAB/IPA), é obrigatório
> configurar a chave do Google Maps em `app.json` →
> `android.config.googleMaps.apiKey` (e iOS em `ios.config.googleMapsApiKey`). A chave é
> um segredo de build — injetar via variável de ambiente, não commitar.

**Backend**
- Spring Boot 3 (Web, Security, Data JPA, Validation, Scheduling, Actuator)
- JWT access + refresh (jjwt) — ver requisitos de segurança em `API.md`
- PostgreSQL (+ PostGIS) em prod / H2 só em teste; migrações com **Flyway**
- **Redis** (cache de produtos/correções e rate limiting)
- **S3/MinIO** para fotos de ocorrências
- Cliente HTTP para CDDIS/IGS (`RestClient`/`WebClient`) + parser RINEX/SP3
- `springdoc-openapi` (Swagger UI) para documentação viva
- Maven; containerizado com Docker

### Fontes de dados NASA (abertas)

| Fonte | O que fornece | Uso no projeto |
|---|---|---|
| **NASA CDDIS** (`cddis.nasa.gov`) | Arquivo de RINEX, broadcast nav, SP3, CLK | fonte primária; requer login **Earthdata** (token gratuito) |
| **IGS products** | Órbitas precisas (SP3) e relógios (CLK) | correção que leva a centímetros (PPP) |
| **JPL GDGPS** (`gdgps.net`) | Órbita/clock diferencial global | alternativa/validação de correção |

> **Parsing**: SP3 e RINEX são formatos texto bem documentados. Para o MVP o ingestor lê
> SP3 (posições/relógios precisos dos satélites) e broadcast nav, e a diferença entre eles
> alimenta a métrica de correção e a acurácia exibida no app. Bibliotecas Java como
> `gnss-tools`/`georinex`-equivalentes podem ser avaliadas, mas o parser mínimo de SP3 é viável
> à mão.

---

## 11. Como executar

### Backend
```bash
cd centimeter-x-api
./mvnw spring-boot:run          # sobe em http://localhost:8080
```

### Mobile
```bash
cd centimeter-x-app
npm install
npx expo start                  # abrir no Expo Go ou emulador
```
> No `services/api.ts`, apontar `baseURL` para o IP da máquina na rede local
> (ex.: `http://192.168.0.10:8080`) para o celular físico alcançar o backend.

---

## 12. Plano de entrega (checklist)

- [ ] Repositório com `centimeter-x-app/` e `centimeter-x-api/`
- [ ] README com objetivo, tema, instruções de execução e descrição do recurso mobile
- [ ] 6+ telas com navegação funcional
- [ ] Fluxo completo demonstrável
- [ ] Integração real com a API (login + listagem + sessão + ocorrência)
- [ ] GPS + Câmera funcionando
- [ ] Validações e tratamento de erro visíveis
- [ ] Vídeo curto do app rodando
- [ ] Print/evidências de execução
- [ ] Link do repositório

---

## 13. Roadmap de implementação sugerido

1. **Backend mínimo**: entidades + auth JWT + endpoints de rover/session/occurrence (H2 em memória, dados seed).
2. **App esqueleto**: navegação + AuthContext + tela de login integrada.
3. **Listagem e detalhe** de rovers consumindo a API.
4. **Sessão de correção** + tela de status (polling simples).
5. **Ocorrência** com GPS + câmera.
6. **Histórico**, validações finais e estados de erro.
7. README + vídeo + evidências.
