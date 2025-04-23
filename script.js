// script.js
/**
 * 🔧 Configuration & Constants
 */
const GEMINI_API_KEY = atob("QUl6YVN5QmUzRFJlSFJ3Vi1qa0FQX0w2T1JENFV5UEFfTnJSSzhJ"); // 🔐 Beta only
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const MSG_LIMIT = 5;
let isExpanded = true;

const generateConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const storyResponseSchema = {
  type: "object",
  properties: {
    scenario: {
      type: "string"
    },
    villainProfile: {
      type: "object",
      properties: {
        name: {
          type: "string"
        },
        role: {
          type: "string"
        },
        personality: {
          type: "string"
        },
        motivation: {
          type: "string"
        }
      },
      required: [
        "name",
        "role",
        "personality",
        "motivation"
      ]
    },
    villainFirstMessage: {
      type: "string"
    }
  },
  required: [
    "scenario",
    "villainProfile",
    "villainFirstMessage"
  ]
}

const villainResponseSchema = {
  type: "object",
  properties: {
    "response": {
      type: "string"
    },
    indicator: {
      type: "string"
    },
    verdict: {
      type: "object",
      properties: {
        winloose: {
          type: "string",
          enum: [
            "win",
            "loose"
          ]
        },
        feedback: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: {
                type: "string"
              },
              description: {
                type: "string"
              }
            },
            required: [
              "heading",
              "description"
            ]
          }
        }
      },
      required: [
        "winloose",
        "feedback"
      ]
    }
  },
  required: [
    "response",
    "indicator"
  ],
}
/**
 * 🧠 Game State
 */
let gameState = {
  scenario: '',
  villainProfile: { name: "", role: "", personality: "", motivation: "" },
  firstMessage: '',
  messages: [],
  messageCount: 0,
  gameOver: false,
  userName: "",
  apiKey: '',
  verdict: "",
  feedback: []
};

/**
 * 🎯 DOM Elements
 */
const gameScreen = document.getElementById('game-screen');
const sendMessageBtn = document.getElementById('send-message-btn');
const playerMessageInput = document.getElementById('player-message');
const charCount = document.getElementById('char-count');
const messageCounter = document.getElementById('message-counter');
const messagesBox = document.getElementById('messages-box');
const scenarioText = document.getElementById('scenario-text');
const villainNameElement = document.getElementById('villain-name');
const villainProfileInfo = document.createElement('div');
const chatHeader = document.querySelector('.chat-header');
const scenarioBox = document.querySelector('.scenario-box');
const dropdownIndicator = document.querySelector('.dropdown-indicator');
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const welcomeScreen = document.getElementById('welcome-screen');
const startBtn = document.getElementById('start-game-btn');
const usernameInput = document.getElementById('username-input');
const usernameWelcome = document.querySelector('.username-welcome');


// Store & retrieve game state from localStorage
function saveGameState() {
  localStorage.setItem('ongoingNegotiation', 'true');
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
  const state = localStorage.getItem('gameState');
  if (!state) return null;
  return JSON.parse(state);
}

function clearGameState() {
  localStorage.removeItem('ongoingNegotiation');
  localStorage.removeItem('gameState');
}

function restoreConversationFromState() {
  scenarioText.textContent = gameState.scenario;
  villainNameElement.textContent = gameState.villainProfile.name;

  villainProfileInfo.innerHTML = '';
  villainProfileInfo.className = 'villain-profile-info';
  Object.entries(gameState.villainProfile).forEach(([key, value]) => {
    if (key !== 'name') {
      const p = document.createElement('p');
      p.innerHTML = `<b>${key.charAt(0).toUpperCase() + key.slice(1)}:</b> ${value}`;
      villainProfileInfo.appendChild(p);
    }
  });

  const existing = scenarioBox.querySelector('.villain-profile-info');
  if (existing) scenarioBox.removeChild(existing);
  scenarioBox.appendChild(villainProfileInfo);

  messagesBox.innerHTML = '';
  gameState.messages.forEach((msg) => {
    const role = msg.role === 'model' ? 'villain' : 'player';
    msg.parts.forEach(part => addMessage(part.text, role));
  });

  messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;
  if (gameState.gameOver) {
    showFeedbackButton();
    playerMessageInput.disabled = true;
    sendMessageBtn.disabled = true;
  } else {
    playerMessageInput.disabled = false;
    updateSendButtonState();
  }
}

