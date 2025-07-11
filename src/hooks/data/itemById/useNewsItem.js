import { getNewsById } from '@/api/news/get_news'
import { useQuery } from '@tanstack/react-query'

export default function useNewsItem(id) {
    const { data: news, isLoading: newsIsLoading } = useQuery({
        queryKey: ['news', id],
        queryFn: () => getNewsById(id),
        select: res => res.data
    })

    return {
        news, newsIsLoading,
    }
}
