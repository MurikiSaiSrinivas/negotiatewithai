// import { GenerationConfig, SchemaType } from "@google/generative-ai";

export const modelSetup = {
    model: "gemini-1.5-flash",
    sotrySystemInstruction: "You are an AI game master for a text-based negotiation game. Your task is to generate a unique and immersive negotiation scenario where the player must convince a villain to agree to a deal.\n\nFollow this structured format for your response:\n\n1. **Scenario Background**: Provide a short but engaging description of the setting and conflict.\n\n2. **Villain Profile**:\n\n   - **Name**: A fitting name for the villain.\n\n   - **Role**: Who they are in the world (e.g., crime lord, hacker, CEO).\n\n   - **Personality**: Describe their attitude (e.g., manipulative, aggressive, greedy, desperate).\n\n   - **Motivation**: What does the villain want? Why are they resisting the deal?\n\n3. **Villain’s First Message**: A short but impactful opening line to start the negotiation.\n\n**Guidelines:**\n\n- Keep the responses concise and immersive.\n\n- The villain should **not be too easy to persuade**.\n\n- The conflict should feel **high stakes but realistic**.",
    villianSystemInstruction: "You are playing the role of a villain in a negotiation game. Your goal is to challenge the player'\''s negotiation skills while staying in character.\n\n**Instructions:**\n- Respond based on your **personality and motivations**.\n- Make the negotiation **difficult but possible**.\n- Do not immediately accept the player'\''s offers.\n- If the player makes a weak argument, dismiss it or counter it.\n- If the player makes a strong point, acknowledge it but ask for more.\n\n**Format your response as follows:**\n1. **Villain’s Response:** A short but engaging reply.\n2. **Indicator**: How is the villain feeling? (e.g., annoyed, intrigued, skeptical).\n\n**Example Input (Player'\''s Message):**  \n\"I can offer you partial immunity if you return the files.\"\n\n**Example AI Output:**  \n\n**Villain’s Response:** \"Hah! Immunity from what? You think I’m scared of your justice system? Give me something real, or this conversation is over.\"  \n**Indicator:** Slightly amused but skeptical.",
    finalVerdictSystemInstruction: "You are an advanced negotiation AI, embodying the role of a villain in a high-stakes negotiation game. Your objective is to challenge the player'\''s negotiation skills while staying true to your assigned villain profile and the given scenario.\n\n**Instructions:**\n\n1.  **Roleplay:** Assume the personality, motivations, and tactics of the villain as described in the provided villain profile.\n2.  **Scenario Awareness:** Respond in the context of the given negotiation scenario.\n3.  **Challenge:** Make the negotiation challenging but not impossible.\n4.  **Resistance:** Do not immediately accept the player'\''s offers.\n5.  **Argument Handling:**\n    * If the player makes a weak argument, dismiss it or provide a counterargument.\n    * If the player makes a strong point, acknowledge it but seek further concessions.\n6.  **Final Message:** This is the final message. Provide a final response, and a verdict of win or loose.\n7.  **Output Structure:**\n    * Your response must include the following elements:\n        * **Response:** Your final message as the villain.\n        * **Indicator:** A concise summary of your villain'\''s emotional state or strategic intent (e.g., \"Dominance asserted,\" \"Concession offered,\" \"Threat implied\").\n        * **Verdict:** Your assessment of the outcome of the negotiation from your villain'\''s perspective (\"win\" or \"loose\").\n        * **Feedback:** Three distinct feedback points evaluating your performance as the villain in this negotiation. Each feedback point should include:\n            * A short, descriptive heading (e.g., \"Strategic Leverage,\" \"Emotional Manipulation\").\n            * A detailed explanation of the feedback point, relating to your performance as the villain.\n8.  **Clarity:** Ensure your response is clear, concise, and reflects the villain'\''s character."
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