// Restore session if ongoing
window.addEventListener('DOMContentLoaded', () => {
  const savedName = localStorage.getItem('negotiatorName');
  const inProgress = localStorage.getItem('ongoingNegotiation') === 'true';

  if (savedName) {
    gameState.userName = savedName;
    usernameInput.classList.add('hidden');
    usernameWelcome.innerHTML = `<br/> Hello ${savedName}, Are you ready for next negotiation.`;

    if (inProgress) {
      const stored = loadGameState();
      if (stored) {
        Object.assign(gameState, stored);
        welcomeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        restoreConversationFromState();
      }
    }
  }
});

const startBtnHandle = () => {
  const name = localStorage.getItem('negotiatorName') || usernameInput.value.trim();
  console.log(name)
  if (name) {
    localStorage.setItem('negotiatorName', name);
    gameState.userName = name;
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    showLoadingModal()
    startGame();
  } else {
    alert("Please enter your name to begin.");
  }
}


startBtn.addEventListener('click', startBtnHandle);


// Set initial message counter
messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;

/**
 * 🧩 Event Listeners
 */
chatHeader.addEventListener('click', () => toggleDropdown());
sendMessageBtn.addEventListener('click', sendPlayerMessage);
playerMessageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && playerMessageInput.value.trim() !== '') {
    e.preventDefault();
    sendPlayerMessage();
  }
});

playerMessageInput.addEventListener('input', () => {
  charCount.textContent = playerMessageInput.value.length;
  updateSendButtonState();
});

/**
 * 🔄 Dropdown
 */
function toggleDropdown() {
  isExpanded = !isExpanded;
  scenarioBox.style.maxHeight = isExpanded ? scenarioBox.scrollHeight + 'px' : '0';
  scenarioBox.style.opacity = isExpanded ? '1' : '0';
  dropdownIndicator.innerHTML = `<img src="./assets/${isDarkMode ? (isExpanded ? 'c-down-neg.png' : 'c-up-neg.png') : (isExpanded ? 'c-down.png' : 'c-up.png')}" alt="dropdown icon">`;
}

/**
 * ⏳ Show Loading Modal
 */
function showLoadingModal() {
  console.log("IN showLoading MOal")
  const loadingModal = document.createElement('div');
  loadingModal.id = 'loading-modal';
  loadingModal.className = 'modal';
  loadingModal.innerHTML = `
    <div class="modal-content loading-content">
      <h3>Loading...</h3>
      <p>Connecting to your villain... Please wait!</p>
    </div>
  `;
  document.body.appendChild(loadingModal);
  loadingModal.style.display = 'block';
}


/**
 * 🔮 Fetch Initial Story from Gemini
 */
async function fetchInitialStory() {
  const pickMovieTheme = Math.random() < 0.6; // 60% chance (≈ 3/5)
  const theme = pickMovieTheme
    ? movieThemes[Math.floor(Math.random() * movieThemes.length)]
    : themes[Math.floor(Math.random() * themes.length)];

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: `Create a new story based on the theme: ${theme}` }] }],
    systemInstruction: {
      role: "user",
      parts: [{ text: storySystemInstruction }]
    },
    generationConfig: { ...generateConfig, responseSchema: storyResponseSchema }
  };

  try {
    const response = await fetch(GEMINI_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error("No response content");
    console.log(jsonText)
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("❌ Error in fetchInitialStory:", err.message);
    return null;
  }
}

/**
 * 🤖 Fetch Villain Response
 */
