export const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BASE_SERVER_URL
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const SOIL_INFO = [
    { name: 'objectType', titleRu: 'Тип объекта базы данных' },
    { name: 'geographicLocation', titleRu: 'Географическая привязка' },
    { name: 'reliefLocation', titleRu: 'Расположение объекта в рельефе' },
    { name: 'plantCommunity', titleRu: 'Растительное сообщество' },
    { name: 'soilFeatures', titleRu: 'Особенности почвы' },
    // { name: 'authors', titleRu: 'Авторы' },

]

export const SOIL_TEMPLATE = {
    "latitude": "",
    "longtitude": "",
    "name": "",
    "geographicLocation": "",
    "reliefLocation": "",
    "plantCommunity": "",
    "soilFeatures": "",
    "associatedSoilComponents": "",
    "code": "",
    "comments": "",
    "photoId": null,
    "authors": [],
    "objectType": null,
    "objectPhoto": [],
    "soilTerms": [],
    "publications": [],
    "ecoSystems": []
}

export const CATEGORIES = [
    { name: 'Динамика почв', id: 0 },
    { name: 'Почвенные профили', id: 1 },
    { name: 'Почвенные морфологические элементы', id: 2 }]