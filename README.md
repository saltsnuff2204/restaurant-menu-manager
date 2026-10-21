# Restaurant Menu Manager

A compact full-stack learning project for managing restaurant dishes and drinks. It pairs a Java REST API and PostgreSQL data store with a responsive React dashboard.

## Project status

This is a portfolio refresh of a first-year coursework project. The local create, list, search, filter, and delete flows are implemented; automated tests, authentication, editing, pagination, deployment, and production hardening are not. There is intentionally no live-demo claim: the documented workflow runs locally.

## What it demonstrates

- Java 17 REST endpoints with Spark Java and Gson
- JDBC persistence with prepared statements and PostgreSQL
- Runtime database configuration through environment variables
- React state, derived filtering/statistics, and Vite development proxying
- Tailwind CSS responsive layout and client-side form validation
- Clear HTTP statuses, server-side input validation, and non-leaking API errors

## Architecture

| Layer | Responsibility | Technology |
| --- | --- | --- |
| Dashboard | Add, browse, search, filter, and delete menu items | React 19, Vite 7, Tailwind CSS |
| API | Validate requests and expose JSON endpoints under `/api` | Java 17, Spark Java, Gson |
| Data access | Run parameterized SQL and map rows to domain objects | JDBC |
| Database | Store dishes and drinks in `menu_items` | PostgreSQL |

During development, the browser calls the Vite server. Vite forwards `/api` to the Java process on port `4567`; the Java process connects to PostgreSQL using `DB_URL`, `DB_USER`, and `DB_PASSWORD`.

## Run locally

### Prerequisites

- Java 17 or newer
- Maven 3.9 or newer
- PostgreSQL with an empty database and a user that can create tables
- A Node.js version supported by Vite 7 (Node 20.19+ or 22.12+)

### 1. Configure PostgreSQL

Create a local database named `restaurant_menu` and a least-privileged local user. The application creates the `menu_items` table when the API starts.

Set the required variables in the terminal that will run Maven. On PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/restaurant_menu"
$env:DB_USER = "restaurant_app"
$env:DB_PASSWORD = "<your-local-password>"
$env:PORT = "4567" # optional
```

On bash or zsh:

```bash
export DB_URL='jdbc:postgresql://localhost:5432/restaurant_menu'
export DB_USER='restaurant_app'
export DB_PASSWORD='<your-local-password>'
export PORT='4567' # optional
```

`.env.example` lists the expected names, but the Java application does not auto-load `.env` files. Export the values or add them to your IDE run configuration.

### 2. Start the API

From the project root:

```bash
mvn clean compile
mvn exec:java
```

The health check is available at `http://localhost:4567/api/health`.

### 3. Start the dashboard

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## API

| Method | Path | Purpose | Success |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Basic process health check | `200` |
| `GET` | `/api/menu` | List all menu items | `200` |
| `POST` | `/api/menu/dish` | Create a dish | `201` |
| `POST` | `/api/menu/drink` | Create a drink | `201` |
| `DELETE` | `/api/menu/:id` | Delete one item | `204` or `404` |

Example dish payload:

```json
{
  "name": "Mushroom risotto",
  "price": 12.5,
  "category": "MAIN_DISH",
  "isVegetarian": true
}
```

Example drink payload:

```json
{
  "name": "Iced tea",
  "price": 3.5,
  "category": "DRINK",
  "hasIce": true
}
```

Valid categories are `STARTER`, `MAIN_DISH`, `DESSERT`, and `DRINK`.

## Security scope

This is a local learning demo, not a production service. The write routes have no authentication or authorization, so **do not expose this API to the public internet**. Use a database role limited to the local demo database, keep real credentials out of Git, and terminate public deployments behind appropriate authentication, authorization, HTTPS, rate limiting, and request-size controls.

If a real credential has ever been committed, changing the current file is not enough: rotate the credential and clean the repository history before publishing.

## Verification

```bash
mvn clean package
cd frontend
npm ci
npm run lint
npm run build
```
