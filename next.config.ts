import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        domains: [
            'm.media-amazon.com',
            'https://qxgkagprwozrbddhoosw.supabase.co',
            'img.hmstu.eu.org'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
                // 可选：可以限制允许的图片路径，'**' 表示该域名下所有路径的图片都允许
                // pathname: '/images/**',
            },
        ],
    },
};

export default nextConfig;
