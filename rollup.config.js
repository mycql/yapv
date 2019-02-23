import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import path from 'path';

const environment = process.env.BUILD || 'development';

const DIR = {
  DIST: 'dist',
  SRC_MAIN: 'src/main'
};
DIR.SRC_RENDERER = `${DIR.SRC_MAIN}/script/component/renderer`;

function createConfig(entryFile, prefix, minify) {
  return {
    input: path.resolve(__dirname, `${DIR.SRC_RENDERER}/${entryFile}`),
    output: {
      file: path.resolve(__dirname, `${DIR.DIST}/yapv-${prefix}${minify ? '.min' : ''}.js`),
      format: 'umd',
      name: `YAPV.${prefix}`,
      sourcemap: true,
    },
    watch: {
      exclude: 'node_modules/**',
      clearScreen: true,
    },
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      typescript({
        typescript: require('typescript'),
      }),
      (minify && uglify()),
    ]
  };
}

const configs = [
  createConfig('canvas/index.ts', 'canvas'),
  createConfig('svg/index.ts', 'svg'),
];
if(environment === 'production') {
  configs.push(createConfig('canvas/index.ts', 'canvas', true));
  configs.push(createConfig('svg/index.ts', 'svg', true));
}

export default configs;
