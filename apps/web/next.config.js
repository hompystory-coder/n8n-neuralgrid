/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@neuralgrid/database'],
  
  // n8n 프록시 설정
  async rewrites() {
    return [
      {
        source: '/n8n/:path*',
        destination: 'http://115.91.5.140:5678/:path*',
      },
    ]
  },

  // CORS 및 보안 헤더
  async headers() {
    return [
      {
        source: '/n8n/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
        ],
      },
    ]
  },

  webpack: (config) => {
    // n8n 관련 네이티브 모듈 외부화
    config.externals = [...(config.externals || []), 'canvas', 'jsdom']
    return config
  },
}

module.exports = nextConfig
