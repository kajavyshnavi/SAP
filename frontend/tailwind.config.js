module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        accent: '#06b6d4',
      },
      backgroundImage: {
        'gradient-blue-cyan': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e3a8a 0%, #0c4a6e 100%)',
      },
    },
  },
  plugins: [],
}
