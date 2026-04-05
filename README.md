# 🏥 AI Health Assistant Pro

**Your 24/7 Personal Health Companion**

An intelligent web-based health assistant powered by AI that provides personalized health advice, symptom checking, fitness tracking, and wellness tips.

## ✨ Features

### 💬 AI-Powered Chat
- Real-time health advice and medical guidance using GPT-4O Mini
- Natural language conversation interface
- Chat history saved locally
- Export chat conversations

### 🩺 Symptom Checker
- Quick symptom selection (Cold, Headache, Fever, etc.)
- Custom symptom description
- AI-powered symptom analysis and recommendations

### 📊 Health Metrics
- **BMI Calculator** - Calculate BMI with multiple unit support (inches, cm, meters)
- **Water Intake Tracking** - Track daily water consumption
- **Sleep Logger** - Log and monitor sleep patterns
- **Exercise Tracker** - Record workouts and fitness activities

### 💪 Exercise Library
- Pre-defined exercise routines
- Fitness recommendations
- Workout guidance and tips

### 💡 Health Tips
- Curated database of 10+ health tips
- Topics include: hydration, sleep, exercise, diet, stress management, and more
- Easy-to-read wellness advice

### 🆘 Emergency Information
- Quick access to emergency resources
- Important health hotlines and contacts

### ❓ FAQ
- Common health questions and answers
- Quick information lookup

### 👤 User Profile
- Save personal health information
- Track health data over time
- Personalized recommendations

### 🎨 UI/UX Features
- **Dark/Light Theme Toggle** - Choose your preferred theme
- **Voice Input** - Speak your symptoms using voice recognition
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Glass morphism design with smooth animations
- **Accessibility** - ARIA labels and semantic HTML

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for AI API calls)

### Installation

1. **Clone or download the project:**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project folder:**
   ```bash
   cd "AI Health Assistant Pro"
   ```

3. **Open the application:**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     ```

4. **Access the app:**
   - Open `http://localhost:8000` in your browser

## 📁 Project Structure

```
AI Health Assistant Pro/
├── index.html       # Main HTML file with all UI structure
├── script.js        # JavaScript functionality and AI integration
├── style.css        # Styling and theme configuration
└── README.md        # This file
```

## 🔧 Configuration

### API Key Setup
To use the AI chat features, an OpenRouter API key is required:

1. Get an API key from [OpenRouter](https://openrouter.ai/)
2. Update the `API_KEY` in `script.js`:
   ```javascript
   const API_KEY = "your-api-key-here";
   ```

### Available AI Models
The app uses `gpt-4o-mini` by default. You can change it in `script.js`:
```javascript
const OPENROUTER_MODEL = "gpt-4o-mini";
```

## 💾 Data Storage

All user data is stored locally using browser's `localStorage`:
- Chat history
- User profile information
- Water intake logs
- Sleep logs
- Exercise logs
- Theme preference

**Note:** Data is stored locally on your device and is not sent to any external server (except AI requests).

## 🎯 Usage Guide

### Chat Tab
1. Describe your symptoms or health questions
2. Use voice input by clicking the 🎤 button
3. Get AI-powered health advice

### Symptoms Tab
1. Click quick symptom buttons or enter custom symptoms
2. Receive AI analysis and recommendations

### Health Metrics Tab
1. **BMI Calculator:** Enter height and weight to calculate your BMI
2. **Water Tracker:** Log daily water intake
3. **Sleep Logger:** Record sleep duration and quality
4. **Exercise Tracker:** Log workouts and activities

### Export & Management
- **New Chat:** Start a fresh conversation
- **Export:** Download chat history as a file
- **Clear:** Remove current chat (can be recovered from history)

## ⚙️ Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🔐 Privacy & Security

- **Local Storage:** All personal health data is stored locally on your device
- **API Communication:** Only health queries are sent to the AI API
- **No Server Backend:** This is a pure client-side application
- **Session Data:** Clear browser cache to remove all data

## ⚠️ Disclaimer

**This application is for educational and informational purposes only.**

- Not a substitute for professional medical advice
- Always consult with licensed healthcare professionals for medical concerns
- In case of emergency, contact emergency services immediately
- Results and recommendations are AI-generated and should be verified

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and flexbox
- **JavaScript (ES6+)** - Core functionality
- **OpenRouter API** - AI integration
- **Web APIs:**
  - LocalStorage - Data persistence
  - Web Speech API - Voice input
  - LocalDate API - Date handling

## 🎨 Design Highlights

- **Glass Morphism UI** - Modern frosted glass effect
- **Gradient Backgrounds** - Smooth color transitions
- **Dark/Light Modes** - Switchable themes
- **Smooth Animations** - Cubic-bezier transitions
- **Responsive Layout** - Adapts to different screen sizes

## 📝 Future Enhancements

- [ ] Backend database integration
- [ ] User authentication system
- [ ] Cloud sync for multiple devices
- [ ] Mobile app version
- [ ] Advanced analytics and health insights
- [ ] Integration with health tracking devices
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Made with ❤️ for your health and wellness**

*Last Updated: April 2026*
