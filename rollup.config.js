import resolve from 'rollup-plugin-node-resolve';
import common from 'rollup-plugin-commonjs';
import multientry from 'rollup-plugin-multi-entry';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
import { terser } from "rollup-plugin-terser";

export default [
  // {
  //   input: 'src/js/jquery/plugins/*.js',
  //   output: {
  //     file: 'build/lib/jquery-plugins-bundle.js',
  //     format: 'iife',
  //     name: 'jqueryPlugins'
  //   },
  //   plugins: [
  //     common(),
  //     multientry(),
  //     resolve()
  //   ]
  // },
  {
    input: 'src/js/lib/**/*.js',
    output: {
      file: 'build/lib/lib-bundle.js',
      format: 'esm'
    },
    plugins: [
      postcss({
        extensions: [ '.css' ],
      }),
      common(),
      multientry(),
      resolve()
    ]
  },
  {
    input: 'src/js/lit/**/src/*.js',
    output: {
      file: 'build/lib/lit-bundle.js',
      format: 'esm'
    },
    plugins: [
      common(),
      multientry(),
      svg(),
      resolve()
    ]
  },
  {
    input: 'build/**/*.js',
    output: {
      file: 'public/lib/bundle.min.js',
      format: 'esm'
    },
    plugins: [
      common(),
      multientry(),
      resolve(),
      // terser()
    ]
  }
];