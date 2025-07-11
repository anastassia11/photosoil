import { getEcosystem } from '@/api/ecosystem/get_ecosystem'
import { useQuery } from '@tanstack/react-query'

export default function useEcosystem(id) {
    const { data: ecosystem, isLoading: ecosystemIsLoading } = useQuery({
        queryKey: ['ecosystem', id],
        queryFn: () => getEcosystem(id),
        select: res => res.data
    })

    return {
        ecosystem, ecosystemIsLoading,
    }
}
