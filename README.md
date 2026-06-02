<div align="center">
  <img src="centimeter-x-app/assets/logo.png" alt="Centimeter-X" width="300" />

  <h1>Centimeter-X</h1>

  <p><strong>Posicionamento GNSS de alta precisão (nível de centímetros) como serviço.</strong></p>

  <p>
    <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white" />
    <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
    <img alt="Spring Boot" src="https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?logo=springboot&logoColor=white" />
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
  </p>

  <p><em>Global Solution FIAP — edição Space Connect</em></p>
</div>

---

## 📌 Visão geral

O **Centimeter-X** é o aplicativo cliente de uma plataforma de **High-Precision
Positioning as a Service**. Ele combina a **correção GNSS** dos satélites (GPS/Galileo) com
uma rede de **estações-base terrestres** para entregar localização em **nível de
centímetro** — algo que o GPS comum (3–10 m) não alcança.

Pelo app, o operador cadastra seus equipamentos ("rovers"), inicia sessões de correção,
acompanha a precisão atingida em tempo real e registra ocorrências de campo com GPS e
câmera. O processamento pesado — o cálculo da correção a partir de dados reais de órbita e
solo — fica no **backend Java/Spring Boot**, que ingere produtos abertos da **NASA (CDDIS /
IGS)**.

**Clientes-alvo:** agricultura de precisão, veículos autônomos, drones e topografia.

## 🛰️ Tema — Space Connect

A solução depende intrinsecamente da ponte **espaço + solo**: o sinal dos satélites GNSS é
corrigido por infraestrutura terrestre e por **produtos abertos da NASA** — órbitas precisas
(**SP3**), relógios (**CLK**) e observações (**RINEX**). É o uso de tecnologia espacial para
resolver desafios reais na Terra.

**ODS relacionadas:** 9 (Indústria e Inovação), 11 (Cidades Sustentáveis), 2 (Fome Zero /
agricultura de precisão).

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** — login e cadastro com validação, *access token* + *refresh token*
  rotacionável, logout que revoga a sessão no servidor.
- 📊 **Dashboard** — resumo da operação (rovers ativos, estações online, última precisão).
- 🚜 **Gestão de rovers** — CRUD completo, busca e *pull-to-refresh*.
- 🗺️ **Mapa de posicionamento** — rover ↔ estação-base com a *baseline* (km), via OpenStreetMap.
- 📡 **Sessão de correção** — inicia o serviço e exibe a precisão atingida (FIX/FLOAT/SINGLE),
  satélites usados, constelação e fonte da correção.
- 📷 **Ocorrências de campo** — registro georreferenciado com **GPS + câmera**.
- 🕑 **Histórico** — sessões e ocorrências anteriores.

## 📱 Telas

`Login` · `Cadastro` · `Dashboard` · `Lista de rovers` · `Detalhe do rover` ·
`Sessão / Status de correção` · `Nova ocorrência` · `Histórico`

**Fluxo completo:** `Login → Dashboard → Listar rovers → Detalhe → Iniciar sessão →
Registrar ocorrência (GPS + foto) → Histórico`.

## 🧩 Recursos mobile nativos

| Recurso | Biblioteca | Uso |
|---|---|---|
| **GPS / Localização** | `expo-location` | Georreferencia ocorrências e a posição do rover; trata permissão negada |
| **Câmera** | `expo-image-picker` | Anexa evidência visual (foto) à ocorrência |
| **Mapa** | `react-native-webview` + Leaflet + OpenStreetMap | Visualiza rover ↔ estação-base sem depender de chave do Google Maps |

### Descrição do recurso mobile utilizado

O **Centimeter-X** utiliza dois recursos nativos do dispositivo, ambos na tela de **Nova
ocorrência**:

- **GPS / Localização** (`expo-location`) — captura as coordenadas (latitude/longitude) do
  operador no momento em que ele registra uma ocorrência de campo, georreferenciando o
  problema relatado. A mesma localização é usada para estimar a posição do rover ao iniciar
  uma sessão de correção.
- **Câmera** (`expo-image-picker`) — abre a câmera do aparelho para o operador anexar uma
  **foto como evidência visual** da ocorrência (perda de sinal, obstrução, deriva), que é
  enviada ao backend junto com os dados.

Esses recursos refletem o uso real por **operadores de máquinas agrícolas e topógrafos** em
campo. O app trata explicitamente a **permissão negada** de GPS e câmera, exibindo mensagem
clara e orientando o usuário a habilitar o acesso nas configurações. Há ainda um **mapa**
(Leaflet + OpenStreetMap) que torna visível a relação espacial **rover ↔ estação-base** e a
*baseline* entre eles.

## 🏛️ Arquitetura

```
┌──────────────────────────┐     HTTPS / JSON      ┌──────────────────────────────┐    HTTPS     ┌─────────────────────┐
│   App Mobile (Expo RN)   │ ───────────────────►  │   API Java Spring Boot       │ ───────────► │   NASA CDDIS / IGS  │
│                          │ ◄───────────────────  │                              │ ◄─────────── │   (dados GNSS)      │
│  - screens / components  │   JWT (Authorization) │  - Controllers REST          │  RINEX/SP3/CLK│                     │
│  - services (axios)      │                       │  - Services (cálculo PPP)    │              │  - Earthdata login  │
│  - context (Auth)        │                       │  - Ingestor GNSS (@Scheduled)│              │  - IGS products     │
│  - SecureStore (tokens)  │                       │  - Repositories (JPA)        │              └─────────────────────┘
│  - expo-location/camera  │                       │  - PostgreSQL / H2 + Flyway  │
└──────────────────────────┘                       └──────────────────────────────┘
```

