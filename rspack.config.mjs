const common = {
  mode: 'production',
  entry: {
    index: './src/index.ts',
    cli: './src/cli.ts',
    providers: './src/providers.ts',
    bin: './src/bin.ts',
  },
  externals: { react: 'commonjs react', 'react/jsx-runtime': 'commonjs react/jsx-runtime' },
  optimization: { minimize: false, splitChunks: false, runtimeChunk: false },
  experiments: { outputModule: true },
  stats: 'errors-warnings',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
      },
    ],
  },
};

export default [
  {
    ...common,
    name: 'esm',
    output: {
      path: new URL('./dist', import.meta.url).pathname,
      filename: '[name].js',
      library: { type: 'modern-module' },
      clean: false,
    },
    target: 'node24',
    externalsType: 'module',
    resolve: { extensionAlias: { '.js': ['.ts', '.tsx', '.js'] } },
    externals: {
      react: 'react',
      'react/jsx-runtime': 'react/jsx-runtime',
      'intl-messageformat': 'intl-messageformat',
      chokidar: 'chokidar',
      'fast-glob': 'fast-glob',
      '@babel/parser': '@babel/parser',
    },
  },
  {
    ...common,
    name: 'cjs',
    output: {
      path: new URL('./dist', import.meta.url).pathname,
      filename: '[name].cjs',
      library: { type: 'commonjs-static' },
      clean: false,
    },
    target: 'node24',
    externalsType: 'commonjs',
    resolve: { extensionAlias: { '.js': ['.ts', '.tsx', '.js'] } },
    externals: {
      react: 'commonjs react',
      'react/jsx-runtime': 'commonjs react/jsx-runtime',
      'intl-messageformat': 'commonjs intl-messageformat',
      chokidar: 'commonjs chokidar',
      'fast-glob': 'commonjs fast-glob',
      '@babel/parser': 'commonjs @babel/parser',
    },
  },
];
