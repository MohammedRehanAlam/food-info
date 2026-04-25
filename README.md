# 🍽️ AI Food Analyzer

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**AI Food Analyzer** is a state-of-the-art, **100% client-side** web application that allows you to instantly extract highly detailed nutritional information from pictures of your food. 

By leveraging the vision capabilities of top-tier AI models directly in your browser, this app operates without any proprietary backend, meaning **your data and API keys stay entirely on your device**.

---

## ✨ Key Features

- 📸 **Instant Nutritional Breakdown:** Get precise estimates for Calories, Protein, Carbs, Fat, Fiber, Sugar, and Sodium just by uploading a photo.
- 🥗 **Recipe Deconstruction:** The AI visually breaks down the dish and provides an estimated list of core ingredients.
- 🧠 **Multi-Model Support:** Native support for the world's best Vision models:
  - Google Gemini (e.g., `gemini-1.5-pro-latest`)
  - OpenAI (e.g., `gpt-4o`)
  - Anthropic Claude (e.g., `claude-3-5-sonnet`)
  - OpenRouter, Groq, xAI (Grok), Qwen, and DeepSeek.
- 🔐 **Privacy First:** There is **no backend server**. All API calls are made directly from your browser to the AI providers. Your API keys are securely encrypted in your browser's local storage and never transmitted to us.
- 🎨 **Premium Aesthetic:** Features a sleek, responsive, slate/zinc dark-mode dashboard built with pure CSS.

---

## 🚀 Getting Started

Because this is a pure frontend Single Page Application (SPA), getting it running is incredibly simple.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository** (or download the source code):
   ```bash
   git clone https://github.com/your-username/food-analyzer.git
   cd food-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

---

## 📖 How to Use the App

1. **Configure Your Provider:** 
   - Click the **Settings (Gear Icon)** ⚙️ in the top right corner.
   - Select your preferred AI Provider from the sidebar (e.g., Google Gemini).
   - Enter your personal API Key.
   - *(Optional)* Type in a custom model name if you want to use a specific version.
   - Click **Verify Connection** to ensure your key and model are working perfectly.

2. **Upload an Image:**
   - Click the central upload area to select a photo from your device, or simply drag-and-drop an image onto the screen.

3. **Review the Results:**
   - The AI will analyze the image and return a detailed dashboard.
   - Look for the **Confidence Badge** (🟢) next to the food name to see how certain the AI is of its identification.
   - Review your macros, health insights, and learn a **Fun Fact** about your dish!

---

## 🌐 Deploying to GitHub Pages (or any Static Host)

Because this app has no backend, it can be hosted anywhere for **free**!

1. Build the production files:
   ```bash
   npm run build
   ```
2. A new `dist/` folder will be created.
3. Simply upload the contents of the `dist/` folder to GitHub Pages, Netlify, or Vercel. 
4. *That's it!* Users can visit your URL, input their own API keys, and use the app securely.

---

## 🛠️ Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS (Custom Design System, CSS Variables)
- **Icons:** Lucide React

---

## 🤝 Contributing

Contributions are welcome! If you want to add support for a new AI provider, improve the UI, or tweak the AI prompts for better accuracy:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Disclaimer: This app provides nutritional estimations based on AI visual analysis. It is not a substitute for professional medical or dietary advice. Results may vary depending on the clarity of the image and the complexity of the food.*
