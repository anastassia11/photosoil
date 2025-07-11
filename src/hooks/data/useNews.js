import { getAllNews } from '@/api/news/get_allNews'
import { getTags } from '@/api/tags/get_tags'
import { useQuery } from '@tanstack/react-query'

export default function useNews() {
    const { data: news, isLoading: newsIsLoading } = useQuery({
        queryKey: ['news'],
        queryFn: getAllNews,
        select: res => res.data
    })

    const { data: tags, isLoading: tagsIsLoading } = useQuery({
        queryKey: ['tags'],
        queryFn: getTags,
        select: res => res.data
    })

    return {
        news, newsIsLoading,
        tags, tagsIsLoading
    }
}
