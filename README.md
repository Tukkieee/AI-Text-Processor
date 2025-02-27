# AI-Powered Text Processor

An AI-powered text processing application built with **React.js** that leverages **Chrome's AI APIs** to provide **language detection, text translation, and summarization** features. The app is designed with a **responsive UI**, accessibility support, and **local storage persistence**.

---

## 🚀 Features

✅ **Language Detection** – Automatically detects the language of input text.  
✅ **Translation** – Supports translation between:  
   - 🇬🇧 English (`en`)
   - 🇵🇹 Portuguese (`pt`)
   - 🇪🇸 Spanish (`es`)
   - 🇷🇺 Russian (`ru`)
   - 🇹🇷 Turkish (`tr`)
   - 🇫🇷 French (`fr`)
✅ **Text Summarization** – Summarizes **English text** with:
   - **Summary Type:** Key points, abstract, etc.
   - **Output Format:** Markdown
   - **Length Options:** Short, medium, long
✅ **Chat-Like UI** – Users input text at the bottom, and results appear above.  
✅ **Persistent Storage** – Messages and states are saved using `localStorage`.  
✅ **Accessibility** – ARIA labels and roles ensure screen reader support.  
✅ **Responsive Design** – Works across desktop, tablet, and mobile devices.  

---

## 📦 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Tukkieee/AI-Text-Processor.git
cd ai-text-processor
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Up Chrome AI Origin Trial (Required for APIs)
- [Sign up for the Translator API Origin Trial](https://developer.chrome.com/docs/ai/translator-api)
- Copy the **Origin Trial Token** provided.
- Add it to the `<head>` section of `public/index.html`:
  ```html
  <meta http-equiv="origin-trial" content="YOUR_ORIGIN_TRIAL_TOKEN">
  ```
- Restart your development server.

### 4️⃣ Start the Development Server
```bash
npm run dev
```

### 5️⃣ Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)** to use the app.

---

## 🛠 Technologies Used

- **React.js + Vite** – Modern frontend development
- **TailwindCSS** – Utility-first styling
- **Chrome AI APIs** – Language Detection, Translator, Summarizer
- **LocalStorage** – Persistent message state
- **ARIA Accessibility** – Inclusive design

---

## 📌 Roadmap & Future Improvements

🔹 Add support for **additional AI features** (e.g., Sentiment Analysis)  
🔹 Enhance **UI/UX** with animations & theming  
🔹 Improve **error handling** for API failures  

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 💬 Feedback & Contributions

Feel free to submit issues and pull requests on [GitHub](https://github.com/Tukkieee/AI-Text-Processor).  
If you find this project useful, give it a ⭐! 😊🚀

