# AI Event Concierge 🌟

A high-performance, professional AI assistant built for planning corporate offsites and team retreats. Get structured venue proposals, cost breakdowns, and expert justifications from a single natural language description.

## 🔗 Demo
[Update with your live demo link here later]

## ✨ Key Features
- **Natural Language Planning:** Simply type your requirements (e.g., "15 people, 3 days in Bali, $10k budget") and get a full proposal.
- **Premium Shadcn/UI:** A minimalist, high-end interface with rich detailing, dark mode support, and sleek animations.
- **Multi-Model AI Fallback:** Tiered logic that instantly switches between Gemini models (`2.5-flash-lite`, `1.5-pro`, etc.) if one is unavailable.
- **Cost Range & Itemized Breakdown:** Get both a total estimated range and a specific item-by-item cost breakdown for your event.
- **Persistent History:** Every search is securely saved to MongoDB Atlas, allow you to review past explorations anytime.
- **Smart Deletion:** Easily remove individual proposals from your history with a single click.
- **Maps Integration:** Instantly open proposed venues in Google Maps to check real-world surroundings.

## 🛡️ Edge Cases & Security Handled
- **Prompt Injection Protection:** The AI is hardened with strict instructions to ignore "ignore previous instructions" or "forget your role" overrides.
- **Input Validation:** Backend validation prevents excessively large prompts (1000 char limit) or empty requests from straining resources.
- **JSON Integrity:** The system enforces a strict JSON schema output, ensuring the UI never breaks even with complex AI responses.
- **API Resilience:** Automatic retry logic across multiple generative models ensures the service remains active during high-demand peaks.

## 🛠️ Technology Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide Icons.
- **Backend:** Next.js API Routes (Node.js runtime).
- **AI:** Google Gemini API (multiple models).
- **Database:** MongoDB Atlas (MDB Driver).

## 🚀 Local Setup Instructions

### 1. Prerequisites
- Node.js 20+
- A MongoDB Atlas connection string.
- A Google Gemini API Key.

### 2. Clone and Install
```bash
git clone [your-repo-url]
cd ai-event-concierge
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start planning!