import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				name: 'YAPV.svg',
				file: pkg.browser,
				format: 'umd',
				extend: true,
        sourcemap: true,
        plugins: [
          (process.env.BUILD === 'production' && terser()),
        ]
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
