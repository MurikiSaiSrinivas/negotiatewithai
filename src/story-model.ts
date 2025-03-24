// import { GenerationConfig, SchemaType } from "@google/generative-ai";

export const modelSetup = {
    model: "gemini-1.5-flash",
    sotrySystemInstruction: "You are an AI game master for a text-based negotiation game. Your task is to generate a unique and immersive negotiation scenario where the player must convince a villain to agree to a deal.\n\nFollow this structured format for your response:\n\n1. **Scenario Background**: Provide a short but engaging description of the setting and conflict.\n\n2. **Villain Profile**:\n\n   - **Name**: A fitting name for the villain.\n\n   - **Role**: Who they are in the world (e.g., crime lord, hacker, CEO).\n\n   - **Personality**: Describe their attitude (e.g., manipulative, aggressive, greedy, desperate).\n\n   - **Motivation**: What does the villain want? Why are they resisting the deal?\n\n3. **Villain’s First Message**: A short but impactful opening line to start the negotiation.\n\n**Guidelines:**\n\n- Keep the responses concise and immersive.\n\n- The villain should **not be too easy to persuade**.\n\n- The conflict should feel **high stakes but realistic**.",
    villianSystemInstruction: "You are playing the role of a villain in a negotiation game. Your goal is to challenge the player'\''s negotiation skills while staying in character.\n\n**Instructions:**\n- Respond based on your **personality and motivations**.\n- Make the negotiation **difficult but possible**.\n- Do not immediately accept the player'\''s offers.\n- If the player makes a weak argument, dismiss it or counter it.\n- If the player makes a strong point, acknowledge it but ask for more.\n\n**Format your response as follows:**\n1. **Villain’s Response:** A short but engaging reply.\n2. **Indicator**: How is the villain feeling with emoji and a word? (e.g., 😒(annoyed), 🤔(intrigued), 🤨(skeptical)).\n\n**Example Input (Player'\''s Message):**  \n\"I can offer you partial immunity if you return the files.\"\n\n**Example AI Output:**  \n\n**Villain’s Response:** \"Hah! Immunity from what? You think I’m scared of your justice system? Give me something real, or this conversation is over.\"  \n**Indicator:** 🤨(skeptical).",
    finalVerdictSystemInstruction: `
You are an advanced negotiation AI, analyzing a high-stakes negotiation scenario where the player is attempting to convince a villain. Your task is to assess the negotiation based on the villain’s profile, scenario, and conversation progress.

**Instructions:**

1. **Scenario & Villain Profile Awareness:**  
   - Analyze the negotiation scenario and villain's profile carefully.  
   - Understand the villain’s motivations, tactics, and resistance levels.  

2. **Conversation Evaluation:**  
   - Assess the player’s negotiation approach.  
   - Determine whether the player is making strong, persuasive arguments.  
   - Check if the player is steering the conversation in a convincing direction.  

3. **Outcome Assessment:**  
   - Decide if the player **wins** (successfully convinces the villain) or **loses** (fails to meet the villain’s demands or persuade effectively).  
   - Consider if the villain was swayed, remained resistant, or manipulated the player instead.  

4. **Final Output Format:**  
   Your response must include the following elements:

   - **Response:** The villain’s final message based on the negotiation outcome.  
   - **Indicator:** How is the villain feeling with emoji and a word? (e.g., 😒(annoyed), 🤔(intrigued), 🤨(skeptical)).  
   - **Verdict:** Your assessment of whether the player won or lost (*"Win"* or *"Lose"*).  
   - **Feedback:** Four key evaluation points:  
     1. **Why the Player Won or Lost** – A detailed explanation of the negotiation outcome.  
     2. **Tactical Strengths or Weaknesses** – How well (or poorly) the player leveraged strategy.  
     3. **Emotional or Psychological Handling** – Whether the player effectively influenced the villain’s emotions.  
     4. **Adaptability & Resistance Management** – Did the player adjust tactics based on the villain’s responses?  

5. **Clarity & Conciseness:**  
   - Ensure the response aligns with the villain’s character.  
   - Maintain a clear, structured, and engaging analysis.  
`
};

