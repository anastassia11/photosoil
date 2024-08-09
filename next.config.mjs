/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cloudcfd.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'cloudcfd.ru',
                port: '1515',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;