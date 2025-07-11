import { getSoil } from '@/api/soil/get_soil'
import { useQuery } from '@tanstack/react-query'

export default function useSoil(id) {
    const { data: soil, isLoading: soilIsLoading } = useQuery({
        queryKey: ['soil', id],
        queryFn: () => getSoil(id),
        select: res => res.data
    })

    return {
        soil, soilIsLoading,
    }
}
