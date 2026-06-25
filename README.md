# Mohamed Khalil Ben Sedrine — Full Stack Portfolio

A dynamic, state-of-the-art developer portfolio web application built with **Vue 3**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Express + SQLite** (sql.js). It features a fully functional, hidden admin dashboard to manage all sections without editing code.

## 🚀 Features

- **Premium Design & Interactions**: Canvas particle system, mouse-tracking glow, smooth count-up metrics, responsive layouts, and interactive navigation.
- **Dynamic Content**: Data-driven pages loading directly from a local SQLite database.
- **Dynamic Section Visibility**: Toggle any portfolio section on/off. Hiding a section instantly removes it from the page flow and filters it out of the main navigation menu dynamically.
- **Command Palette (⌘K / Ctrl+K)**: Instant keyboard-driven navigation and search.
- **Dark/Light Mode**: Synced theme toggle with localStorage persistence.
- **Advanced Admin Panel**: Hidden administrative gate to manage:
  - Profile & Hero statements with image upload/deletion
  - Spoken languages fluency (native/fluent/professional with interactive circular gauges)
  - Section visibility configuration toggles
  - Skill categories and sub-skill tags
  - Interactive experience timeline (highlighted employer vs client chips)
  - Project cards (case studies: problems, solutions, business impact, and cover image uploads)
  - Education history
  - Technology stack pills
  - Value propositions ("Why Work With Me")
  - Verified Certifications with status tracking (Active, In Progress, Expired)
  - Testimonials
  - PDF CV uploads (Language-specific versions, e.g. EN, FR)
  - Form inquiry inbox (read/unread messages, delete)
  - Security settings (change admin path, change password)

---

## 🛠️ Technology Stack

- **Frontend**: Vue 3 (Composition API), Vite, Pinia, Vue Router, Tailwind CSS, Lucide icons, Axios
- **Backend**: Node.js, Express, sql.js (SQLite compiled to WebAssembly), Multer, BcryptJS, CORS
- **Database**: SQLite (persisted to `data/portfolio.db`)

---

## 📦 Setup & Installation

### 1. Install Dependencies
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 2. Running in Development
You can run both the Vite development server and the Express API server concurrently using a single command:
```bash
npm run dev:all
```
- **Frontend** runs on: [http://localhost:5173](http://localhost:5173)
- **API Backend** runs on: [http://localhost:3001](http://localhost:3001)

Alternatively, you can run them in separate terminals:
```bash
npm run dev      # Start Vite frontend
npm run server   # Start Express backend
```

On first run, the backend will automatically initialize the database schema and seed it with all original content (Volkswagen FS, Cassup, Talend migration, skills, experiences, certifications, etc.).

---

## 🔒 Administrative Control Panel

The admin panel is protected by a hidden URL path and password authentication.

- **Default Hidden URL**: `http://localhost:5173/admin`
- **Default Password**: `admin2026`

> [!IMPORTANT]
> Change the password immediately upon your first login under the **Settings** panel. You can also customize the secret access URL path there.

---

## 🏗️ Production Build

To compile and optimize the frontend application for production:
```bash
npm run build
```
This compiles TypeScript and builds the assets into the `/dist` directory.

To preview the built production bundle:
```bash
npm run preview
```
