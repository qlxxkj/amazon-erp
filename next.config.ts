import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
    images: {

        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
                // 可选：可以限制允许的图片路径，'**' 表示该域名下所有路径的图片都允许
                // pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'telegra.ph',
            },
            {
                protocol: 'https',
                hostname: 'img.hmstu.eu.org',
            },
            {
                protocol: 'https',
                hostname: 'qxgkagprwozrbddhoosw.supabase.co',
                pathname: '/storage/v1/object/public/**', // 假设图片存放在 Supabase 的公共存储桶
            },
        ],
    },
};

export default nextConfig;
