import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import globals from 'globals'
import * as tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist/', 'out/', 'references/', '.vite/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.electron,
  importX.flatConfigs.typescript,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true, project: './tsconfig.json' })],
    },
    rules: {
      // Kept as warnings, as they were under typescript-eslint v5. A leading
      // underscore marks a parameter that is unused on purpose.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
])
