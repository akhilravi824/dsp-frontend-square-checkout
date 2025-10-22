import { vite as vidstack } from 'vidstack/plugins';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverUrl = env.PUBLIC_API_URL || 'https://dsp-api-git-dev-hello-monday.vercel.app';

  return {
    plugins: [vidstack(), sveltekit(), svgr()],
    resolve: {
      alias: {
        '@types': path.resolve(__dirname, './src/types')
        // Add your aliases here
        // Example:
        // '@': path.resolve(__dirname, './src'),
        // '@lib': path.resolve(__dirname, './src/lib'),
        // '@components': path.resolve(__dirname, './src/lib/components'),
        // '@stores': path.resolve(__dirname, './src/lib/stores'),
        // '@utils': path.resolve(__dirname, './src/lib/utils'),
      }
    },
    optimizeDeps: {
      include: ['vidstack']
    },
    ssr: {
      noExternal: ['vidstack']
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: serverUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path
        }
      },
      fs: {
        allow: ['..']
      }
    },
    build: {
      rollupOptions: {}
    }
  };
});
