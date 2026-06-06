# MediBot-AI

A simple Flask-based medical assistant web app using Google Gemini generative AI for answering health-related questions.

## Features

- Flask web server with a simple chat interface
- Uses `google.generativeai` to generate medical guidance
- Supports CORS and environment-based configuration
- Includes a clean project structure for deployment or local development

## Prerequisites

- Python 3.13+
- Git (optional)
- Google Gemini API key

## Installation

1. Clone the repository or copy the project files.

2. Create and activate a virtual environment:

Windows PowerShell:

```powershell
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

## Setup

1. Copy the example environment file:

```powershell
copy .env.example .env
```

2. Open `.env` and set your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

3. Confirm `app.py` is configured correctly.

## Running the App

Run the Flask app locally:

```powershell
python app.py
```

Open your browser at:

```
http://127.0.0.1:5000
```

## Project Structure

```text
MediBot-AI/
├── .env                  # Local environment variables
├── .env.example          # Example env file template
├── .gitignore            # Git ignore rules
├── app.py                # Flask app entrypoint
├── README.md             # Project documentation
├── requirements.txt      # Python dependencies
├── static/               # CSS and JavaScript assets
│   ├── script.js
│   └── style.css
├── templates/            # HTML templates
│   └── index.html
└── venv/                 # Python virtual environment (not committed)
```

## Notes

- Keep `venv/` out of version control.
- Use `.env` for secrets and API keys.
- If you want to deploy, switch off `debug=True` in `app.py`.

## License

Use this project freely and adapt it for your development needs.
