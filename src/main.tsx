import './createPost.js';

import { Devvit, JSONObject, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';
import { getStory, getVillianMessage } from './gemini.server.js';
import { fakeStory } from './story-model.js';
import { AfterGame } from './AfterGame.js';
import { BeforeGame } from './BeforeGame.js';
import { nameBackSvg } from './negotiation.js';

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



    const [isEnd, setIsEnd] = useState<{ val: boolean, data: JSONObject }>({ val: false, data: {} });

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
                username: username
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
          case "playerMessage":
            console.log(message)
            const villainResponse = await getVillianMessage(apiKey as string, message.data.final, message.data.negotiationHistory)
            message.data.final && setIsEnd({
              val: true,
              data: message.data.gameState
            })
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

    const dimensions = context.dimensions;

    // Render the custom post type
    const resizeWidth = dimensions != undefined ? dimensions.width : 800
    const resizeHeight = dimensions != undefined ? dimensions.height : 800
    // console.log(resizeHeight, resizeWidth, resizeHeight - 20, resizeWidth - 20)
    return (

      <blocks height='tall'>
        <zstack maxWidth={800} backgroundColor='#1C1C1C'>
          {/* <GameBackground /> */}
          <vstack width={`${resizeWidth}px`} height={`${resizeHeight}px`} padding='large'>
            <image
              imageHeight={resizeHeight - 20}
              imageWidth={resizeWidth - 20}
              height={"100%"}
              width={"100%"}
              description={""}
              resizeMode="fill"

              // url={context.assets.getURL('background.JPG')}
              url={nameBackSvg}
            />
          </vstack>
          <vstack width={`${resizeWidth}px`} height={`${resizeHeight}px`} padding='large'>
            {!isEnd.val ?
              <BeforeGame username={username} mount={webView.mount} />
              :
              <AfterGame context={context} username={username} gameState={isEnd.data} />
            }
          </vstack>
        </zstack>
      </blocks>

    );
  },
});

export default Devvit;



