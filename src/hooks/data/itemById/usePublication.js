import { getPublication } from '@/api/publication/get_publication'
import { useQuery } from '@tanstack/react-query'

export default function usePublication(id) {
    const { data: publication, isLoading: publicationIsLoading } = useQuery({
        queryKey: ['publication', id],
        queryFn: () => getPublication(id),
        select: res => res.data
    })

    return {
        publication, publicationIsLoading,
    }
}
