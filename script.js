// ========================= CONFIG =========================
const API_KEY = "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"; 
const OPENROUTER_MODEL = "gpt-4o-mini";

// Health tips database
const HEALTH_TIPS = [
	{ title: "💧 Stay Hydrated", content: "Drink at least 8 glasses of water daily. Proper hydration improves energy, digestion, and skin health." },
	{ title: "😴 Quality Sleep", content: "Aim for 7-9 hours of quality sleep. Good sleep boosts immunity, memory, and mood." },
	{ title: "🏃 Daily Movement", content: "Do at least 30 minutes of moderate exercise daily. Walking, cycling, or swimming are excellent for cardiovascular health." },
	{ title: "🥗 Balanced Diet", content: "Eat a variety: fruits, vegetables, whole grains, lean protein. Avoid processed foods and excess sugar." },
	{ title: "🧘 Stress Management", content: "Practice mindfulness, meditation, or yoga. Chronic stress weakens immunity and affects mental health." },
	{ title: "🚫 Avoid Smoking", content: "Smoking damages lungs and increases cancer risk. Quitting improves health within weeks." },
	{ title: "📱 Screen Time", content: "Reduce screen time, especially before bed. Blue light interferes with sleep quality." },
	{ title: "🧂 Reduce Salt", content: "High sodium increases blood pressure. Keep salt intake under 2,300mg daily." },
	{ title: "🍎 Breakfast", content: "Never skip breakfast. A healthy breakfast jumpstarts metabolism and improves focus." },
	{ title: "🤝 Social Connection", content: "Maintain social relationships. Strong social bonds are linked to better health outcomes." }
];

// ========================= THEME =========================
function applyTheme(theme) {
	document.body.setAttribute('data-theme', theme);
	const btn = document.getElementById('themeToggle');
	if(btn) {
		btn.textContent = theme === 'light' ? '🌞' : '🌙';
		btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
		btn.title = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
	}
	localStorage.setItem('theme', theme);
}

function toggleTheme() {
	const current = document.body.getAttribute('data-theme') || 'dark';
	applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
	const saved = localStorage.getItem('theme');
	const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
	applyTheme(saved || (prefersLight ? 'light' : 'dark'));
}

// ========================= VERSION 2: STORAGE & DATA =========================
class HealthData {
	constructor() {
		this.loadData();
	}

	loadData() {
		const saved = localStorage.getItem('healthData');
		const data = saved ? JSON.parse(saved) : {};
		this.profile = data.profile || {};
		this.chatHistory = data.chatHistory || [];
		this.waterLog = data.waterLog || { date: today(), count: 0 };
		this.sleepLog = data.sleepLog || [];
		this.exerciseLog = data.exerciseLog || [];
	}

	saveAll() {
		localStorage.setItem('healthData', JSON.stringify({
			profile: this.profile,
			chatHistory: this.chatHistory,
			waterLog: this.waterLog,
			sleepLog: this.sleepLog,
			exerciseLog: this.exerciseLog
		}));
	}
}

const healthData = new HealthData();

function today() {
	return new Date().toISOString().split('T')[0];
}

// ========================= CHAT =========================
async function sendMessage() {
	let inputField = document.getElementById("userInput");
	let message = inputField.value.trim();

	if(message === "") return;

	addMessage(message, "user");
	inputField.value = "";

	let typingIndicator = addMessage("⏳ Typing...", "bot");

	try {
		let response = await getHealthAdvice(message);
		typingIndicator.remove();
		addMessage(response, "bot");

		// Save to history
		const timestamp = new Date().toLocaleString();
		healthData.chatHistory.push({ user: message, bot: response, timestamp });
		healthData.saveAll();

	} catch (error) {
		typingIndicator.remove();
		console.error("sendMessage error:", error);
		addMessage(`⚠️ Error: ${error.message || error}`, "bot");
	}
}

function quickSymptom(symptom) {
	const input = document.getElementById("userInput");
	if(input) {
		input.value = symptom;
		openTab('chatTab');
		input.focus();
		setTimeout(() => sendMessage(), 100);
	}
}

