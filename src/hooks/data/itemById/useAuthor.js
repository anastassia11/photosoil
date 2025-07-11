import { getAuthor } from '@/api/author/get_author'
import { useQuery } from '@tanstack/react-query'

export default function useAuthor(id) {
    const { data: author, isLoading: authorIsLoading } = useQuery({
        queryKey: ['author', id],
        queryFn: () => getAuthor(id),
        select: res => res.data
    })

    return { author, authorIsLoading }
}
