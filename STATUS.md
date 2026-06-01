# Centimeter-X — Status da integração App ↔ API

> Snapshot do trabalho de integração entre o app **Expo/React Native** e a API
> **Spring Boot** (repo separado: github.com/luyz-gusta/centimeter-x-api),
> incluindo bugs encontrados rodando o app de verdade num emulador Android
> contra a API real, e o que ainda falta.

Data do snapshot: **2026-06-01**.

---

## ✅ Concluído (no app — neste commit)

### Integração com a API real
- **IDs migrados de `number` → `string` (UUID)** em todo o app: a API usa UUID, o app
  tipava `number`. Atingiu `types/models.ts` (novo `type Id = string`),
  `navigation/types.ts`, todos os `services/*` e o `mockAdapter` (IDs string + regex de rota).
- **Logout real**: `AuthContext.logout` agora chama `POST /auth/logout` para **revogar o
  refresh token** no servidor antes de limpar o storage (best-effort). Validado: após o
  logout, um `/auth/refresh` com o token antigo retorna **401**.
- **Config documentada** (`config/env.ts`): passo-a-passo para apontar ao backend real
  (IP da LAN / `10.0.2.2` no emulador Android, CORS, conta seed).

### Bugs encontrados rodando o app e corrigidos
1. **Crash no detalhe do rover** — `Cannot read property 'join' of undefined`.
   O `baseStation` aninhado no detalhe (`BaseStationRefDTO`) **não traz `constellations`**;
   o app chamava `.constellations.join()` sem proteção. → Render condicional null-safe
   (`RoverDetailScreen.tsx`).
2. **Upload de ocorrência falhava com 415 "Content-Type não suportado"**.
   O `FormData` do React Native envia a parte `data` como `text/plain`, mas o Spring
   `@RequestPart CreateOccurrenceRequestDTO` exige `application/json` (o `API.md` define
   `data` como "part JSON"). → O app agora grava o JSON num arquivo temporário e envia a
   parte `data` como **`application/json`** de verdade (`occurrence.service.ts`,
   via `expo-file-system`). `mockAdapter` atualizado para ler a parte-arquivo.
3. **Edição de rover não pré-selecionava a estação-base** (bloqueava o "Salvar" com
   "Selecione a estação-base"). O form lia `r.baseStationId`, mas o detalhe traz a estação
   aninhada em `baseStation.id`. → `setStationId(r.baseStationId ?? r.baseStation?.id ?? null)`
   (`RoverFormScreen.tsx`).

### Mapa de posicionamento (rover ↔ estação-base)
- Trocado de **react-native-maps (Google Maps)** para **Leaflet + tiles OpenStreetMap
  dentro de um WebView** (`components/PositioningMap.tsx`).
  - Renderiza em **qualquer ambiente** (inclusive onde os IPs do Google estão bloqueados) e
    em **build standalone sem precisar da chave do Google Maps**.
  - Bônus de produção: remove a dependência de `android.config.googleMaps.apiKey`.

### Dependências adicionadas
- `react-native-webview` (mapa Leaflet) e `expo-file-system` (parte `data` como JSON).
  Ambas embarcadas no Expo Go; entram no prebuild normalmente em build standalone.

---

## 🧪 Testado de ponta a ponta (emulador Android × API real)

Fluxo completo dirigido no app, logado como `operador@centimeterx.com`:

| Tela / Fluxo | Resultado |
|---|---|
| Login (JWT, IDs UUID) | ✅ |
| Dashboard (agregados reais) | ✅ |
| Lista de rovers + **busca** (`?search=`) | ✅ |
| Detalhe do rover + **mapa** (Leaflet/OSM) | ✅ |
| **Iniciar sessão** de correção (motor real → FLOAT 5.6 cm) | ✅ |
| **Nova ocorrência**: GPS + câmera + **upload multipart** | ✅ (201; foto recuperável em `image/jpeg`) |
| Histórico (abas Sessões e Ocorrências) | ✅ |
| **Criar rover** (POST) | ✅ |
| **Editar rover** (PUT) | ⚠️ correção aplicada; falta 1 confirmação final na UI |
| Logout (revoga refresh) | ✅ (validado via API) |

---

## ⏳ O que falta

### No app
- [ ] **Confirmar na UI o "Salvar alterações" da edição** (PUT) após a correção da
      pré-seleção de estação (fui interrompido na última confirmação visual).
- [ ] **Testar o cadastro de novo usuário** (`/auth/register`) + **logout pela UI**.
- [ ] **Definir os valores finais** de `USE_MOCK` e `extra.apiBaseUrl` antes da entrega.
      Hoje estão em **`USE_MOCK = false`** e **`http://10.0.2.2:8080/api/v1`** (emulador).
      Para device físico, usar o IP da máquina na LAN.
- [ ] **Produção do mapa**: o tile público do OSM tem política de uso; para escala,
      trocar por um provedor próprio/pago (ou self-host de tiles).

### Na API (repo do colega — github.com/luyz-gusta/centimeter-x-api)
- [ ] **Expor a posição do rover no `RoverDetailDTO`** (`latitude`/`longitude`), vinda da
      última sessão. **Necessário para o mapa mostrar o marcador do rover** contra o backend
      oficial. A API já calcula isso internamente (`RoverService.toDetail`, variável `last`);
      falta só adicionar ao DTO:

  ```java
  // RoverDetailDTO: adicionar os campos
  Double latitude, Double longitude,

  // RoverService.toDetail(...): popular no builder
  .latitude(last == null ? null : last.getRoverLatitude())
  .longitude(last == null ? null : last.getRoverLongitude())
  ```
  *(Já apliquei esse patch no clone local que está rodando para a demo; precisa ir para o
  repo oficial.)*

- [ ] *(Opcional/robustez)* Tornar a parte `data` de `POST /occurrences` tolerante a
      `text/plain` (aceitar `@RequestPart("data") String` e parsear). **Não é mais
      bloqueante**, pois o app passou a enviar a parte como `application/json`.

---

## ▶️ Estado da demo (ambiente local)

- **API** Spring Boot no ar em `http://localhost:8080/api/v1` (perfil H2, dados de seed
  limpos: 4 rovers com baselines realistas, ex.: *Trator John Deere 01* a 7.7 km da BRAZ,
  precisão **1.8 cm**).
- **Metro/Expo** + **emulador Android** rodando o app com `USE_MOCK = false`.
- Conta de demonstração: `operador@centimeterx.com` / senha em `app.seed.demo-password`
  (padrão `Centimeter@2026`).
- **Não resetar o banco** antes da reunião (o reset apaga o refresh token e desloga o app).