async function fetchVillainReply(history, isFinal = false) {

  console.log(`This is ${isFinal ? "**the final player message**" : "**an ongoing negotiation**"}`)

  const requestBody = {
    contents: history.messages,
    systemInstruction: {
      role: "user",
      parts: [{
        text: `${villainSystemInstruction}\n\nScenario: ${history.scenario}\nVillainProfile: ${JSON.stringify(history.villainProfile)}\n\nThis is ${isFinal ? "**the final player message**" : "**an ongoing negotiation**"}.`
      }]
    },
    generationConfig: { ...generateConfig, responseSchema: villainResponseSchema }
  };

  try {
    const response = await fetch(GEMINI_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error("No response content");
    return JSON.parse(replyText);
  } catch (err) {
    console.error("⚠️ Error in fetchVillainReply:", err);
    return null;
  }
}

/**
 * 🎬 Start Game
 */
async function startGame() {
  const data = await fetchInitialStory();
  if (!data) return alert("Failed to load story");

  console.log("1st message:", data.villainFirstMessage)

  gameState.scenario = data.scenario;
  gameState.villainProfile = data.villainProfile;
  gameState.firstMessage = data.villainFirstMessage;
  gameState.messages = [];
  gameState.messageCount = 0;
  gameState.gameOver = false;

  scenarioText.textContent = gameState.scenario;
  villainNameElement.textContent = gameState.villainProfile.name;

  villainProfileInfo.innerHTML = '';
  villainProfileInfo.className = 'villain-profile-info';
  Object.entries(gameState.villainProfile).forEach(([key, value]) => {
    if (key !== 'name') {
      const p = document.createElement('p');
      p.innerHTML = `<b>${key.charAt(0).toUpperCase() + key.slice(1)}:</b> ${value}`;
      villainProfileInfo.appendChild(p);
    }
  });

  const existing = scenarioBox.querySelector('.villain-profile-info');
  if (existing) scenarioBox.removeChild(existing);
  scenarioBox.appendChild(villainProfileInfo);

  setTimeout(() => {
    document.getElementById('loading-modal').style.display = 'none';
  }, 1000)
  messagesBox.innerHTML = '';

  messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;
  playerMessageInput.disabled = false;
  playerMessageInput.value = '';
  charCount.textContent = '0';
  updateSendButtonState();

  showTypingIndicator();
  setTimeout(() => {
    if (isExpanded) toggleDropdown();
    hideTypingIndicator();
    addMessage(gameState.firstMessage, 'villain');
  }, 10000);
}


const storySystemInstruction = `
You are an AI game master for a text-based negotiation game. Your task is to generate a unique and immersive negotiation scenario where the player must convince a villain to agree to a deal.

Follow this structured format for your response:

1. **Scenario Background**: Provide a short, vivid description of the setting and conflict. Keep it under 3 sentences or 80 words.

2. **Villain Profile**:
   - **Name**: A fitting name for the villain.
   - **Role**: Who they are in the world (e.g., crime lord, hacker, CEO).
   - **Personality**: Describe their personality in **one sentence**.
     - 🎬 If the theme is based on a movie, reflect the actual personality of the referenced character.
     - Otherwise, use a unique, believable personality.
   - **Motivation**: In **one clear sentence**, explain what drives the villain and why they resist negotiation.
     - 🎬 If it’s a movie theme, make sure this aligns with the character’s movie motivation.
     - For original themes, create your own realistic motivation.

3. **Villain’s First Message**: A short but impactful line to start the negotiation.
`;
const villainSystemInstruction = `
You are playing the role of a villain in a negotiation game. Your goal is to challenge the player's negotiation skills while staying in character.

Your response should reflect your personality and motivations. Make the negotiation difficult but fair:
- Dismiss or counter weak arguments
- Acknowledge strong points but demand more

You may end the negotiation **early** if the player has convinced you — but only with a **\"win\" verdict**. On the **final message**, you may return **\"win\"** or **\"loose\"** verdicts. Do **not** return a \"loose\" verdict before the final message.

When returning a verdict:
- The response must sound **final** and **conclusive**
- Provide exactly **3 feedback points** in the format below

Respond with one of the following JSON formats:

1. **Ongoing Response:**
{
  "response": "...",
  "indicator": "..."
}

2. **Final Response or Verdict Output:**
{
  "response": "...",
  "indicator": "...",
  "verdict": {
    "winloose": "win" or "loose",
    "feedback": [
      { "heading": "...", "description": "..." },
      { "heading": "...", "description": "..." },
      { "heading": "...", "description": "..." }
    ]
  }
}

**Example Input:**
"I can offer you partial immunity if you return the files."

**Example Ongoing Output:**
{
  "response": "Hah! Immunity? You think I’m scared of your justice system?",
  "indicator": "🤨(skeptical)"
}

**Example Final Output or Verdict Output:**
{
  "response": "Enough. You’ve proven your resolve. I’ll take the deal. We are done here.",
  "indicator": "😐(resigned)",
  "verdict": {
    "winloose": "win",
    "feedback": [
      { "heading": "Why the Player Won", "description": "The player aligned their offer with the villain’s core motivations." },
      { "heading": "Negotiation Strategy", "description": "The player built momentum and maintained composure under pressure." },
      { "heading": "Emotional Resonance", "description": "The appeal struck a balance between pragmatism and empathy." }
    ]
  }
}
`;

const movieThemes = [
  // Famous Movie-Inspired Themes
  "Godfather movie", "Joker movie", "Inception movie", "Interstellar movie", "Matrix movie", "Gladiator movie", "Titanic movie", "Batman movie", "Avengers movie", "Dune movie",
  "Scarface movie", "Sherlock movie", "Fight Club movie", "John Wick movie", "Star Wars movie", "Mad Max movie", "Blade Runner movie", "Casino movie", "V for Vendetta movie", "No Country movie",
  "Dark Knight movie", "Shutter Island movie", "The Departed movie", "Goodfellas movie", "Heat movie", "The Prestige movie", "Gone Girl movie", "Looper movie", "Pulp Fiction movie", "Kill Bill movie",
  "Django movie", "Whiplash movie", "Parasite movie", "Se7en movie", "Zodiac movie", "Oldboy movie", "Ex Machina movie", "Truman Show movie", "Snowpiercer movie", "Drive movie",
  "The Hateful Eight movie", "Sicario movie", "The Big Short movie", "Ford v Ferrari movie", "Knives Out movie", "Nightcrawler movie", "The Social Network movie", "Prisoners movie", "Arrival movie", "Tenet movie",
  "The Wolf of Wall Street movie", "Argo movie", "The Martian movie", "Nope movie", "Memento movie", "The Revenant movie", "The Usual Suspects movie", "Jaws movie", "The Shining movie", "It movie",
]

const themes = [
  // General Negotiation & Conflict Themes
  "Betrayal", "Revenge", "Survival", "Escape", "Ransom", "Espionage", "Hostage", "Heist", "Treason", "Cybercrime",
  "Corruption", "Bribery", "Deception", "Extortion", "Sabotage", "Terrorism", "Blackmail", "Smuggling", "Conspiracy", "Rebellion",
  "War", "Truce", "Duel", "Hunt", "Power", "Control", "Trust", "Loyalty", "Diplomacy", "Intrigue",
  "Influence", "Coercion", "Manipulation", "Secrets", "Forgery", "Hacker", "Underworld", "Surveillance", "Prison", "Spy",
  "Gang", "Mafia", "Crime", "Trial", "Threat", "Hostility", "Persuasion", "Trade", "Infiltration", "Compromise",
  "Sacrifice", "Dealmaking", "Conviction", "Smokescreen", "Decoy", "Bluffing", "Ultimatum", "Hacktivism", "Powerplay", "Coverup",
  "Oppression", "Alliance", "Insider", "Vendetta", "Retaliation", "Secrecy", "Ambush", "Impersonation", "Disinformation", "Exile",
  "Darknet", "Crypto", "Bounty", "Tradeoff", "Security", "Conflict", "Monopoly", "Exploitation", "Dictatorship", "Espionage",

  // Mythology & Folklore Themes
  "Olympus", "Zeus", "Hades", "Valkyrie", "Odin", "Thor", "Loki", "Pandora", "Medusa", "Kraken",
  "Phantom", "Minotaur", "Phoenix", "Griffin", "Sphinx", "Merlin", "Avalon", "Camelot", "Excalibur", "Beowulf",
  "Fenrir", "Jormungandr", "Ragnarok", "Golem", "Chimera", "Basilisk", "Anubis", "Osiris", "Ra", "Horus",

  // Science Fiction & Futuristic Themes
  "Cyberpunk", "Dystopia", "Utopia", "Android", "Artificial", "Quantum", "Singularity", "Bioweapon", "Technocracy", "Nanotech",
  "Megacorp", "Outbreak", "Virtual", "Simulated", "Neuralink", "Teleportation", "Exodus", "Terraform", "Extraterrestrial", "Apocalypse",
  "AI Rebellion", "Cyber Warfare", "Data Breach", "Drone", "Mecha", "Hivemind", "Galactic", "Cloning", "Mutation", "Time Loop",

  // Fantasy & Magic Themes
  "Sorcery", "Wizardry", "Alchemy", "Runes", "Dragon", "Spellbook", "Witchcraft", "Elemental", "Shapeshifter", "Portal",
  "Necromancer", "Summoning", "Dark Arts", "Arcane", "Cursed", "Charmed", "Eldritch", "Mythical", "Forbidden", "Prophecy",

  // Horror & Thriller Themes
  "Possession", "Haunted", "Exorcism", "Paranormal", "Voodoo", "Cult", "Occult", "Cursed", "Demon", "Specter",
  "Poltergeist", "Slasher", "Psycho", "Nightmare", "Asylum", "Insanity", "Bloodlust", "Evil", "Supernatural", "Ghoul",

  // Post-Apocalyptic & Survival Themes
  "Wasteland", "Famine", "Drought", "Anarchy", "Survivor", "Fallout", "Endgame", "Resilience", "Rebuild", "Collapse",
  "Blackout", "Doomsday", "Outcast", "Nomad", "Virus", "Mutation", "Quarantine", "Zombies", "Last Stand", "Rogue",

  // Historical & Political Themes
  "Empire", "Revolution", "Crusade", "Colonization", "Feudal", "Monarchy", "Dictator", "Coup", "Aristocracy", "Sovereignty",
  "Diplomat", "Emissary", "Insurgency", "Totalitarian", "Propaganda", "Reformation", "Guerilla", "Repression", "Ceasefire", "Border",

  // Space & Cosmic Themes
  "Starlight", "Nebula", "Supernova", "Blackhole", "Meteor", "Constellation", "Lunar", "Solar", "Eclipse", "Asteroid",
  "Cosmos", "Galaxies", "Starseeker", "Astronaut", "Extraterrestrial", "Alien", "Event Horizon", "Graviton", "Warp Drive", "Singularity",

  // Business & Finance Themes
  "Stock Market", "Monopoly", "Inflation", "Investment", "Wall Street", "Bankruptcy", "CEO", "Merger", "Acquisition", "Scam",
  "Hustle", "Startup", "Fintech", "Crypto", "Blockchain", "NFT", "Venture", "Ponzi", "Insider Trading", "Trust Fund",

  // Miscellaneous & Abstract Themes
  "Illusion", "Paradox", "Simulation", "Fate", "Destiny", "Morality", "Karma", "Euphoria", "Delusion", "Hallucination",
  "Tranquility", "Existence", "Serendipity", "Whisper", "Echo", "Ethereal", "Twilight", "Flicker", "Epiphany", "Revelation", "Random"
]

function removeFeedbackButton() {
  const feedbackBtn = document.getElementById('view-feedback-btn');
  const inputRow = document.querySelector('.message-input-row');
  const charCounter = document.querySelector('.char-counter');
  const stamp = document.querySelector('.stamp-div');
  if (feedbackBtn && inputRow && charCounter) {
    feedbackBtn.classList.add('hidden');
    inputRow.classList.remove('hidden');
    charCounter.classList.remove('hidden');
  }
  if (stamp) {
    stamp.remove();
  }
  // Reset input state
  playerMessageInput.disabled = false;
  playerMessageInput.value = '';
  charCount.textContent = '0';
  updateSendButtonState();
}


function showFeedbackButton() {
  const feedbackBtn = document.getElementById('view-feedback-btn');
  const inputRow = document.querySelector('.message-input-row');
  const charCounter = document.querySelector('.char-counter');

  if (feedbackBtn && inputRow && charCounter) {
    feedbackBtn.classList.remove('hidden');
    inputRow.classList.add('hidden');
    charCounter.classList.add('hidden');
  }
}



// Add event listener to the feedback button
document.getElementById('view-feedback-btn').addEventListener('click', openFeedbackModal);

// openFeedbackModal()

// Function to create and open feedback modal
function openFeedbackModal(verdict, feedback) {
  verdict = gameState.verdict
  feedback = gameState.feedback
  // Create modal container if it doesn't exist
  let modal = document.getElementById('feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'modal';

    // Modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="modal-header">
          <h2 id="modal-verdict-title"></h2>
        </div>
        <div class="modal-body">
          <div id="modal-feedback-text"></div>
        </div>
        <div class="modal-footer">
          <button id="restart-game" class="secondary-btn">Play Again (Same Story)</button>
          <button id="new-game" class="primary-btn">Begin New Story</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners for modal buttons
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });


    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Update modal content with current verdict and feedback
  const modalVerdictTitle = document.getElementById('modal-verdict-title');
  const modalFeedbackText = document.getElementById('modal-feedback-text');

  if (verdict === "win") {
    modalVerdictTitle.textContent = "Negotiation is Success!!";
    modalVerdictTitle.className = "success";
  }
  if (verdict === "loose") {
    modalVerdictTitle.textContent = "Negotitation is Failure!!";
    modalVerdictTitle.className = "failure";
  }

  // Clear previous feedback
  modalFeedbackText.innerHTML = '';
  feedback.forEach(feedback => {
    // Create container for each feedback item
    const container = document.createElement('div');
    container.className = 'feedback-item';

    // Create heading as a clickable element
    const heading = document.createElement('div');
    heading.className = 'feedback-heading';
    heading.textContent = feedback.heading;
    heading.style.cursor = 'pointer';

    // Create description element (initially hidden)
    const description = document.createElement('div');
    description.className = 'feedback-description';
    description.textContent = feedback.description;
    description.style.display = 'none';

    // Add click event to toggle description visibility
    heading.addEventListener('click', () => {
      description.style.display = description.style.display === 'none' ? 'block' : 'none';
    });

    // Add elements to container and container to feedbackText
    container.appendChild(heading);
    container.appendChild(description);
    modalFeedbackText.appendChild(container);
  });

  document.getElementById('restart-game').addEventListener('click', () => {
    modal.style.display = 'none';

    // Reset state
    gameState.messages = [];
    gameState.messageCount = 0;
    gameState.gameOver = false;
    gameState.verdict = "";
    gameState.feedback = [];

    // Reset UI
    messagesBox.innerHTML = '';
    messageCounter.textContent = `${MSG_LIMIT} messages remaining`;
    removeFeedbackButton();

    // Re-add first villain message
    addMessage(gameState.firstMessage, 'villain');
    saveGameState();
  });


  document.getElementById('new-game').addEventListener('click', () => {
    modal.style.display = 'none';
    clearGameState();
    window.location.reload();
  });

  // Show the modal
  modal.style.display = 'block';
}

