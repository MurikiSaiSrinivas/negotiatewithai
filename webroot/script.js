// script.js
// Game state
let gameState = {
  scenario: '',
  villainProfile: { name: "name", role: "role", personality: "Persona", motivation: "motive" },
  firstMessage: '',
  messages: [],
  messageCount: 0,
  gameOver: false,
  userName: "",
  apiKey: '',
  verdict: "",
  feedback: []
};

const MSG_LIMIT = 5
let isExpanded = true;

// DOM Elements
const gameScreen = document.getElementById('game-screen');
const sendMessageBtn = document.getElementById('send-message-btn');
const playerMessageInput = document.getElementById('player-message');
const charCount = document.getElementById('char-count');
const messageCounter = document.getElementById('message-counter');
const messagesBox = document.getElementById('messages-box');
const scenarioText = document.getElementById('scenario-text');
const villainNameElement = document.getElementById('villain-name');
const villainProfileInfo = document.createElement('div'); // Will be used in the scenario box
const chatHeader = document.querySelector('.chat-header');
const scenarioBox = document.querySelector('.scenario-box');
const dropdownIndicator = document.querySelector('.dropdown-indicator')
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;


// Set initial message counter
messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;

// Communication with Devvit
const devvit = {
  postMessage: (message) => {
    window.parent.postMessage(message, '*');
  }
};

// Send "ready" message to Devvit when page loads
window.addEventListener('load', () => {
  devvit.postMessage({ type: 'webViewReady' });
});

const dropdownOpenClose = () => {
  isExpanded = !isExpanded;

  if (isExpanded) {
    scenarioBox.style.maxHeight = scenarioBox.scrollHeight + 'px';
    scenarioBox.style.opacity = '1';
    dropdownIndicator.innerHTML = `<img src="./assets/${isDarkMode? 'c-down-neg.png' :'c-down.png'}" alt="drop down close">`;
  } else {
    scenarioBox.style.maxHeight = '0';
    scenarioBox.style.opacity = '0';
    dropdownIndicator.innerHTML = `<img src="./assets/${isDarkMode? 'c-up-neg.png' :'c-up.png'}" alt="drop down close">`;
  }
}

chatHeader.addEventListener('click', dropdownOpenClose);

const loadingModal = document.createElement('div');
loadingModal.id = 'loading-modal';
loadingModal.className = 'modal';

// Modal content
loadingModal.innerHTML = `
      <div class="modal-content loading-content">
        <h3>Loading....</h3>
        <p>Hello Negotiater, We are connecting with your villain. Please Hold on!!</p>
        <br/>
        <p>Details about the villain can be seen by click on the chat header i.e., on villain name</p>
      </div>
    `;

document.body.appendChild(loadingModal);

// Show the modal
loadingModal.style.display = 'block';


// Function to replace input container with feedback button
function showFeedbackButton() {
  const inputContainer = document.querySelector('.input-container');

  // Save original content to restore later if needed
  inputContainer.dataset.originalContent = inputContainer.innerHTML;

  // Replace with feedback button
  inputContainer.innerHTML = `
    <button id="view-feedback-btn" class="secondary-btn">
      <i class="fas fa-comment-dots"></i> View Feedback
    </button>
  `;

  // Add event listener to the new button
  document.getElementById('view-feedback-btn').addEventListener('click', openFeedbackModal);
}

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
          You reached the end of the conversation. You can close this window!!
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

  // Show the modal
  modal.style.display = 'block';
}


