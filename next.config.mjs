/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
        },
        {
          protocol: 'https',
          hostname: 'storage.googleapis.com',
        },
        {
          protocol: 'https',
          hostname: '4bvph4ykqt2jvybf.public.blob.vercel-storage.com',
        }
      ],
    },
    webpack: (config, { isServer }) => {
      // Agregar reglas para manejar módulos nativos
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      return config;
    },
    experimental: {
      serverComponentsExternalPackages: ['firebase-admin'],
    },
  };
  
  export default nextConfig;
  