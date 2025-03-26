import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';
import { getStory, getVillianMessage } from './gemini.server.js';
import { AfterGame } from './AfterGame.js';
import { BeforeGame } from './BeforeGame.js';
import { emojis, failureSvg, nameBackSvg, successSvg } from './negotiation.js';
import { fakeStory } from './story-model.js';

Devvit.configure({
  http: true,
  redditAPI: true,
  redis: true,
});

// Add settings for Gemini API key
Devvit.addSettings([
  {
    name: 'gemini-api-key',
    label: 'Gemini AI API key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
]);

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Negotiate With AI',
  description: "Test your negotiation skills against an AI villain",
  height: 'tall',
  render: (context) => {

    // Fetch user data and API key
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const [apiKey] = useState(async () => {
      return (await context.settings.get("gemini-api-key")) ?? 'anon';
    });

    console.log("Username:", username);
    console.log("API Key Retrieved:", apiKey || apiKey !== 'anon' ? "Yes" : "No");

    // Fetch game state
    const gameStateKey = `game-state-${context.postId}`;
    const messagesKey = `messages-${context.postId}`;


    const [isEnd, setIsEnd] = useState<{ val: boolean, gameState: any }>(async () => {
      const stateString = await context.redis.get(gameStateKey);
      const stateMessages = await context.redis.get(messagesKey);
      if (stateString && stateMessages) {
        const data = JSON.parse(stateString)
        return {
          val: data.final,
          gameState: { ...data, messages: JSON.parse(stateMessages) },
        };
      }
      return { val: false, gameState: {} }
    });

    const updateMessages = async (messages: any) => {
      await context.redis.set(messagesKey, JSON.stringify(messages));
    };

    const updateGameState = async (gameState: any) => {
      await context.redis.set(gameStateKey, JSON.stringify(gameState));
    }

    const initGameState = async (scenario: string, villainProfile: { name: string; role: string; personality: string; motivation: string; }) => {
      const newState = {
        scenario,
        villainProfile,
        username,
        final: false,
      };
      setIsEnd({ val: false, gameState: newState });
      updateGameState(newState);
      updateMessages([]);
    };

    const finalState = async (messages: any, feedback: any, verdict: any) => {
      setIsEnd((prev) => ({
        val: true,
        gameState: {
          ...prev.gameState,
          final: true,
          messages,
          feedback,
          verdict,
        },
      }));
      console.log("isEnd", isEnd.gameState)
      updateGameState({
        ...isEnd.gameState, final: true,
        feedback,
        verdict
      });
      messages.map((msg: any) => console.log(msg))
      updateMessages(messages);
    };

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'page.html',

      // Handle messages sent from the web view.
      async onMessage(message, webView) {
        switch (message.type) {

          case 'webViewReady':
            webView.postMessage({ type: 'initialData', data: { username } });
            const story = await getStory(apiKey as string)
            await initGameState(story.response.scenario, story.response.villainProfile);
            webView.postMessage({
              type: 'gameStart', 
              data: {
                scenario: story.response.scenario,
                villainProfile: story.response.villainProfile,
                firstMessage: story.response.villainFirstMessage
              },
            });
            break;

          case 'playerMessage':
            const villainResponse = await getVillianMessage(apiKey as string, message.data.final, message.data.negotiationHistory);
            if (message.data.final) {
              const finalMessage = [...message.data.negotiationHistory.messages, { role: 'model', parts: [{ text: villainResponse.response }] }, { role: 'model', parts: [{ text: villainResponse.indicator }] }]
              await finalState(finalMessage, villainResponse.feedback, villainResponse.verdict);
              webView.postMessage({ type: 'gameEnd', data: { message: villainResponse.response, ...villainResponse } });
            } else {
              updateMessages(message.data.negotiationHistory.messages);
              webView.postMessage({ type: 'villainResponse', data: { message: villainResponse.response, indicator: villainResponse.indicator } });
            }
            break;

          default:
            console.warn("Unknown message type received:", message.type);
        }
      },
      onUnmount() {
        context.ui.showToast('Web view closed!');
      },
    });

    const { width = 800, height = 800 } = context.dimensions || {};

    return (

      <blocks height='tall'>
        <zstack maxWidth={800} backgroundColor='#1C1C1C'>
          <vstack width={`${width}px`} height={`${height}px`}>
            <text wrap height={"100%"} width={"100%"} size='xxlarge'>{emojis}{emojis}{emojis}</text>
          </vstack>
          <vstack width={`${width}px`} height={`${height}px`} backgroundColor='rgba(0,0,0,0.8)'>
          </vstack>
          <vstack width={`${width}px`} height={`${height}px`} padding='large'>
            <image
              imageHeight={height - 20}
              imageWidth={width - 20}
              height={'100%'}
              width={'100%'}
              description={'Background Image'}
              resizeMode='fill'
              url={nameBackSvg}
            />
          </vstack>
          <vstack width={`${width}px`} height={`${height}px`} padding='medium'>
            {!isEnd.val ? (
              <BeforeGame username={username} mount={webView.mount} />
            ) : (
              <AfterGame context={context} username={username} gameState={isEnd.gameState} />
            )}
          </vstack>
          <vstack width={`${width}px`} height={`${height}px`} alignment='bottom end'>
            {isEnd.val &&
              <image
                imageHeight={height}
                imageWidth={width}
                height={'20%'}
                width={'20%'}
                description={'Success or Failure stamp'}
                resizeMode='fill'
                url={isEnd.gameState.verdict === 'win' ? successSvg : failureSvg}
              />}
          </vstack>
        </zstack>
      </blocks>

    );
  },
});

export default Devvit;
