import { proxy } from 'valtio'

export const adminSortsStore = proxy({
    sortBy: 'lastUpdated',
    sortType: 1
})
