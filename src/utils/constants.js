export const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BASE_SERVER_URL
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const PAGINATION_OPTIONS = {
	0: '12',
	1: '24',
	2: '48',
	3: '96'
}

export const PAGINATION_DATA = {
	soils: {
		num: 0,
		children: {
			ecosystems: 0,
			publications: 0,
		}
	},
	profiles: {
		num: 0,
		children: {
			ecosystems: 0,
			publications: 0,
		}
	},
	morphological: {
		num: 0,
		children: {
			ecosystems: 0,
			publications: 0,
		}
	},
	dynamics: {
		num: 0,
		children: {
			ecosystems: 0,
			publications: 0,
		}
	},
	ecosystems: {
		num: 0,
		children: {
			soils: 0,
			publications: 0,
		}
	},
	publications: {
		num: 0,
		children: {
			soils: 0,
			ecosystems: 0,
		}
	},
	authors: {
		num: 0,
		children: {
			soils: 0,
			ecosystems: 0,
		}
	},
	news: {
		num: 0
	}
}
