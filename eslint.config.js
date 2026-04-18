import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
rules: {
  // Variables sin usar: warn en vez de error, e ignora las que empiezan por _ o mayúscula
  'no-unused-vars': ['off', { 
    varsIgnorePattern: '^[A-Z_]', 
    argsIgnorePattern: '^_'
  }],

  // React no necesita importarse en proyectos modernos (React 17+)
  'react/react-in-jsx-scope': 'off',

  // Permite usar funciones antes de declararlas (útil con componentes)
  'no-use-before-define': 'off',

  // No obliga a poner displayName en componentes
  'react/display-name': 'off',

  // No fuerza propTypes (si usas TypeScript o no las usas)
  'react/prop-types': 'off',

  // Desactiva el aviso de fast refresh para componentes no exportados
  'react-refresh/only-export-components': 'off',

  // Permite console.log durante desarrollo (cámbialo a 'warn' en producción)
  'no-console': 'off',

  // No obliga a usar === en comparaciones simples con null
  'eqeqeq': ['warn', 'smart'],

  // Avisa de variables declaradas con var (usa let/const mejor)
  'no-var': 'warn',

  // Prefiere const cuando la variable no se reasigna
  'prefer-const': 'warn',
  },
  },
])