// Listen for messages from Devvit
window.addEventListener('message', (event) => {
  const message = event.data.data.message;

  switch (message.type) {
    case 'initialData':
      // Store the API key
      gameState.apiKey = message.data.apiKey;
      break;

    case 'gameStart':
      // Start the game with the scenario data
      gameState.scenario = message.data.scenario;
      gameState.villainProfile = message.data.villainProfile;
      gameState.firstMessage = message.data.firstMessage;
      gameState.messages = [];
      gameState.messageCount = 0;
      gameState.gameOver = false;

      // Update UI
      scenarioText.textContent = gameState.scenario;

      // Update villain name in the chat header
      villainNameElement.textContent = gameState.villainProfile.name;

      // Add villain profile to scenario box
      villainProfileInfo.innerHTML = '';
      villainProfileInfo.className = 'villain-profile-info';
      Object.entries(gameState.villainProfile).forEach(([key, value]) => {
        if (key !== 'name') { // Skip name as it's already in the header
          const p = document.createElement('p');
          p.innerHTML = `<b>${key.charAt(0).toUpperCase() + key.slice(1)}:</b> ${value}`;
          villainProfileInfo.appendChild(p);
        }
      });

      // Add villain profile to scenario box
      const scenarioBox = document.querySelector('.scenario-box');
      // Check if it's already there and remove it if so
      const existingProfileInfo = scenarioBox.querySelector('.villain-profile-info');
      if (existingProfileInfo) {
        scenarioBox.removeChild(existingProfileInfo);
      }
      scenarioBox.appendChild(villainProfileInfo);

      loadingModal.style.display = "none"

      // Clear previous messages
      messagesBox.innerHTML = '';

      // Update message counter
      messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;

      // Enable input
      playerMessageInput.disabled = false;
      playerMessageInput.value = '';
      charCount.textContent = '0';
      updateSendButtonState();

      // Display villain's first message with typing indicator
      showTypingIndicator();
      setTimeout(() => {
        if (isExpanded) {
          dropdownOpenClose();
        }
        hideTypingIndicator();
        addMessage(gameState.firstMessage, 'villain');
      }, 3000);

      break;

    case 'villainResponse':
      // Show typing indicator first
      showTypingIndicator();

      // Then add villain response after a delay
      setTimeout(() => {
        hideTypingIndicator();
        addMessage(message.data.message, 'villain');
        addMessage(message.data.indicator, 'expression')

        if (gameState.messageCount < MSG_LIMIT) {
          // Enable input for next player message
          playerMessageInput.disabled = false;
          updateSendButtonState();
        }
      }, 1500 + Math.random() * 1000); // Random typing time between 1.5-2.5s
      break;

    case 'gameEnd':
      // Show typing indicator first
      showTypingIndicator();

      // Then add final message after a delay
      setTimeout(() => {
        hideTypingIndicator();
        addMessage(message.data.message, 'villain');
        addMessage(message.data.indicator, 'expression')

        // Game over, update game state
        gameState.gameOver = true;
        gameState.verdict = message.data.verdict;
        gameState.feedback = message.data.feedback;

        const stampDiv = document.createElement('div')
        stampDiv.innerHTML = message.data.verdict === 'win' ?
          "<img src='./assets/Success.png' alt='Won the Negotiation'/>" :
          "<img src='./assets/Failure.png' alt='Lost the Negotiation'/>"
        stampDiv.className = "stamp-div"

        gameScreen.appendChild(stampDiv)


        // Replace input with feedback button instead of showing results screen
        showFeedbackButton();

      }, 1500 + Math.random() * 1000);
      break;

    default:
      console.log('Unknown message type:', message.type, message);
  }
});

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
function sendPlayerMessage() {
  const message = playerMessageInput.value.trim();

  if (!message || playerMessageInput.disabled) {
    return;
  }

  // Disable input while waiting for response
  playerMessageInput.disabled = true;
  sendMessageBtn.disabled = true;

  // Add message to the conversation
  addMessage(message, 'player');

  // Send to Devvit
  devvit.postMessage({
    type: 'playerMessage',
    data: {
      negotiationHistory: {
        scenario: gameState.scenario,
        villainProfile: gameState.villainProfile,
        messages: gameState.messages,
      },
      final: gameState.messageCount === MSG_LIMIT - 1,
      gameState: gameState.messageCount === MSG_LIMIT - 1 && gameState
    }
  });

  // Clear input
  playerMessageInput.value = '';
  charCount.textContent = '0';

  // Update message counter
  gameState.messageCount++;
  messageCounter.textContent = `${MSG_LIMIT - gameState.messageCount} messages remaining`;

  // If this was the final message, update counter text
  if (gameState.messageCount === MSG_LIMIT) {
    messageCounter.textContent = 'Final message sent';
    playerMessageInput.disabled = true;
    sendMessageBtn.disabled = true;
  }
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

// Generate a visually appealing transcript for sharing
function generateShareableTranscript() {
  const transcript = document.createElement('div');
  transcript.className = 'negotiation-transcript';

  // Add scenario
  const scenarioElement = document.createElement('div');
  scenarioElement.className = 'transcript-scenario';
  scenarioElement.innerHTML = `<h3>Scenario:</h3><p>${gameState.scenario}</p>`;
  transcript.appendChild(scenarioElement);

  // Add villain profile
  const villainElement = document.createElement('div');
  villainElement.className = 'transcript-villain';
  villainElement.innerHTML = `<h3>Faced: ${gameState.villainProfile.name}</h3>`;

  Object.entries(gameState.villainProfile).forEach(([key, value]) => {
    if (key !== 'name') {
      villainElement.innerHTML += `<p><b>${key.charAt(0).toUpperCase() + key.slice(1)}:</b> ${value}</p>`;
    }
  });
  transcript.appendChild(villainElement);

  // Add messages
  const messagesElement = document.createElement('div');
  messagesElement.className = 'transcript-messages';

  // First villain message
  messagesElement.innerHTML += `<div class="transcript-message villain">
    <div class="message-sender">Villain:</div>
    <div class="message-text">${gameState.firstMessage}</div>
  </div>`;

  // Rest of messages
  gameState.messages.forEach((msg, index) => {
    const sender = msg.role === "user" ? "You" : "Villain";
    const className = msg.role === "user" ? "player" : "villain";

    messagesElement.innerHTML += `<div class="transcript-message ${className}">
      <div class="message-sender">${sender}:</div>
      <div class="message-text">${msg.parts[0].text}</div>
    </div>`;
  });

  transcript.appendChild(messagesElement);

  // Add verdict
  const verdictElement = document.createElement('div');
  verdictElement.className = 'transcript-verdict';
  verdictElement.innerHTML = `<h3>${verdictTitle.textContent}</h3>`;
  verdictElement.innerHTML += `<p>${feedbackText.textContent}</p>`;
  transcript.appendChild(verdictElement);

  const transcriptStyle = document.createElement('style');
  transcriptStyle.textContent = `
  .negotiation-transcript {
    max-width: 800px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #1C1C1E;
    color: #FFFFFF;
    border-radius: 15px;
    overflow: hidden;
  }
  
  .transcript-scenario, .transcript-villain, .transcript-verdict {
    padding: 15px;
    border-bottom: 1px solid #343536;
  }
  
  .transcript-messages {
    padding: 10px;
  }
  
  .transcript-message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 10px;
  }
  
  .transcript-message.villain {
    background-color: #353535;
    margin-right: 20%;
  }
  
  .transcript-message.player {
    background-color: #007AFF;
    margin-left: 20%;
  }
  
  .message-sender {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .transcript-verdict h3 {
    color: #ff4500;
    margin-bottom: 10px;
  }
`;

  return transcript;
}

// Update your share button click handler to use this
// shareBtn.addEventListener('click', () => {
//   // Generate the transcript HTML
//   const transcriptHTML = generateShareableTranscript().outerHTML;

//   // Prepare data for sharing
//   const negotiationHistory = {
//     scenario: gameState.scenario,
//     villainProfile: gameState.villainProfile,
//     messages: [gameState.firstMessage, ...gameState.messages],
//     verdict: verdictTitle.textContent,
//     feedback: feedbackText.textContent,
//     transcriptHTML: transcriptHTML
//   };

//   devvit.postMessage({
//     type: 'shareResults',
//     data: {
//       negotiationHistory: negotiationHistory
//     }
//   });
// });

// Add CSS for the transcript

// document.head.appendChild(transcriptStyle);