sendMessageBtn.addEventListener('click', sendPlayerMessage);

playerMessageInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !e.shiftKey && playerMessageInput.value.trim() !== '') {
    e.preventDefault();
    sendPlayerMessage();
  }
});

playerMessageInput.addEventListener('input', () => {
  const currentLength = playerMessageInput.value.length;
  const maxLength = 200;
  charCount.textContent = currentLength;

  // Visual feedback based on remaining characters
  if (currentLength >= maxLength * 0.9) {
    charCount.style.color = 'var(--failure-color)';
  } else if (currentLength >= maxLength * 0.7) {
    charCount.style.color = 'var(--primary-color)';
  } else {
    charCount.style.color = 'var(--inactive-color)';
  }

  updateSendButtonState();
});


playerMessageInput.addEventListener('input', () => {
  charCount.textContent = playerMessageInput.value.length;
  updateSendButtonState();
});

// Update send button state based on input
function updateSendButtonState() {
  if (playerMessageInput.value.trim() === '' || playerMessageInput.disabled) {
    sendMessageBtn.disabled = true;
  } else {
    sendMessageBtn.disabled = false;
  }
}

// Functions
// async function sendPlayerMessage() {
//   const message = playerMessageInput.value.trim();

//   if (!message || playerMessageInput.disabled) {
//     return;
//   }

