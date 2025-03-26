import { Devvit } from "@devvit/public-api";

export const BeforeGame = (props: { username: string, mount: any }): JSX.Element => {
    const { username, mount } = props;

    return (
        <vstack
            padding="medium"
            cornerRadius="large"
            gap="medium"
            alignment="center middle"
            backgroundColor="rgba(0,0,0, 0.5)"
            border="thin"
            borderColor="rgba(255,255,255,0.7)"
        >
            <text
                size="xxlarge"
                weight="bold"
                color="#CE2127"
            >
                NEGOTIATE WITH AI
            </text>

            <text size="medium" color="#FFFFFF" alignment="center">
                Test your persuasion skills against a cunning AI villain
            </text>

            <vstack gap="small" alignment="center middle" width="100%">
                <text color="#CCCCCC">Welcome, User {username}</text>

                <button
                    // appearance=""
                    size="large"
                    onPress={mount}
                >
                    BEGIN NEGOTIATION
                </button>
            </vstack>

            <vstack
                padding="medium"
                backgroundColor="#2A2A2A"
                cornerRadius="medium"
                gap="medium"
                width="100%"
            >

                <hstack alignment="center middle" gap="small">
                    <icon name="warning" color="#FFCC00" size="small" />
                    <text weight="bold" color="#FFFFFF">Game Overview</text>
                </hstack>

                < text wrap color="#CCCCCC" alignment="center">
                    Face a unique AI villain in a high-stakes negotiation with just 5 messages to succeed
                </text>

                <vstack gap="small" padding="small">
                    <hstack gap="small">
                        <text color="#FF5700">•</text>
                        < text wrap color="#CCCCCC">AI generates a unique scenario and villain</text>
                    </hstack>
                    <hstack gap="small">
                        <text color="#FF5700">•</text>
                        < text wrap color="#CCCCCC">Send strategic messages (150-200 characters each)</text>
                    </hstack>
                    <hstack gap="small">
                        <text color="#FF5700">•</text>
                        < text wrap color="#CCCCCC">AI responds dynamically to your approach</text>
                    </hstack>
                    <hstack gap="small">
                        <text color="#FF5700">•</text>
                        < text wrap color="#CCCCCC">Receive verdict and expert feedback</text>
                    </hstack>
                    <hstack gap="small">
                        <text color="#FF5700">•</text>
                        < text wrap color="#CCCCCC">Share your results with the Reddit community</text>
                    </hstack>
                </vstack>
            </vstack>
        </vstack>
    );
};