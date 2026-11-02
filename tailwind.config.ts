import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#1F5B34',
        'leaf-green': '#3F7D4E',
        'banana-gold': '#E8B923',
        maroon: '#7A2131',
        'cream-bg': '#FAF7F0',
        'charcoal-text': '#1C2A1E',
        'muted-text': '#6B7280',
      },
      boxShadow: {
        card: '0 2px 8px rgba(31,91,52,0.08)',
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
}

export default config
