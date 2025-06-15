/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'background-light': '#eff1f5',
        'background-dark': '#24273a',

        'surface-light': '#e6e9ef',
        'surface-dark': '#1e2030',

        'txt-principal-light': '#4c4f69',
        'txt-principal-dark': '#cad3f5',

        'txt-secondary-light': '#9ca0b0',
        'txt-secondary-dark': '#6e738d',

        'destructive-action-light': '#d20f39',
        'destructive-action-dark': '#ed8796',

        'constructive-action-light': '#fe640b',
        'constructive-action-dark': '#f5a97f',

        'action-light': '#1e66f5',
        'action-dark': '#8aadf4',

        'soft-light': '#dce0e8',
        'soft-dark': '#313244',

        'links-light': '#209fb5',
        'links-dark': '#8bd5ca',

        'markdown-light': '#fafafa',
        'markdown-dark': '#1e2030',
      }

    },
  },
  plugins: [],
}
