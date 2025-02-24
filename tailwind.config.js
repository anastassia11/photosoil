/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}'
	],
	prefix: '',
	theme: {
		screens: {
			mini: '380px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		},
		container: {
			center: true,
			screens: {
				'3xl': '2400px'
			}
		},
		extend: {}
	}
}
