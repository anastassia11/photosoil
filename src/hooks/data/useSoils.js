import { getSoils } from '@/api/soil/get_soils'
import { useQuery } from '@tanstack/react-query'

export default function useSoils() {
    const { data: soils, isLoading: soilsIsLoading } = useQuery({
        queryKey: ['soils'],
        queryFn: getSoils,
        select: res => res.data
    })

    return {
        soils, soilsIsLoading,
    }
}
