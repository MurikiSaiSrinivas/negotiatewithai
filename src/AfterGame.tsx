import { Devvit, useState } from "@devvit/public-api"
import { MessageComponent } from "./MessageComponent.js"
import { FeedbackComponent } from "./FeedbackComponent.js"

export const AfterGame = (props: { context: any; username: any; gameState: any}): JSX.Element => {

    const { context, username, gameState } = props

    const {  feedback, messages, scenario, villainProfile } = gameState

    const tabs = ["Scenario", "Villain Profile", "Messages", "Verdict"]



    const [expandedSection, setExpandedSection] = useState(0)

    const toggleLeft = () => {
        setExpandedSection((prev: number) => {
            if (prev === 0) {
                return tabs.length - 1
            }
            return prev - 1
        })
    }

    const toggleRight = () => {
        setExpandedSection((prev: number) => {
            if (prev === tabs.length - 1) {
                return 0
            }
            return prev + 1
        })
    }


    const getComponents = (selected: number) => {
        switch (selected) {
            case 0:
                return (
                    <vstack padding="small">
                        <text color='#D3D3D3' wrap maxHeight={"100%"} overflow='ellipsis'>{scenario}</text>
                    </vstack>)
            case 1:
                return (
                    Object.entries(villainProfile).map(([key, value]) => {
                        return (
                            <vstack padding="small" key={key} alignment="start">
                                <text color='#D3D3D3' weight="bold">{key.charAt(0).toUpperCase() + key.slice(1)}:</text>
                                {/* <spacer size="xsmall" /> */}
                                <text color='#D3D3D3' wrap maxHeight={"100%"} overflow='ellipsis'>{value as string}</text>
                            </vstack>
                        )
                    })
                )
            case 2:
                return (
                    <MessageComponent context={context} messages={messages} username={username} villainName={villainProfile.name} />
                )
            case 3:
                return (<FeedbackComponent context={context} feedback={feedback} />)
            default:
                return (<text color='#D3D3D3'>Something Went wrong</text>)
        }
    }

    return (

        <vstack
            maxWidth={800}
            width={"100%"}
            padding="medium"
            cornerRadius="medium"
        >
            <hstack padding="large" alignment='middle center' >
                <icon color='#D3D3D3' grow name='left' size='small' onPress={() => toggleLeft()} />
                <text color='#D3D3D3' size="xlarge" weight="bold">{tabs[expandedSection]}</text>
                <vstack grow alignment='end' onPress={() => toggleRight()}>
                    <icon
                        name={'right'}
                        size="small"
                        color='#D3D3D3'
                    />
                </vstack>
            </hstack>
            <vstack>
                {getComponents(expandedSection)}
            </vstack>
        </vstack>
    )
}