function addMessage(text, type) {
	let chat = document.getElementById("chat");

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	let msg = document.createElement("div");
	msg.classList.add("message", type);
	const now = new Date();
	const datePart = now.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
	const timePart = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const ts = `${datePart} ${timePart}`;
	msg.innerHTML = `<div class="content">${escapeHtml(text)}</div><span class="ts">${ts}</span>`;

	chat.appendChild(msg);
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			chat.scrollTop = chat.scrollHeight;
		});
	});

	return msg;
}

async function getHealthAdvice(userInput) {
	const url = "https://openrouter.ai/api/v1/chat/completions";

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${API_KEY}`
			},
			body: JSON.stringify({
				model: OPENROUTER_MODEL,
				messages: [
					{
						role: "system",
						content: `You are an AI healthcare assistant. Provide:\n• Possible reasons for symptoms\n• Basic precautions\n• When to see a doctor\n\nRules:\n- No medical diagnosis\n- Keep response under 100 words\n- Always add: "This is not medical advice."`
					},
					{
						role: "user",
						content: userInput
					}
				]
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Error: ${response.status}`);
			if (errorText.toLowerCase().includes('not a valid model')) {
				return `⚠️ Model error. Check API key or model name.`;
			}
			return `⚠️ Error ${response.status}. Check API connection.`;
		}

		const data = await response.json();

		if (!data.choices || !data.choices[0].message || !data.choices[0].message.content) {
			console.error('Unexpected response format:', data);
			return "⚠️ AI error. Try again.";
		}

		return data.choices[0].message.content;

	} catch (error) {
		console.error("Fetch error:", error);
		return "⚠️ Network error. Check your connection.";
	}
}

// ========================= BMI CALCULATOR =========================
function calculateBMI() {
	let height = document.getElementById("height").value;
	const unit = document.getElementById("heightUnit")?.value || 'in';
	let weight = document.getElementById("weight").value;

	if(!height || !weight) {
		document.getElementById("bmiResult").innerText = "Please enter height and weight.";
		return;
	}

	let heightMeters = parseFloat(height);

	if(unit === 'in') {
		heightMeters = heightMeters * 0.0254; // inches to meters
	} else if(unit === 'cm') {
		heightMeters = heightMeters / 100; // cm to meters
	}

	const w = parseFloat(weight);
	const h = parseFloat(heightMeters);

	if(!h || !w || h < 0.5 || h > 3 || w < 20 || w > 600) {
		document.getElementById("bmiResult").innerText = "❌ Please enter valid values (height: 0.5-3m, weight: 20-600kg)";
		return;
	}

	let bmi = w / (h * h);
	let status = "";
	let recommendation = "";

	if(bmi < 18.5) {
		status = "Underweight";
		recommendation = "Consider eating more nutrient-dense foods.";
	} else if(bmi < 25) {
		status = "Normal Weight";
		recommendation = "Great! Maintain your healthy lifestyle.";
	} else if(bmi < 30) {
		status = "Overweight";
		recommendation = "Consider exercise and balanced diet.";
	} else {
		status = "Obese";
		recommendation = "Consult a doctor for personalized advice.";
	}

	document.getElementById("bmiResult").innerHTML =
		`Your BMI: <strong>${bmi.toFixed(2)}</strong> (${status})<br><small>${recommendation}</small>`;
}

// ========================= WATER TRACKER =========================
function addWater() {
	const today_date = today();
	if(!healthData.waterLog || healthData.waterLog.date !== today_date) {
		healthData.waterLog = { date: today_date, count: 0 };
	}
	healthData.waterLog.count = Math.min(healthData.waterLog.count + 1, 20);
	healthData.saveAll();
	updateWaterDisplay();
}

function resetWater() {
	healthData.waterLog = { date: today(), count: 0 };
	healthData.saveAll();
	updateWaterDisplay();
}

