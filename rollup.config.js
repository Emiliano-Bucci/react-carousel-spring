import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
import rollupTS from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'jsxRuntime',
  'react-spring': 'reactSpring',
  'react-use-gesture': 'reactUseGesture',
  rxjs: 'rxjs',
  screenfull: 'screenfull',
}

export default {
  input: 'src/index.tsx',
  output: [
    {
      format: 'umd',
      exports: 'named',
      dir: 'dist/',
      sourcemap: true,
      name: 'ReactSpringCarousel',
      globals,
    },
  ],
  plugins: [
    rollupTS({
      tsconfigOverride: {
        exclude: ['Examples', 'node_modules'],
      },
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
    }),
    external(),
    resolve(),
    commonjs(),
    terser(),
  ],
}
