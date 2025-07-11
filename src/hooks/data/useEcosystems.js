import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import { useQuery } from '@tanstack/react-query'

export default function useEcosystems() {
    const { data, isLoading } = useQuery({
        queryKey: ['ecosystems'],
        queryFn: getEcosystems,
        select: res => res.data
    })

    return { data, isLoading }
}