function updateWaterDisplay() {
	const count = healthData.waterLog?.count || 0;
	const display = document.getElementById("waterDisplay");
	if(!display) return;

	display.innerHTML = "";
	for(let i = 0; i < 8; i++) {
		const glass = document.createElement("div");
		glass.className = "water-glass" + (i < count ? " filled" : "");
		display.appendChild(glass);
	}

	const status = document.getElementById("waterStatus");
	if(status) {
		if(count < 8) {
			status.textContent = `📊 ${count}/8 glasses • ${Math.round((count/8)*100)}% goal`;
		} else {
			status.textContent = `✅ Goal reached! Great job staying hydrated!`;
			status.style.color = "var(--success)";
		}
	}
}

// ========================= SLEEP TRACKER =========================
function logSleep() {
	const hours = parseFloat(document.getElementById("sleepHours").value);

	if(!hours || hours < 0 || hours > 24) {
		document.getElementById("sleepInfo").innerText = "❌ Please enter valid sleep hours (0-24).";
		return;
	}

	const entry = { date: today(), hours };
	healthData.sleepLog = healthData.sleepLog || [];
	healthData.sleepLog = healthData.sleepLog.filter(e => e.date !== today());
	healthData.sleepLog.push(entry);
	healthData.saveAll();

	let advice = "";
	if(hours < 5) {
		advice = "⚠️ You got too little sleep. Try to get 7-9 hours tonight.";
	} else if(hours < 7) {
		advice = "😴 Try to get a bit more sleep. 7-9 hours is ideal.";
	} else if(hours <= 9) {
		advice = "✅ Perfect! You're getting healthy sleep.";
	} else {
		advice = "💤 You may have overslept. Consistency helps maintain a good sleep schedule.";
	}

	document.getElementById("sleepInfo").innerHTML = `<strong>Logged ${hours} hours</strong><br>${advice}`;
	document.getElementById("sleepHours").value = "";
}

// ========================= EXERCISE TRACKER =========================
function logExercise() {
	const type = document.getElementById("exerciseType")?.value || "Exercise";
	const duration = parseInt(document.getElementById("exerciseDuration")?.value) || 0;
	const intensity = document.getElementById("exerciseIntensity")?.value || "Medium";

	if(!duration || duration < 1 || duration > 480) {
		alert("Please enter valid duration (1-480 minutes)");
		return;
	}

	const entry = { date: today(), type, duration, intensity, timestamp: new Date().toLocaleString() };
	healthData.exerciseLog.push(entry);
	healthData.saveAll();

	const caloriesBurned = Math.round(duration * (intensity === 'High' ? 10 : intensity === 'Medium' ? 6 : 3));
	alert(`✅ Logged ${duration}min of ${type} (${intensity}) · Approx. ${caloriesBurned} calories`);

	document.getElementById("exerciseDuration").value = "";
	updateExerciseStats();
	renderExerciseList();
}

function updateExerciseStats() {
	const stats = document.getElementById("exerciseStats");
	if(!stats) return;

	const thisWeek = healthData.exerciseLog.filter(e => {
		const d = new Date(e.date);
		const diff = (today() - e.date);
		return diff <= 6;
	});

	let totalMin = 0;
	thisWeek.forEach(e => totalMin += e.duration);

	const types = {};
	thisWeek.forEach(e => types[e.type] = (types[e.type] || 0) + e.duration);

	let html = `<strong>📊 Weekly Activity:</strong><br>Total: ${totalMin} minutes<br>`;
	Object.entries(types).forEach(([type, min]) => {
		html += `• ${type}: ${min}min<br>`;
	});

	stats.innerHTML = html || "No exercises logged this week.";
}

function renderExerciseList() {
	const list = document.getElementById("exerciseList");
	if(!list) return;

	const recent = healthData.exerciseLog.slice(-5).reverse();
	if(recent.length === 0) {
		list.innerHTML = "<p style='opacity: 0.6;'>No exercises logged yet.</p>";
		return;
	}

	list.innerHTML = recent.map(e => `
		<div style="background: rgba(6,182,212,0.08); padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 13px;">
			<strong>${e.type}</strong> • ${e.duration}min (${e.intensity}) <br>
			<small>${e.timestamp}</small>
		</div>
	`).join("");
}

