# Portfolio CV Template

A customizable portfolio/CV website built with Vue 3, Express, Turso, and Cloudinary.

> Fork this repo, fill in your `.env`, and have a fully-featured portfolio live in minutes — no code changes needed.

---

## ✨ Features

- 🌗 Responsive dark/light mode
- 🔐 Admin panel with full CRUD for all portfolio sections
- 📄 CV upload and management (PDF, multiple languages)
- 🖼️ Profile image upload via Cloudinary
- 📬 Contact form with admin inbox
- 👁️ Section visibility toggles — show/hide any section instantly
- 🌍 Multi-language support (spoken languages with proficiency levels)
- 🛡️ JWT authentication, rate limiting, Helmet security headers
- 🗄️ Turso (LibSQL) database — free tier, serverless SQLite

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vite, TypeScript, Pinia, Vue Router |
| Styling | Tailwind CSS |
| Backend | Express (Node.js) |
| Database | Turso (libsql / SQLite) |
| File Storage | Cloudinary |

---

## 📋 Prerequisites

- **Node.js 18+**
- A **Turso** database — free tier at [turso.tech](https://turso.tech)
- A **Cloudinary** account — free tier at [cloudinary.com](https://cloudinary.com)

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Medkhalilbs/Me.git my-portfolio
cd my-portfolio

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and fill in your Turso, Cloudinary, JWT_SECRET, etc.

# 4. Start the development server
npm run dev
```

5. Open **http://localhost:5173** to see the portfolio
6. Navigate to **http://localhost:5173/{ADMIN_PATH}** (default: `/admin`) to access the admin panel
7. The admin password is set via `ADMIN_INITIAL_PASSWORD` in your `.env`.  
   If not set, a random password is **generated on first boot** and printed to the console — check the terminal output!

---

## ☁️ Deployment on Render

1. Create a new **Web Service** on [render.com](https://render.com), connect your GitHub repo
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm run start`
4. Add all environment variables from `.env.example` in the Render dashboard
5. ⚠️ **Do NOT set `NODE_ENV`** — Render sets it automatically. Setting it manually can break devDependency installation during build
6. Optionally add a custom domain in Render → Settings → Custom Domains

---

## 🎨 Customization

All portfolio content is editable via the **admin panel** — no code changes needed:

- **Profile**: name, title, photo, bio, contact details, social links
- **Sections**: toggle visibility, change sort order, edit titles/subtitles/badges
- **Experience, Projects, Education, Skills, Certifications**: full CRUD
- **CV**: upload multiple PDFs (EN, FR, etc.), set a default

The color scheme uses CSS custom properties (variables) defined in `src/assets/css/`. Edit them to match your brand.

---

## 📜 License

MIT License — see [LICENSE](LICENSE) file for details.
