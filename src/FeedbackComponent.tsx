import { usePagination } from "@devvit/kit";
import { Devvit } from "@devvit/public-api";

export const FeedbackComponent = (props: { context: Devvit.Context, feedback: { heading: string; description: string; }[] }): JSX.Element => {

    const { context, feedback } = props
    const { currentPage, currentItems, toNextPage, toPrevPage, isFirstPage, isLastPage } = usePagination(context, feedback, 1);

    return (<vstack padding="small" alignment="center middle">
        <text color='#D3D3D3' size="large" weight="bold">Negotiation is Succesfull</text>
        <vstack alignment="center middle" width={"100%"} padding="small" onPress={toPrevPage}>
            <icon color={isFirstPage ? '#1C1C1C' : '#D3D3D3'} name='up' />
        </vstack>
        {currentItems.map((feed: { heading: string; description: string; }, key: any) => {
            return (
                <vstack padding='small' key={`${key}`} alignment='start'>
                    <text color='#D3D3D3' weight="bold">{feed.heading}</text>
                    <text color='#D3D3D3' wrap maxHeight={"100%"} overflow='ellipsis'>{feed.description}</text>
                </vstack>
            )
        })}
        <vstack alignment="center middle" width={"100%"} padding="small" onPress={toNextPage} >
            <icon color={isLastPage ? '#1C1C1C' : '#D3D3D3'} name='down' />
        </vstack>
    </vstack>)
}