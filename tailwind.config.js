/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    colors: {
      // 'card-blue': 'rgba(244, 247, 252, 0.75)',
      'head-blue': 'rgb(215 220 229 / 75%)',
      'card-blue': 'rgba(244, 247, 252, 0.75)',
      'blue': '#2264E5',
      'modal-heading': '#3C4563',
      'white': 'rgb(255 255 255)',
      'light-blue': 'rgba(200, 217, 251, 0.75)',
      'dialog': 'rgba(244, 247, 252)',
      'head': '#464F60',
      'lightGrey': 'rgba(22, 63, 146, 0.08)',
      'pending': '#F29339',
      'warning': 'rgb(197 96 0)',
      'green': '#0F8931',
      'grey': {
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
      },
      'zinc': {
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8'
      },
      'grey-300': 'rgb(209 213 219)',
      'red': {
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626'
      },
      'table-cell': '#687182',
      'active-status-bg': 'rgba(225, 252, 239, 1)',
      'active-status-text': 'rgba(20, 128, 74, 1)',
      'inactive-status-bg': 'rgba(233, 237, 245, 1)',
      'inactive-status-text': 'rgba(90, 99, 118, 1)',
      'black': '#000',
      'border-color': 'rgba(0, 0, 0, 0.17)',
      'card-back': 'rgba(0, 0, 0, 0.04)',
      'add-blue': '#2370E4',
      'sidebar-background': '#f6f8fc'
    }
  },
  plugins: [],
}

