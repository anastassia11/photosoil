import { getPublications } from '@/api/publication/get_publications'
import { useQuery } from '@tanstack/react-query'

export default function usePublications() {
    const { data, isLoading } = useQuery({
        queryKey: ['publications'],
        queryFn: getPublications,
        select: res => res.data
    })

    return { data, isLoading }
}
