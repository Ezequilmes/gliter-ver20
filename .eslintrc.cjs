module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended', // Agregado para TypeScript
  ],
  parser: '@typescript-eslint/parser', // Agregado para TypeScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Agregado para TypeScript
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', '@typescript-eslint'], // Agregado @typescript-eslint
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Reglas generales de JavaScript
    'no-console': 'off', // Temporalmente desactivado
    'no-unused-vars': 'off', // Temporalmente desactivado
    'no-undef': 'off', // Temporalmente desactivado
    'no-inner-declarations': 'off', // Temporalmente desactivado
    'prefer-const': 'warn',
    'no-var': 'error',
    
    // Reglas específicas de React
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off', // Desactivado para evitar conflictos con el nuevo JSX transform
    'react/jsx-uses-vars': 'off', // Desactivado para evitar conflictos con el nuevo JSX transform
    'react/react-in-jsx-scope': 'off', // No necesario en React 17+
    'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }], // Agregado .tsx
    'react/jsx-pascal-case': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-unused-state': 'warn',
    'react/self-closing-comp': 'warn',
    
    // Reglas de hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Reglas de accesibilidad
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    
    // Reglas de estilo JSX
    'react/jsx-closing-bracket-location': ['warn', 'line-aligned'],
    'react/jsx-closing-tag-location': 'warn',
    'react/jsx-curly-spacing': ['warn', { when: 'never', children: true }],
    'react/jsx-equals-spacing': ['warn', 'never'],
    'react/jsx-first-prop-new-line': ['warn', 'multiline'],
    'react/jsx-indent': ['warn', 2],
    'react/jsx-indent-props': ['warn', 2],
    'react/jsx-max-props-per-line': ['warn', { maximum: 1, when: 'multiline' }],
    'react/jsx-tag-spacing': ['warn', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never'
    }],
  },
  overrides: [
    {
      files: ['*.jsx'],
      rules: {
        // Reglas específicas para archivos JSX
        'react/jsx-filename-extension': 'off', // Ya tienen la extensión correcta
      },
    },
  ],
};