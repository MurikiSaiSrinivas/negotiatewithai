import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';
import { getStory, getVillianMessage } from './gemini.server.js';
import { fakeStory } from './story-model.js';

Devvit.configure({
  http: true,
  redditAPI: true,
  redis: true,
});

// Add settings for Gemini API key
Devvit.addSettings([
  {
    // Name of the setting which is used to retrieve the setting value
    name: 'gemini-api-key',
    // This label is used to provide more information in the CLI
    label: 'Gemini AI API key',
    // Type of the setting value
    type: 'string',
    // Marks a setting as sensitive info - all secrets are encrypted
    isSecret: true,
    // Defines the access scope
    // app-scope ensures only developers can create/replace secrets via CLI
    scope: 'app',
  },
]);

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Negotiate With AI',
  description: "Test your negotiation skills against an AI villain",
  height: 'tall',
  render: (context) => {

    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const [apiKey] = useState(async () => {
      return (await context.settings.get("gemini-api-key")) ?? 'anon';
    });
    // console.log("apiKey", apiKey)

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'page.html',

      // Handle messages sent from the web view.
      async onMessage(message, webView) {
        switch (message.type) {
          case 'webViewReady':
            webView.postMessage({
              type: 'initialData',
              data: {
                username: username,
                apiKey: apiKey as string
              },
            });

            // const story = await getStory(apiKey as string)
            webView.postMessage({
              type: 'gameStart',
              data: fakeStory
              // data: {
              //   scenario: story.response.scenario,
              //   villainProfile: story.response.villainProfile,
              //   firstMessage: story.response.villainFirstMessage
              // },
            });
            break;
          // case 'startGame':
          //   // const story = await getStory(apiKey as string)
          //   webView.postMessage({
          //     type: 'gameStart',
          //     data: fakeStory
          //     // data: {
          //     //   scenario: story.response.scenario,
          //     //   villainProfile: story.response.villainProfile,
          //     //   firstMessage: story.response.villainFirstMessage
          //     // },
          //   });
          //   break;

          case "playerMessage":
            console.log(message)
            const villainResponse = await getVillianMessage(apiKey as string, message.data.final, message.data.negotiationHistory)
            message.data.final ?
              webView.postMessage({
                type: 'gameEnd',
                data: {
                  message: villainResponse.response,
                  indicator: villainResponse.indicator,
                  verdict: villainResponse.verdict,
                  feedback: villainResponse.feedback
                },
              }) :
              webView.postMessage({
                type: 'villainResponse',
                data: {
                  message: villainResponse.response,
                  indicator: villainResponse.indicator
                },
              });
            break;
          default:
            throw new Error(`Unknown message type: ${message}`);
        }
      },
      onUnmount() {
        context.ui.showToast('Web view closed!');
      },
    });

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <image url='./Negotiation-back.JPG' imageHeight="100px" imageWidth="100px"></image>
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">
            Welcome to Negotiate With AI..
          </text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Username:</text>
              <text size="medium" weight="bold">
                {' '}
                {username ?? ''}
              </text>
            </hstack>
            <hstack>
              <text size="medium">Current counter:</text>
              <text size="medium" weight="bold">
                {' '}
              </text>
            </hstack>
          </vstack>
          <spacer />
          <button onPress={() => webView.mount()}>Launch App</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