// ========================= HEALTH TIPS =========================
function loadHealthTips() {
	const container = document.getElementById("tipsContainer");
	if(!container) return;

	container.innerHTML = HEALTH_TIPS.map(tip => `
		<div class="tip-card">
			<h4>${tip.title}</h4>
			<p>${tip.content}</p>
		</div>
	`).join("");
}

// ========================= USER PROFILE =========================
function saveProfile() {
	const profile = {
		name: document.getElementById("userName")?.value || "",
		age: document.getElementById("userAge")?.value || "",
		gender: document.getElementById("userGender")?.value || "",
		conditions: document.getElementById("userConditions")?.value || "",
		medications: document.getElementById("userMedications")?.value || "",
		allergies: document.getElementById("userAllergies")?.value || ""
	};

	healthData.profile = profile;
	healthData.saveAll();

	const summary = document.getElementById("profileSummary");
	if(summary) {
		let html = `<strong>${profile.name || "Health Profile"}</strong><br>`;
		if(profile.age) html += `Age: ${profile.age}<br>`;
		if(profile.gender) html += `Gender: ${profile.gender}<br>`;
		if(profile.conditions) html += `<strong>Conditions:</strong> ${profile.conditions}<br>`;
		if(profile.medications) html += `<strong>Medications:</strong> ${profile.medications}<br>`;
		if(profile.allergies) html += `<strong>Allergies:</strong> ${profile.allergies}<br>`;

		document.getElementById("profileDisplay").innerHTML = html;
		summary.style.display = "block";
	}

	alert("✅ Profile saved!");
}

function loadProfile() {
	if(healthData.profile.name) document.getElementById("userName").value = healthData.profile.name;
	if(healthData.profile.age) document.getElementById("userAge").value = healthData.profile.age;
	if(healthData.profile.gender) document.getElementById("userGender").value = healthData.profile.gender;
	if(healthData.profile.conditions) document.getElementById("userConditions").value = healthData.profile.conditions;
	if(healthData.profile.medications) document.getElementById("userMedications").value = healthData.profile.medications;
	if(healthData.profile.allergies) document.getElementById("userAllergies").value = healthData.profile.allergies;
}

// ========================= UI MANAGEMENT =========================
function openTab(tabName) {
	document.querySelectorAll(".tabContent").forEach(tab => tab.classList.remove("active"));
	document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));

	document.getElementById(tabName).classList.add("active");
	event.target.classList.add("active");
}

function clearChat() {
	const chat = document.getElementById('chat');
	if(chat) chat.innerHTML = '';
}

function newChat() {
	clearChat();
	addMessage('🏥 New chat started! Describe your symptoms or ask a health question...', 'bot');
}

