import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'path';

const DIR = {
  DIST: 'dist',
  SRC_MAIN: 'src/main'
};
DIR.SRC_COMPONENT = `${DIR.SRC_MAIN}/script`;

function createConfig(entryFile, prefix, namespace, minify) {
  return {
    input: path.resolve(__dirname, `${DIR.SRC_COMPONENT}/${entryFile}`),
    output: {
      file: path.resolve(__dirname, `${DIR.DIST}/yapv${prefix.length > 0 ? '-' + prefix : ''}${minify ? '.min' : ''}.js`),
      format: 'umd',
      name: 'YAPV' + (namespace.length > 0 ? `.${namespace}`: ''),
      sourcemap: true,
    },
    watch: {
      exclude: 'node_modules/**',
      clearScreen: true,
    },
    plugins: [
      resolve(),
      typescript(),
    ],
  };
}

const configs = [
  createConfig('index.ts', '', ''),
  createConfig('component/index.ts', 'core', ''),
  createConfig('component/renderer/canvas/index.ts', 'canvas', 'canvas'),
  createConfig('component/renderer/svg/index.ts', 'svg', 'svg'),
];

export default configs;
