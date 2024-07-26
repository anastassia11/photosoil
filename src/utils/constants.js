
export const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BASE_SERVER_URL
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const PAGINATION_OPTIONS = {
    0: '10',
    1: '30',
    2: '50',
    3: '100',
};

export const CATEGORIES = [
    { name: 'Динамика почв', id: 0 },
    { name: 'Почвенные профили', id: 1 },
    { name: 'Почвенные морфологические элементы', id: 2 }]