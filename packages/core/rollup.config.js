import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				name: 'YAPV.core',
				file: pkg.browser,
				format: 'umd',
				extend: true,
				sourcemap: true
			},
			{
				file: pkg.main,
				format: 'cjs'
			},
			{
				file: pkg.module,
				format: 'es',
			}
    ],
    watch: {
      exclude: 'node_modules/**',
      clearScreen: true,
    },
		plugins: [
			resolve(), // so Rollup can find node modules
			commonjs(), // so Rollup can convert commonjs to an ES module
			typescript(),
		]
	}
];
