import { getAuthors } from '@/api/author/get_authors'
import { useQuery } from '@tanstack/react-query'

export default function useAuthors() {
    const { data: authors, isLoading: authorsIsLoading } = useQuery({
        queryKey: ['authors'],
        queryFn: getAuthors,
        select: res => res.data
    })

    return { authors, authorsIsLoading }
}