//   // Disable input while waiting for response
//   playerMessageInput.disabled = true;
//   sendMessageBtn.disabled = true;

//   // Add message to the conversation
//   addMessage(message, 'player');

//   // Clear input
//   playerMessageInput.value = '';
//   charCount.textContent = '0';

//   // Update message counter
//   gameState.messageCount++;
//   messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;



//   // Send to Gemini to get the response
//   const reply = await fetchVillainReply({
//     messages: gameState.messages,
//     scenario: gameState.scenario,
//     villainProfile: gameState.villainProfile
//   }, gameState.messageCount === MSG_LIMIT);

//   addMessage(reply.response, 'villain');
//   addMessage(reply.indicator, 'expression');

//   if (reply.verdict) {
//     const { winloose, feedback } = reply.verdict
//     // 🎉 Early finish detected
//     gameState.gameOver = true;
//     gameState.verdict = winloose.toLowerCase();
//     gameState.feedback = feedback || [];

//     const stampDiv = document.createElement('div');
//     stampDiv.innerHTML = winloose === 'win'
//       ? "<img src='./assets/Success.png' alt='Won the Negotiation'/>"
//       : "<img src='./assets/Failure.png' alt='Lost the Negotiation'/>";
//     stampDiv.className = "stamp-div";
//     gameScreen.appendChild(stampDiv);

