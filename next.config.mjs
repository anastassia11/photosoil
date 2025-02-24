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
				protocol: 'https',
				hostname: '80.78.243.185',
				port: '1515',
				pathname: '/**'
			}
		]
	}
}

export default nextConfig