function exportChat() {
	if(healthData.chatHistory.length === 0) {
		alert("No chat history to export.");
		return;
	}

	let content = "=== AI Health Assistant - Chat Export ===\n\n";
	healthData.chatHistory.forEach(entry => {
		content += `[${entry.timestamp}]\nYou: ${entry.user}\nAssistant: ${entry.bot}\n\n`;
	});

	const blob = new Blob([content], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `health-assistant-${today()}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}

// ========================= INITIALIZATION =========================
document.addEventListener("DOMContentLoaded", () => {
	initTheme();

	// Chat input
	const inputField = document.getElementById("userInput");
	if(inputField) {
		inputField.addEventListener("keypress", (e) => {
			if(e.key === "Enter") {
				sendMessage();
			}
		});
	}

	// Load health tips
	loadHealthTips();

	// Load profile
	loadProfile();
	if(healthData.profile.name) {
		const summary = document.getElementById("profileSummary");
		if(summary) summary.style.display = "block";
	}

	// Load emergency contacts
	loadEmergencyContacts();
	renderEmergencyContacts();

	// Load FAQ
	loadFAQ();

	// Initialize voice recognition
	initVoiceRecognition();

	// Initialize trackers
	updateWaterDisplay();
	updateExerciseStats();
	renderExerciseList();

	// Initial welcome message
	setTimeout(() => {
		if(document.getElementById("chat").children.length === 0) {
			addMessage("👋 Welcome to AI Health Assistant Pro! Choose a symptom or describe how you're feeling.", "bot");
		}
	}, 200);
});

// Ensure theme is applied
if (!document.body.getAttribute('data-theme')) {
	initTheme();
}

// ========================= VOICE INPUT =========================
let recognizing = false;
let recognition;
let recordingMessage = null;

function initVoiceRecognition() {
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if(!SpeechRecognition) {
		console.warn("Speech Recognition not supported in this browser");
		document.getElementById("voiceBtn").style.display = "none";
		return;
	}

	recognition = new SpeechRecognition();
	recognition.continuous = false;
	recognition.interimResults = true;
	recognition.lang = 'en-US';

	recognition.onstart = () => {
		recognizing = true;
		document.getElementById("voiceBtn").classList.add("active");
		document.getElementById("voiceBtn").textContent = "🎙️";
		
		// Show recording indicator in chat
		recordingMessage = addMessage("🎤 Recording... Speak now", "bot");
		recordingMessage.style.opacity = "0.7";
	};

	recognition.onend = () => {
		recognizing = false;
		document.getElementById("voiceBtn").classList.remove("active");
		document.getElementById("voiceBtn").textContent = "🎤";
		
		// Remove recording message
		if(recordingMessage) {
			recordingMessage.remove();
			recordingMessage = null;
		}
	};

	recognition.onresult = (event) => {
		let interimTranscript = "";
		let finalTranscript = "";

		for(let i = event.resultIndex; i < event.results.length; i++) {
			const transcript = event.results[i][0].transcript;

			if(event.results[i].isFinal) {
				finalTranscript += transcript + " ";
			} else {
				interimTranscript += transcript;
			}
		}

		// Update recording message with live transcription
		const displayText = finalTranscript || interimTranscript;
		if(recordingMessage && displayText) {
			recordingMessage.querySelector(".content").textContent = "🎤 Recording: " + displayText;
		}

		// Update input field with final results
		const input = document.getElementById("userInput");
		if(input && finalTranscript) {
			input.value = (input.value + " " + finalTranscript).trim();
		}
	};

	recognition.onerror = (event) => {
		console.error("Voice error:", event.error);
		if(recordingMessage) {
			recordingMessage.remove();
			recordingMessage = null;
		}
		addMessage(`⚠️ Voice error: ${event.error}`, "bot");
	};
}

function toggleVoiceInput() {
	if(!recognition) initVoiceRecognition();

	if(recognizing) {
		recognition.stop();
	} else {
		recognition.start();
	}
}

// ========================= EMERGENCY CONTACTS =========================
function loadEmergencyContacts() {
	if(!healthData.profile) healthData.profile = {};
	healthData.profile.emergencyContacts = healthData.profile.emergencyContacts || [];
}

function addEmergencyContact() {
	const name = document.getElementById("contactName")?.value.trim();
	const relation = document.getElementById("contactRelation")?.value.trim();
	const phone = document.getElementById("contactPhone")?.value.trim();
	const address = document.getElementById("contactAddress")?.value.trim();

	if(!name || !phone) {
		alert("❌ Name and phone number are required!");
		return;
	}

	if(!healthData.profile.emergencyContacts) {
		healthData.profile.emergencyContacts = [];
	}

	healthData.profile.emergencyContacts.push({ name, relation, phone, address });
	healthData.saveAll();

	document.getElementById("contactName").value = "";
	document.getElementById("contactRelation").value = "";
	document.getElementById("contactPhone").value = "";
	document.getElementById("contactAddress").value = "";

	alert("✅ Contact added successfully!");
	renderEmergencyContacts();
}

function deleteEmergencyContact(index) {
	if(confirm("Delete this contact?")) {
		healthData.profile.emergencyContacts.splice(index, 1);
		healthData.saveAll();
		renderEmergencyContacts();
	}
}

function renderEmergencyContacts() {
	const list = document.getElementById("emergencyContactsList");
	if(!list) return;

	const contacts = healthData.profile.emergencyContacts || [];

	if(contacts.length === 0) {
		list.innerHTML = "<p style='text-align: center; opacity: 0.6;'>No emergency contacts saved yet.</p>";
		return;
	}

	list.innerHTML = contacts.map((contact, index) => `
		<div class="emergencyContactCard">
			<div class="contactInfo">
				<strong>📞 ${contact.name}</strong> ${contact.relation ? `(${contact.relation})` : ""}
				<p>${contact.phone}</p>
				${contact.address ? `<p>📍 ${contact.address}</p>` : ""}
			</div>
			<div class="contactActions">
				<button class="deleteContactBtn" onclick="deleteEmergencyContact(${index})">Delete</button>
			</div>
		</div>
	`).join("");
}

// ========================= FAQ =========================
const FAQ_DATA = [
	{
		q: "Is this app a replacement for medical advice?",
		a: "No, this app is for informational purposes only. Always consult with a qualified healthcare professional for medical diagnosis and treatment."
	},
	{
		q: "How often should I drink water?",
		a: "A common recommendation is 8 glasses (64 oz) per day, but individual needs vary. Drink when thirsty and adjust based on activity level."
	},
	{
		q: "What's a healthy BMI?",
		a: "BMI 18.5-24.9 is considered normal weight. BMI varies by age and genetics, so consult a doctor for personalized guidance."
	},
	{
		q: "How many hours of sleep do I need?",
		a: "Most adults need 7-9 hours of quality sleep per night. Consistent sleep schedule is important for overall health."
	},
	{
		q: "How much exercise is recommended?",
		a: "WHO recommends at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week for adults."
	},
	{
		q: "Can I share my health data?",
		a: "This app stores data locally on your device. Share your health data only with trusted healthcare providers."
	},
	{
		q: "How does voice input work?",
		a: "Click the microphone button and speak clearly. Your speech will be converted to text and added to the chat input."
	},
	{
		q: "What if I forget my emergency contacts?",
		a: "Emergency contacts are saved in the app. Access them anytime from the Emergency tab."
	}
];

function loadFAQ() {
	const faqList = document.getElementById("faqList");
	if(!faqList) return;

	faqList.innerHTML = FAQ_DATA.map((item, index) => `
		<div class="faq-item" onclick="toggleFAQ(${index})">
			<div class="faq-question">
				<span>${item.q}</span>
				<span class="faq-icon">▼</span>
			</div>
			<div class="faq-answer">${item.a}</div>
		</div>
	`).join("");
}

function toggleFAQ(index) {
	const items = document.querySelectorAll(".faq-item");
	items.forEach(item => item.classList.remove("active"));
	items[index].classList.add("active");
}

// ========================= HEALTH TIPS SHARING =========================
function shareHealthTip(title, content) {
	const text = `📋 Health Tip: ${title}\n\n${content}\n\n💡 Shared from AI Health Assistant Pro`;
	
	if(navigator.share) {
		navigator.share({ title: "Health Tip", text: text }).catch(err => {
			console.log("Share failed:", err);
			copyToClipboard(text);
		});
	} else {
		copyToClipboard(text);
	}
}

function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		alert("✅ Copied to clipboard! You can paste it anywhere.");
	}).catch(err => {
		console.error("Copy failed:", err);
	});
}

// Update health tips rendering to include share buttons
function loadHealthTips() {
	const container = document.getElementById("tipsContainer");
	if(!container) return;

	container.innerHTML = HEALTH_TIPS.map((tip, index) => `
		<div class="tip-card">
			<h4>${tip.title}</h4>
			<p>${tip.content}</p>
			<button class="tipShareBtn" onclick="shareHealthTip('${tip.title}', '${tip.content.replace(/'/g, "\\'")}')">📤 Share</button>
		</div>
	`).join("");
}