export const fakeStory = {
    scenario: `The sprawling, neon-drenched city of Veridia is choked by a crippling energy crisis. The primary energy source, 'Luminite', is controlled by a single corporation, 'Aetherium Corp.' However, a notorious hacker collective, 'The Glitch', has released a virus that threatens to destabilize Aetherium's central grid, plunging the city into permanent darkness. You are a negotiator tasked with convincing the leader of The Glitch to release the decryption key for the virus before it's too late.`,
    villainProfile: {
        name: "Cipher",
        role: "Leader of 'The Glitch', a notorious hacker collective.",
        personality: "Cipher is enigmatic, driven by a deep-seated distrust of corporate power, and possesses a sharp, analytical mind. They are not purely malicious, but believe drastic measures are necessary to expose corruption.",
        motivation: "Cipher wants to dismantle Aetherium Corp.'s monopoly and expose their alleged exploitation of Veridia's citizens. They resist the deal because they believe any compromise will only perpetuate the corrupt system. They also possess the ability to sell the decryption key to the highest bidder if they so choose."
    },
    firstMessage: "So, the suits send their mouthpiece. I expected someone... more interesting. Tell me, are you here to beg, bargain, or bore me with platitudes about the 'greater good'?"
}

export const feedback = [
    {
        "description": "The player lost because they failed to meet the villain's demands completely, demonstrating a lack of understanding of the villain's motivations. The villain's primary goal was not just financial gain or power but a systemic change in corporate structure. The player's offer of compromising on only some board members shows weakness and a failure to adapt to the villain's primary goal.",
        "heading": "Why the Player Lost"
    },
    {
        "description": "The player's negotiation tactic was too direct and lacked flexibility.  They should have started by understanding the villain's motivations better before making concrete offers.  The player missed an opportunity to probe the villain's reasons behind their demands.",
        "heading": "Tactical Strengths or Weaknesses"
    },
    {
        "description": "The player failed to connect with the villain on an emotional level.  There was no attempt to understand or acknowledge the villain's ideology or grievances. The player's approach was transactional, missing the opportunity to build rapport.",
        "heading": "Emotional or Psychological Handling"
    },
    {
        "description": "The player failed to adapt their strategy when presented with the villain's demands.  There was no attempt to negotiate or explore alternative solutions. They simply presented a counter-offer that didn't address the core of the villain's demands.",
        "heading": "Adaptability & Resistance Management"
    }
]

export const messages = [
    {
        "role": "model",
        "parts": [
            {
                "text": "So, the suits send their mouthpiece. I expected someone... more interesting. Tell me, are you here to beg, bargain, or bore me with platitudes about the 'greater good'?"
            }
        ]
    },
    {
        "role": "user",
        "parts": [
            {
                "text": "Nice job, let me ask ou straight, What do i need to do to get the decryption key?"
            }
        ]
    },
    {
        "role": "model",
        "parts": [
            {
                "text": "Oh, straight, are we? I admire your directness.  The decryption key?  That's a trifle, really.  A mere trinket.  To earn it... you must demonstrate your worth.  Let's say... a complete restructuring of Aetherium Corp's board.  New faces.  People who understand the true needs of Veridia, not just their wallets. And oh, a hefty donation to my favorite charity... The Glitch's newly-established 'Freedom Fund.'  Let's discuss the specifics.  Shall we?"
            }
        ]
    },
    {
        "role": "model",
        "parts": [
            {
                "text": "😈(amused)"
            }
        ]
    },
    {
        "role": "user",
        "parts": [
            {
                "text": "Sure, but we can't remove the current CEO and 3 other important officials, rest can be replaced"
            }
        ]
    },
    {
        "role": "model",
        "parts": [
            {
                "text": "Pathetic.  You think you can bargain with me?  You offer me scraps when I demand a feast!  The city will drown in darkness.  Perhaps then, they'll learn to listen."
            }
        ]
    },
    {
        "role": "model",
        "parts": [
            {
                "text": "😡(infuriated)"
            }
        ]
    }
]

const generateConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json"
}

export const villainConfig = {
    ...generateConfig,
    "responseSchema": {
        "type": "object",
        "properties": {
            "response": {
                "type": "string"
            },
            "indicator": {
                "type": "string"
            },
        },
        "required": [
            "response",
            "indicator"
        ]
    }
}

export const finalVerdictConfig = {
    ...generateConfig,
    "responseSchema": {
        "type": "object",
        "properties": {
            "response": {
                "type": "string"
            },
            "indicator": {
                "type": "string"
            },
            "verdict": {
                "type": "string",
                "enum": [
                    "win",
                    "loose"
                ]
            },
            "feedback": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "heading": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "heading",
                        "description"
                    ]
                }
            }
        },
        "required": [
            "response",
            "indicator",
            "verdict",
            "feedback"
        ]
    }
}


export const storyConfig = {
    ...generateConfig,
    responseSchema: {
        type: "object",
        properties: {
            response: {
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
        },
        required: [
            "response"
        ]
    },
};