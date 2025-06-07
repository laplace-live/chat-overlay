/**
 * @type {import('prettier').Options}
 */
export default {
  printWidth: 120,
  trailingComma: "es5",
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  quoteProps: 'consistent',
  jsxSingleQuote: true,
  arrowParens: "avoid",
  endOfLine: "lf",
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],

  // @ianvs/prettier-plugin-sort-imports
  // https://github.com/IanVS/prettier-plugin-sort-imports
  importOrder: [
    '<BUILTIN_MODULES>',
    '^react$',
    '^next(\/.*)?',
    '<THIRD_PARTY_MODULES>',
    '@(?=[^\/]).*',
    '',
    '^@/types(.*)$',
    '',
    '^@/const(.*)$',
    '',
    '^@/lib(.*)$',
    '',
    '^@/utils(.*)$',
    '',
    '^@/hooks(.*)$',
    '',
    '^@/handlers(.*)$',
    '',
    '^@/components(.*)$',
    '',
    '^@/app(.*)$',
    '',
    '^@/pages(.*)$',
    '',
    '^[.]',
  ]
}
