# FlowForge Backend API

A NestJS-based “codeless backend” platform that lets users:
- Create multiple Projects  
- Expose a **single dynamic GraphQL** endpoint per project (`/api/:projectId/graphql`)  
  - **GET** returns `{ message: "Hello World from project <id>" }`  
  - **POST** runs the project-scoped GraphQL API  
- Auto-generate **dynamic REST** CRUD endpoints per entity (`/api/:projectId/:entity`)  
- Pick and connect a **cloud database** (MongoDB, Postgres, MySQL) via a single URI  
- Define Entities & Fields (Resources & FieldDefs)—the system will `CREATE TABLE`/`CREATE COLLECTION`

## Features

- **Multi-tenant routing** via `ProjectMiddleware`  
- **GraphQL** (code-first) for schema management & admin APIs  
- **REST** for user-friendly CRUD on any defined “collection”  
- **Dynamic provisioning**: spins up schemas on user’s cloud DB  
- JWT **authentication** + role-based guards

## 📂 Folder Structure

```
src/
├── auth/                    # JWT Auth, guards, strategies
├── project/
│   ├── dto/                 # GraphQL input types
│   ├── entities/            # Project, ProjectDetails, Resource, FieldDef
│   ├── graphql/             # Resolvers (project, dynamic)
│   ├── services/            # Dynamic REST, Schema provisioning
│   ├── rest/                # Dynamic REST controller
│   ├── project.middleware.ts# Middleware for dynamic routing
│   └── project.module.ts
├── user/                    # User module & service
└── app.module.ts
```

## 🚀 Getting Started

### 1️⃣ Clone & Install

```bash
git clone https://github.com/your-repo/flowforge-backend.git
cd flowforge-backend
npm install
```

### 2️⃣ Configure `.env`

```dotenv
PORT=4000
JWT_SECRET=your_jwt_secret
# Optional base URL (for live URLs)
BASE_URL=http://localhost:4000
```

### 3️⃣ Run Migrations (if using Postgres/MySQL)

Or set `synchronize: true` in `ormconfig` for development.

```bash
npm run typeorm migration:run
```

### 4️⃣ Start the Server

```bash
npm run start:dev
```

## 🌐 API Overview

### 🔑 Authentication

* JWT-based with optional role checks.
* Protected routes use `@UseGuards(GqlJwtAuthGuard)` or REST middleware.

### 📡 Endpoints

#### **GraphQL**

* **Dynamic**: `/api/:projectId/graphql`

  * `GET`: returns `{ message: "Hello World from project <id>" }`
  * `POST`: executes project-specific GraphQL queries
* Example:

  ```graphql
  query {
    projects {
      id
      name
      details { liveUrl }
    }
  }
  ```

#### **REST CRUD**

* **Dynamic**: `/api/:projectId/:entity`

  * `GET`: list records
  * `POST`: create record
  * `PUT`: update record
  * `DELETE`: delete record

#### **Database Setup**

* GraphQL mutation:

  ```graphql
  mutation {
    setDatabaseConfig(
      projectId: "your-project-id",
      config: {
        dbType: POSTGRES,
        connectionUri: "postgresql://user:pass@neon.tech/dbname"
      }
    ) {
      details { dbType connectionUri }
    }
  }
  ```

## 🏗️ How It Works

1. **Create Project** – via GraphQL or REST.
2. **Configure Database** – connect your cloud DB with a single connection URI.
3. **Define Schema** – create `Resource` and `FieldDef` records.
4. **Provisioning** – backend generates tables/collections automatically.
5. **Query** – GraphQL & REST APIs work out of the box.
6. **Dynamic Server** – Each project gets a live URL, e.g.:

   ```
   http://localhost:4000/api/<projectId>/graphql
   http://localhost:4000/api/<projectId>/<entity>
   ```

## ⚙️ Tech Stack

* **NestJS** – scalable Node.js framework
* **TypeORM** – flexible ORM supporting multiple databases
* **GraphQL** – code-first, with Apollo Server
* **MongoDB / Postgres / MySQL** – cloud DB support (Atlas, Neon, PlanetScale)
* **JWT Auth & Role-Based Access** – secure multi-tenant support

## 🛠️ Future Plans

* 🌈 **Schema Designer UI** – drag-and-drop entity & field definitions.
* 🔄 **Real-time Collaboration** – live updates with WebSockets.
* 📈 **Analytics & Monitoring** – API usage metrics per project.
* 🏷️ **Custom Domains & Webhooks** – advanced developer tools.

## 🚨 Dev Tips

* Use **GraphQL Playground** to explore:
  `http://localhost:4000/api/<projectId>/graphql`
* Check **REST CRUD** with Postman or browser:
  `http://localhost:4000/api/<projectId>/<entity>`
* Logs & errors appear in the terminal—watch for schema errors during provisioning.
