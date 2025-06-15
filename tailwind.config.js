/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'background-light': '#ffffff',
        'background-dark': '#04040f',

        'surface-light': '#dddbff',
        'surface-dark': '#0b0b24',

        'txt-principal-light': '#2f4a60',
        'txt-principal-dark': '#f1f1f1',

        'txt-secondary-light': '#6b7d8f',
        'txt-secondary-dark': '#c9d1d9',

        'destructive-action-light': '#e63946',
        'destructive-action-dark': '#e63946',

        'constructive-action-light': '#ffc300',
        'constructive-action-dark': '#ffc300',

        'action-light': '#5e90b5',
        'action-dark': '#5e90b5',

        'soft-light': '#ededed',
        'soft-dark': '#324759',

        'links-light': '#457b9d',
        'links-dark': '#457b9d',

        'markdown-light': '#f5f9fb',
        'markdown-dark': '#273947',
      },
    },
  },
  plugins: [],
}