A "precisão em centímetros" usa **dados reais e abertos da NASA**, não simulação: o backend
compara a órbita/relógio *broadcast* com os produtos *precisos* (SP3/CLK do IGS) para derivar
a correção e a acurácia por sessão (PPP — *Precise Point Positioning*).

> O backend é mantido em um repositório separado. Este repositório contém o **app mobile** e
> o contrato que ele consome.

## 🧱 Stack

**Mobile**
- React Native + **Expo** (SDK 56), **TypeScript**
- **React Navigation** (stack + bottom tabs)
- **Axios** com interceptors (JWT, *refresh* automático, normalização de erros)
- **expo-secure-store** (tokens), **AsyncStorage** (cache), **expo-location**,
  **expo-image-picker**, **react-native-webview** (mapa), **expo-file-system**
- **expo-linear-gradient** + **@expo/vector-icons** (UI)

**Backend** (repositório separado)
- Spring Boot 3 (Web, Security, Data JPA, Validation, Scheduling, Actuator)
- JWT (access + refresh), BCrypt, rate limiting, PostgreSQL (+ PostGIS) / H2, Flyway
- Cliente para CDDIS/IGS + parser RINEX/SP3 · `springdoc-openapi` (Swagger)

## 🔌 Contrato da API (REST)

Base: `/<host>/api/v1` · `application/json` (exceto upload de foto: `multipart/form-data`) ·
`Authorization: Bearer <token>` (exceto `/auth/*`) · datas em ISO-8601 UTC.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cria usuário |
| `POST` | `/auth/login` | Autentica → access + refresh token |
| `POST` | `/auth/refresh` | Renova o access token |
| `POST` | `/auth/logout` | Revoga o refresh token |
| `GET` | `/me` | Usuário logado |
| `GET·POST·PUT·DELETE` | `/rovers` · `/rovers/{id}` | CRUD de rovers (filtrado por dono) |
| `GET` | `/base-stations` · `/base-stations/{id}` | Estações-base GNSS |
| `POST` | `/rovers/{id}/sessions` | Inicia sessão de correção |
| `GET` | `/sessions` · `/sessions/{id}` | Histórico / status de sessão |
| `POST·GET` | `/occurrences` | Registra/lista ocorrências (GPS + foto via multipart) |
| `GET` | `/dashboard` | Resumo da tela inicial |

Listagens são paginadas e envelopadas (`{ content, page, size, totalElements, totalPages }`).
Erros seguem o formato `{ timestamp, status, error, message, path, fieldErrors }`.

## 🔒 Segurança

- **Autenticação** com access token curto + refresh token rotacionável e revogável (logout
  real, persistido com hash).
- **Autorização anti-IDOR**: toda rota com `{id}` filtra pelo usuário do token — recurso de
  outro usuário retorna `404`.
- **Tokens no dispositivo** guardados no `expo-secure-store` (Keychain / Keystore).
- **Rate limiting** em `/auth/*`, **política de senha** (mín. 8 caracteres, BCrypt).
- **Upload** de foto: `multipart`, máx. 5 MB, validação por *magic bytes*.
- **Validação de entrada** (Bean Validation) e respostas de erro sem *stack trace*.

## 📂 Estrutura

```
centimeter-x-app/
├── App.tsx
├── app.json
└── src/
    ├── components/   # UI reutilizável (botão, card, badge, input, mapa, splash…)
    ├── screens/      # telas (login, dashboard, rovers, sessão, ocorrência, histórico)
    ├── navigation/   # stacks + tabs
    ├── services/     # cliente axios + serviços REST + adaptador mock
    ├── context/      # AuthContext
    ├── hooks/        # useLocation, useCamera
    ├── utils/        # validação, geo (haversine), labels, storage
    ├── types/        # modelos do domínio
    ├── config/       # env (API base URL, modo de teste)
    └── theme/        # design system (cores, gradientes, tipografia)
```

## ▶️ Como executar

**Pré-requisitos:** Node 18+, npm e o app **Expo Go** (celular) ou um **emulador
Android/iOS**.

```bash
cd centimeter-x-app
npm install
npx expo start
```

- Pressione **`a`** (emulador Android) ou **`i`** (iOS), ou escaneie o QR code com o **Expo Go**.

### Modo de teste (sem backend)

Com a flag `USE_MOCK = true` em [`src/config/env.ts`](centimeter-x-app/src/config/env.ts), o
app roda com **dados simulados em memória**. Na tela de login, toque no box **"Modo de
teste"** para preencher as credenciais de demonstração.

### Apontando para o backend real

Defina `USE_MOCK = false` e ajuste `extra.apiBaseUrl` em
[`app.json`](centimeter-x-app/app.json). Em **emulador Android**, use `http://10.0.2.2:8080/api/v1`;
em **dispositivo físico**, o IP da máquina na rede local (ex.: `http://192.168.0.10:8080/api/v1`).

## ✅ Cobertura dos requisitos

| Critério | Onde |
|---|---|
| Interface mobile | Telas organizadas + componentes reutilizáveis (`src/screens`, `src/components`) |
| Navegação e fluxo | Login → rovers → detalhe → sessão → ocorrência → histórico (`src/navigation`) |
| Manipulação de dados | Serviços REST + estado + SecureStore/AsyncStorage; dados reais NASA/IGS no backend |
| Recursos mobile | GPS + câmera (`src/hooks`) e mapa (`PositioningMap`) |
| Tratamento de erros/validações | Validação de formulários, permissão negada, falha de rede, 404 |
| Organização do projeto | Arquitetura em camadas, TypeScript, este README |

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`centimeter-x-app/LICENSE`](centimeter-x-app/LICENSE).
