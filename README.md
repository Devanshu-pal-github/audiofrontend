# 🚀 Commetrix

**Commetrix** is a smart meeting intelligence tool that transforms unstructured conversations into clear, actionable quarterly objectives. Using cutting-edge LLMs (via Groq) and structured processing, it streamlines your meetings from transcript to EOS Rocks.

> ✨ Think of it as your team’s co-pilot for decision tracking, action item extraction, and milestone planning.

---

## 🔧 Features

### 🎙️ Audio Intelligence
- Transcribes long meeting audio (supports chunked files)
- Handles retry logic and timeouts gracefully

### 🧠 NLP & Semantic Extraction
- Identifies:
  - Action items
  - People, organizations, dates
  - Major initiatives and strategic themes

### 📈 EOS Rocks Generator
- Converts analysis into structured **EOS-style rocks**
- Includes SMART objectives, timelines, milestones, and ownership
- Outputs clean JSON, ready for dashboards or automation

### 💻 CSV Upload Interface (Frontend)
- Built with **React + Vite + TailwindCSS**
- Accepts `.csv` files with team data (names & roles)
- Includes topic + description inputs
- Beautiful, responsive UI with **Lucide-react** icons

---

## 🖥️ Tech Stack

| Layer       | Tools / Libraries                          |
|------------|---------------------------------------------|
| UI         | React, TailwindCSS, Vite, Lucide-react      |
| Backend    | Python 3.10+, asyncio, Groq SDK, dotenv     |
| NLP        | spaCy, custom summarization + chunk logic   |
| AI Model   | Groq API (Mixtral-8x7b-32768 or similar)    |
| File I/O   | JSON, CSV, Whisper (if enabled for audio)   |

---

## 📁 Project Structure

```
commetrix/
├── backend/
│   ├── script1_transcribe_audio.py
│   ├── script2_semantic_tokenizer.py
│   ├── script3_meeting_analyzer.py
│   └── script4_rocks_generator.py
├── frontend/
│   └── UploadCsv.jsx
├── public/
│   └── ...
├── .env
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/commetrix.git
cd commetrix
```

### 2. Setup Environment

#### Backend (`.env`)
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=mixtral-8x7b-32768
```

#### Install Python Requirements

```bash
cd backend
pip install -r requirements.txt
```

> Note: You’ll need Python ≥ 3.10

### 3. Run Processing Pipeline

```bash
# Transcribe Audio (optional if using text input)
python script1_transcribe_audio.py your_audio_file.mp3

# Extract Semantic Tokens
python script2_semantic_tokenizer.py transcriptions.json

# Analyze the Meeting
python script3_meeting_analyzer.py semantic_tokens.json

# Generate EOS Rocks JSON
python script4_rocks_generator.py meeting_analysis.json
```

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Then open: [http://localhost:5173](http://localhost:5173)

---

## 📦 Output Format

Sample `meeting_rocks_final.json`:

```json
{
  "session_summary": "Reviewed Q3 goals, aligned on product roadmap.",
  "rocks": [
    {
      "rock_title": "Launch v2 of the analytics dashboard",
      "owner": "Priya Shah (Product Manager)",
      "smart_objective": "...",
      "milestones": [...],
      "review": {
        "status": "Approved",
        "comments": "Aligned with roadmap"
      }
    }
  ],
  "compliance_log": {
    "transcription_tool": "Python Speech Recognition",
    "genai_model": "Groq mixtral-8x7b-32768",
    "facilitator_review_timestamp": "2025-07-04T12:34:56",
    "data_storage_platform": "Local Processing",
    "processing_pipeline_version": "1.0"
  }
}
```

---

## 🌌 Why “Commetrix”?

Inspired by *comets* — fast, purposeful, and illuminating — **Commetrix** helps track the trajectory of your business decisions, aligning team communication with measurable execution.

---

## 📌 Roadmap

- [x] CSV Role-Based Team Uploader
- [x] Semantic Analyzer with Groq LLM
- [x] EOS Rocks Generator
- [ ] Frontend JSON viewer
- [ ] GCal / Slack integration
- [ ] PDF + Notion sync

---

## 📝 License

MIT — open for contribution and adaptation.

---

## 🤝 Contributing

1. Fork this repo
2. Create a new branch: `feature/your-idea`
3. Submit a PR with a clear explanation

---

## 📬 Contact

Want to collaborate or suggest a feature?  
Email: `team@commetrix.io` (placeholder)  
Or DM the maintainer via GitHub.
