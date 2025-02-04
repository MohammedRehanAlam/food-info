# Food Analyzer App

A simple web application that analyzes food images and provides nutritional information using Google's Gemini AI.

## Quick Start Guide

### 1. Get Google API Key
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key

### 2. Setup Backend
```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API key
echo GOOGLE_API_KEY=your_api_key_here > .env

# Start backend server
uvicorn main:app --reload
```

### 3. Setup Frontend
```bash
# Open a new terminal
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

### 4. Use the App
- Open your browser and go to `http://localhost:3000`
- Drop a food image or click to upload
- Wait for the analysis
- View nutritional information

## Features
- Food recognition using AI
- Nutritional information (calories, protein, carbs, fat)
- Health benefits information
- Simple drag-and-drop interface

## Tech Stack
- Backend: FastAPI + Python
- Frontend: React + Chakra UI
- AI: Google Gemini Vision API 