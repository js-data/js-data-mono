import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'

export default commandLineArgs => {
  const isUmd = commandLineArgs.format === 'umd'
  return {
    output: {
      amd: {
        id: 'js-data-adapter'
      },
      name: 'Adapter',
      globals: {
        'js-data': 'JSData'
      }
    },
    external: [
      '@js-data/js-data'
    ],
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: 'es2015',
            declaration: isUmd
          },
          include: ['src'],
          exclude: ['node_modules', 'test', 'scripts', './rollup.config.js', '@js-data/js-data']
        }
      }),
      isUmd && babel({ extensions: ['.ts'] })
    ]
  }
}
