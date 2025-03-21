// src/gemini-service.ts
import { storyConfig, modelSetup, villainConfig, finalVerdictConfig } from "./story-model.js";

export async function getStory(apiKey: string) {
    try {
        console.log("Making Gemini API call for story...");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelSetup.model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [
                {
                    parts: [{ text: "Create a new Story" }],
                },
            ],
            systemInstruction: {
                role: "user",
                parts: [
                    {
                        text: modelSetup.sotrySystemInstruction
                    }
                ]
            },
            generationConfig: storyConfig,
            safetySettings: [], // Add safety settings if needed
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.candidates[0].content.parts[0].text
        const replyJSON = JSON.parse(replyText)
        return replyJSON
    } catch (error) {
        console.error("Error in getStory:", error);
        return null;
    }
}

export async function getVillianMessage(apiKey: string, final: boolean, negotiationHistory: { messages: any; scenario: any; villainProfile: any; }) {
    try {
        console.log("Making Gemini API call for villian Message...");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelSetup.model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: negotiationHistory.messages,
            systemInstruction: {
                role: "user",
                parts: [
                    {
                        text: `${final ? modelSetup.finalVerdictSystemInstruction : modelSetup.villianSystemInstruction}  \n\n Our scenario and villian profile is: \n\n scenario: ${negotiationHistory.scenario}\n villainProfile: ${negotiationHistory.villainProfile}`
                    }
                ]
            },
            generationConfig: final ? finalVerdictConfig : villainConfig,
            safetySettings: [], // Add safety settings if needed
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("check:", data.candidates[0].content)
        const replyText = data.candidates[0].content.parts[0].text
        const replyJSON = JSON.parse(replyText)
        return replyJSON
    } catch (error) {
        console.error("Error in getStory:", error);
        return null;
    }
}