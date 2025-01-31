/**
 * Vite 项目配置文件
 * 用于配置项目的构建、开发服务器、插件等相关设置
 */
import { defineConfig, loadEnv } from 'vite'; // Vite 核心配置函数和环境变量加载器
import vue from '@vitejs/plugin-vue'; // Vue 3 插件支持
import { resolve } from 'path'; // 路径解析工具
import pkg from './package.json'; // 项目包信息
import dayjs from 'dayjs'; // 日期处理工具
import Components from 'unplugin-vue-components/vite'; // 组件自动导入插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'; // SVG 图标插件

// 路径解析函数，用于简化路径配置
const pathResolve = (dir) => {
  return resolve(__dirname, '.', dir);
};

// 路径别名配置，方便模块导入
const alias = {
  '@': pathResolve('./src'), // @ 指向 src 目录
};

export default defineConfig((mode) => {
  // 加载环境变量
  const env = loadEnv(mode.mode, process.cwd());

  // 从环境变量中解构需要的配置项
  const { VITE_PUBLIC_PATH, VITE_PORT, VITE_OPEN, VITE_PROXY_URL, VITE_DROP_CONSOLE, VITE_BASE_URL } = env;

  // 收集应用信息，用于运行时访问
  const { dependencies, devDependencies, name, version } = pkg;
  const __APP_INFO__ = {
    pkg: { dependencies, devDependencies, name, version },
    lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 记录构建时间
  };

  return {
    // 插件配置
    plugins: [
      vue(), // Vue 3 支持
      // 自动按需引入全局组件
      Components({
        dirs: [pathResolve('./src/components/global')], // 指定组件目录
      }),
      // SVG 图标插件配置
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/svg')], // SVG 图标目录
        symbolId: 'svg-[name]', // 生成的 symbol ID 格式
      }),
    ],
    root: process.cwd(), // 项目根目录
    base: VITE_PUBLIC_PATH, // 公共基础路径
    resolve: {
      alias, // 路径别名配置
    },
    // 开发服务器配置
    server: {
      host: true, // 监听所有地址
      port: VITE_PORT, // 服务端口
      open: JSON.parse(VITE_OPEN), // 是否自动打开浏览器
      // 代理配置
      proxy: {
        [VITE_BASE_URL]: {
          target: VITE_PROXY_URL, // 代理目标地址
          changeOrigin: true, // 修改请求头中的 Origin
          rewrite: (path) => path.replace(new RegExp(`^${VITE_BASE_URL}`), ''), // 路径重写
        },
      },
    },
    // ESBuild 配置
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [], // 生产环境下移除 console.log 和 debugger
    },
    // 全局常量定义
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__), // 注入应用信息到全局常量
    },
	};
});
