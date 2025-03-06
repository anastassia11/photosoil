import { proxy } from 'valtio';

export const dropdownStore = proxy({
    isActive: false,
    key: null
})