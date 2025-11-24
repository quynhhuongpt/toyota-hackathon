/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Rajdhani', 'sans-serif'],
                mono: ['monospace'],
            },
            colors: {
                space: {
                    900: '#0b0d17', // Deep space black
                    800: '#15192b', // Panel background
                    700: '#232942', // Border/Separator
                    400: '#5c677d', // Muted text
                    100: '#d0d6e0', // Primary text
                },
                accent: {
                    cyan: '#00f0ff', // Glowing cyan
                    red: '#ff2a2a',   // Alert red
                }
            }
        },
    },
    plugins: [],
}
