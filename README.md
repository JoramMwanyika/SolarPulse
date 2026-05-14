# SolarPulse ☀️

SolarPulse is an intelligent, centralized monitoring and analytics dashboard designed for managing distributed photovoltaic (PV) solar energy systems. 

## 🚨 The Problem

As solar fleets scale across commercial, residential, and utility sectors, operations and maintenance (O&M) teams face an avalanche of data. Identifying underperforming arrays, predicting hardware degradation, and synthesizing alerts from fragmented vendor platforms (like Huawei or Deye) often requires tedious manual analysis. When an inverter goes offline or a panel suffers from shading, every minute of downtime directly equates to lost revenue and reduced sustainability impact.

## 💡 The Solution

SolarPulse unifies solar telemetry into a single, highly performant dashboard. It transforms raw data into actionable insights by providing:
- **Fleet-wide Visibility:** Track real-time status across all geographical sites on an interactive map.
- **Advanced KPI Analytics:** Monitor critical metrics like Specific Yield, Performance Ratio (PR), and Efficiency Scores at a glance.
- **Proactive Incident Management:** A real-time alerts feed allows NOC operators to quickly identify, acknowledge, and resolve anomalies.
- **AI-Powered Analysis:** A built-in AI Analyst leverages local Large Language Models (LLMs) to automatically synthesize reports, analyze CSV exports, and answer complex questions regarding your solar array's performance.

## ⚙️ How it Works

SolarPulse is built on a modern, robust tech stack:

1. **Frontend (Next.js & React):** Uses the App Router and Tailwind CSS to deliver a premium, glassmorphic UI with dark-mode aesthetic. 
2. **Data Visualization:** Employs `recharts` for dynamic time-series charts and `leaflet` for interactive geographical maps.
3. **Backend & Database (Supabase):** Securely manages user authentication and stores site configurations, telemetry logs, and alert history.
4. **AI Brain (Ollama):** The application proxies chat requests to a local instance of Ollama (defaulting to the `qwen2.5:0.5b` model). This allows the AI Analyst to securely process user queries and attached CSV data without relying on external third-party cloud AI APIs.

---

## 🛠️ Local Machine Setup

Follow these steps to get SolarPulse running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Supabase](https://supabase.com/) Account (for the database and authentication)
- [Ollama](https://ollama.com/) (installed and running locally for the AI Analyst feature)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SolarPulse.git
cd SolarPulse
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory by copying the example file:
```bash
cp .env.example .env.local
```
Fill in the required Supabase environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Setup the Database
Execute the provided `supabase_schema.sql` script in your Supabase SQL editor to create the necessary tables for sites, alerts, and user roles.

### 5. Setup Local AI (Ollama)
Ensure Ollama is installed on your machine. Pull the required model by running the following command in your terminal:
```bash
ollama run qwen2.5:0.5b
```
*(Note: If you wish to use a different model, update the `model` parameter in `src/app/api/chat/route.ts`)*

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard. 

## 📝 Usage
- **Landing Page:** Navigate to the beautiful hero section and sign up for a new account.
- **Map View:** View your simulated or live fleet across the interactive Leaflet map.
- **Analytics:** Export reports as CSV or save the view as a PDF.
- **AI Analyst:** Head over to `/dashboard/ai-analyst`, attach your exported CSV, and ask the AI brain to find insights or anomalies in your data.
