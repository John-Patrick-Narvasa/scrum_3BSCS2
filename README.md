# Hope, Inc. ERP

**Hope, Inc. Enterprise Resource Planning System**

Hope, Inc. ERP is a web-based Enterprise Resource Planning (ERP) application developed to by BAI group support the company's business operations through a centralized digital management platform.

The project aims to provide an organized, integrated environment for managing business information, employee access, operational records, and administrative activities. It is designed to improve data consistency, simplify workflows, strengthen accountability, and make important business information easier to manage.

## Project Overview

Hope, Inc. ERP is being developed as a centralized system with modular functionality and controlled user access.

The application brings together business management functions and administrative controls in one platform. Its architecture supports structured database management, authentication, role-based authorization, and a consistent approach to handling business records.

## Objectives

- Centralize business information and operational records.
- Improve the organization and accessibility of company data.
- Support consistent business workflows.
- Establish controlled access based on user roles and permissions.
- Maintain accountability through record management and audit history.
- Provide a maintainable foundation for future ERP functionality.

## System Components

The application is organized around the following business areas:

- **Customer Management** – Management of customer information and related records.
- **Product Management** – Organization of product information and pricing-related records.
- **Human Resource Management** – Management of employee and organizational information.
- **Sales Management** – Support for sales transactions and associated records.
- **Payment Management** – Management of payment-related information.
- **Reports** – Access to business information and reporting functions.

The availability and implementation status of individual functions may vary as development progresses.

## User Access and Administration

Hope, Inc. ERP is designed with role-based access control.

Its access-management model includes:

- **Superadmin** – Highest-level administrative authority.
- **Admin** – Administrative access within assigned authority.
- **User** – Standard application access governed by assigned permissions.

The application also supports account-status management, including pending, active, and blocked states.

Permissions are intended to control access to specific application functions and business operations.

## Authentication and Account Security

The project uses Supabase as its authentication and backend platform.

The authentication design includes:

- User authentication.
- Account provisioning and administration.
- Password setup through a one-time invitation or set-password process.
- Password reset functionality.
- Role and permission enforcement.
- Protected administrative operations.

Passwords and privileged credentials must not be committed to the source-code repository.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| TypeScript | Application development and type safety |
| Supabase | Backend services and authentication |
| PostgreSQL | Relational database |
| Zod | Input validation and schema validation |
| SQL migrations | Database schema and access-control changes |

## Development Setup

### Prerequisites

- Node.js and npm
- Git
- A Supabase project
- Access to the project repository

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd scrum_3BSCS2
npm install
```

Create a local environment file named `.env.local` and configure the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
```

Use the appropriate credentials from your Supabase project. Never commit `.env.local` or expose privileged keys in client-side code.

### Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### TypeScript Validation

```bash
npm run lint
```

## Database Migrations

Database schema changes are maintained in:

```text
supabase/migrations/
```

Apply migrations according to the project's Supabase database workflow. Review migration dependencies and verify database changes before considering a migration complete.

## Project Status

Hope, Inc. ERP is an actively developed project. Features, database structures, authentication workflows, and administrative functionality continue to evolve through incremental development and review.

Contributions should follow the established Git branching and pull request workflow. Changes should be reviewed and tested before being merged into the main branch.

---

**Hope, Inc. ERP**  
*A centralized platform for organized and accountable business management.*
