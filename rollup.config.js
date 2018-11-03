import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import path from 'path';

const environment = process.env.BUILD || 'development';

const DIR = {
  DIST: 'dist',
  SRC_MAIN: 'src/main'
};
DIR.SRC_RENDERER = {
  CIRCULAR: `${DIR.SRC_MAIN}/script/component/circular/renderer`
};

function createConfig(entryFile, prefix, minify) {
  return {
    input: path.resolve(__dirname, `${DIR.SRC_RENDERER.CIRCULAR}/${entryFile}`),
    output: {
      file: path.resolve(__dirname, `${DIR.DIST}/${prefix}-yapv${minify ? '.min' : ''}.js`),
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
  createConfig('canvas/index.ts', 'ccanvas'),
  createConfig('svg/index.tsx', 'csvg'),
];
if(environment === 'production') {
  configs.push(createConfig('canvas/index.ts', 'ccanvas', true));
  configs.push(createConfig('svg/index.tsx', 'csvg', true));
}

export default configs;