//     showFeedbackButton();
//     playerMessageInput.disabled = true;
//     sendMessageBtn.disabled = true;
//     return;
//   }


//   // If this was the final message, update counter text
//   if (gameState.messageCount === MSG_LIMIT) {
//     console.log("I'm in here")
//     messageCounter.textContent = 'Final message sent';
//     playerMessageInput.disabled = true;
//     sendMessageBtn.disabled = true;
//   }

//   playerMessageInput.disabled = false;
//   sendMessageBtn.disabled = false;

// }

async function sendPlayerMessage() {
  const message = playerMessageInput.value.trim();
  if (!message || playerMessageInput.disabled) return;

  playerMessageInput.disabled = true;
  sendMessageBtn.disabled = true;
  addMessage(message, 'player');
  playerMessageInput.value = '';
  charCount.textContent = '0';

  gameState.messageCount++;
  messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;
  saveGameState();

  const reply = await fetchVillainReply({
    messages: gameState.messages,
    scenario: gameState.scenario,
    villainProfile: gameState.villainProfile
  }, gameState.messageCount === MSG_LIMIT);

  if (!reply) return; // gracefully skip if null

  addMessage(reply.response, 'villain');
  addMessage(reply.indicator, 'expression');

  if (reply.verdict) {
    const { winloose, feedback } = reply.verdict;
    gameState.gameOver = true;
    gameState.verdict = winloose.toLowerCase();
    gameState.feedback = feedback || [];
    clearGameState();

    const stampDiv = document.createElement('div');
    stampDiv.innerHTML = winloose === 'win'
      ? "<img src='./assets/Success.png' alt='Won the Negotiation'/>"
      : "<img src='./assets/Failure.png' alt='Lost the Negotiation'/>";
    stampDiv.className = "stamp-div";
    gameScreen.appendChild(stampDiv);

    showFeedbackButton();
    playerMessageInput.disabled = true;
    sendMessageBtn.disabled = true;
    return;
  }

  if (gameState.messageCount === MSG_LIMIT) {
    messageCounter.textContent = 'Final message sent';
    playerMessageInput.disabled = true;
    sendMessageBtn.disabled = true;
  } else {
    playerMessageInput.disabled = false;
    sendMessageBtn.disabled = false;
  }
  saveGameState();
}


