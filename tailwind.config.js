/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFE8DC',
          200: '#FFD0B9',
          300: '#FFB18F',
          400: '#FF8A65',
          500: '#FF6B3D',
          600: '#F04E1B',
          700: '#C73B10',
          800: '#9C3012',
          900: '#7E2B14',
        },
        cream: {
          50: '#FFFBF5',
          100: '#FFF8F0',
          200: '#FFEFDD',
        },
        mint: {
          400: '#81C784',
          500: '#66BB6A',
        },
        sky: {
          400: '#64B5F6',
          500: '#42A5F5',
        },
        warm: {
          gray: {
            50: '#FAF7F4',
            100: '#F3EDE6',
            200: '#E4D9CD',
          }
        }
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(255, 138, 101, 0.12)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
