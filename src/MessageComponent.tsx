import { usePagination } from "@devvit/kit";
import { Devvit } from "@devvit/public-api";

export const MessageComponent = (props: { context: Devvit.Context, messages: messageType[], username: string, villainName: string }): JSX.Element => {
    const { context, messages, username, villainName } = props

    const { currentPage, currentItems, toNextPage, toPrevPage, isFirstPage, isLastPage } = usePagination(context, messages, 2);

    return (
        <vstack padding="small">
            <vstack alignment="center middle" width={"100%"} padding="small" onPress={toPrevPage}>
                <icon color={isFirstPage ? '#1C1C1C' : '#D3D3D3'} name='up' />
            </vstack>
            {currentItems.map((msg: messageType, key: number) => {
                return (
                    <vstack padding='small' key={`${key}`} alignment='start'>
                        <text color='#D3D3D3' weight="bold">{msg.role === "model" ? villainName : username}</text>
                        <text color='#D3D3D3' wrap maxHeight={"100%"} overflow='ellipsis'>{msg.parts[0].text}</text>
                    </vstack>
                )
            })}
            <vstack alignment="center middle" width={"100%"} padding="small" onPress={toNextPage} >
                <icon color={isLastPage ? '#1C1C1C' : '#D3D3D3'} name='down' />
            </vstack>
        </vstack>
    )
}

type messageType = { role: string, parts: { text: string }[] }