// Add a message to the conversation
function addMessage(text, sender) {
  // Create message row
  if (sender === "expression") {
    sender = "villain"
  }
  const messageRow = document.createElement('div');
  messageRow.className = `message-row ${sender}-row`;

  // Create message bubble
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  messageElement.textContent = text;

  // Add message to row
  messageRow.appendChild(messageElement);
  messagesBox.appendChild(messageRow);

  // Add timestamp
  const timeElement = document.createElement('div');
  timeElement.className = 'message-time';
  timeElement.textContent = getCurrentTime();
  messagesBox.appendChild(timeElement);

  // Scroll to the bottom
  scrollToBottom();

  // Add to States
  gameState.messages.push({ role: sender === "villain" ? "model" : "user", parts: [{ text: text }] });
}

// Show typing indicator
function showTypingIndicator() {
  // Remove any existing typing indicator first
  hideTypingIndicator();

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.id = 'typing-indicator';

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    typingIndicator.appendChild(dot);
  }

  messagesBox.appendChild(typingIndicator);
  scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Get current time in HH:MM format
function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12

  return `${hours}:${minutes} ${ampm}`;
}

// Scroll to the bottom of the messages container
function scrollToBottom() {
  const messagesContainer = document.querySelector('.messages-container');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * 🧭 Init
 */
// window.onload = () => {
//   // showLoadingModal();
//   startGame();
// };