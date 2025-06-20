/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'ares.ftf.tsu.ru',
				port: '',
				pathname: '/**'
			},
			{
				protocol: 'http',
				hostname: 'ares.ftf.tsu.ru',
				port: '1515',
				pathname: '/**'
			},
			{
				protocol: 'http',
				hostname: '80.78.243.185',
				port: '1515',
				pathname: '/**'
			},
			{
				protocol: 'http',
				hostname: '62.217.177.64',
				port: '1515',
				pathname: '/**'
			},
			{
				protocol: 'http',
				hostname: '192.168.0.106',
				port: '1515',
				pathname: '/**'
			},
		]
	},
	experimental: {
		// Используется для оптимизации пакетов
		optimizePackageImports: [
			'@dnd-kit/core',
			'@dnd-kit/modifiers',
			'@dnd-kit/sortable',
			'@dnd-kit/utilities',
			'@fancyapps/ui',
			'@hookform/resolvers',
			'@mantine/core',
			'@mantine/hooks',
			'@mantine/tiptap',
			'@radix-ui/react-label',
			'@radix-ui/react-slot',
			'@radix-ui/react-tabs',
			'@radix-ui/react-toggle',
			'@reduxjs/toolkit',
			'@tiptap/extension-highlight',
			'@tiptap/extension-link',
			'@tiptap/extension-subscript',
			'@tiptap/extension-superscript',
			'@tiptap/extension-text-align',
			'@tiptap/extension-underline',
			'@tiptap/pm',
			'@tiptap/react',
			'@tiptap/starter-kit',
			'accept-language',
			'axios',
			'class-variance-authority',
			'classnames',
			'clsx',
			'color',
			'framer-motion',
			'i18next',
			'i18next-browser-languagedetector',
			'i18next-resources-to-backend',
			'interweave',
			'lightgallery',
			'lucide-react',
			'moment',
			'next-i18n-router',
			'ol',
			'prettier',
			'proj4',
			'quill',
			'randomcolor',
			'react-content-loader',
			'react-cookie',
			'react-hook-form',
			'react-i18next',
			'react-icons',
			'react-katex',
			'react-loader-spinner',
			'react-paginate',
			'react-quill',
			'react-redux',
			'react-spinners',
			'react-stickynode',
			'react-tooltip',
			'react-uuid',
			'sharp',
			'slate',
			'slate-history',
			'slate-react',
			'sticky-js',
			'tailwind-merge',
			'tailwindcss-animate',
			'valtio',
			'zod'
		],
		// Добавляем поддержку WebAssembly
		webpackBuildWorker: true
	},

	// Решение для Critical dependency
	webpack: (config, { isServer }) => {
		// Игнорируем проблемные модули на сервере
		if (isServer) {
			config.externals.push({
				'web-worker': 'commonjs2 web-worker',
				'node:worker_threads': 'commonjs2 node:worker_threads'
			})
		}

		// Убираем проблемный полифилл для Buffer
		delete config.resolve.fallback?.buffer
		delete config.resolve.fallback?.bufferutil
		delete config.resolve.fallback?.['utf-8-validate']

		// Добавляем только необходимые настройки
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			layers: true
		}

		return config
	}
}

export default nextConfig
