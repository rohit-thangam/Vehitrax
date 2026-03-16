/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#7c3aed", // Violet-600 (Neon Violet)
                    dark: "#8b5cf6",    // Violet-500 for Dark Mode
                    light: "#a78bfa",   // Violet-400 for soft backgrounds
                },
                accent: {
                    DEFAULT: "#6366f1", // Indigo-500
                    dark: "#818cf8",    // Indigo-400
                },
                slate: {
                    950: '#0f0c29',     // Custom dark theme background (Deep Indigo gradient base)
                }
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'blob': 'blob 15s infinite alternate',
                'pan-grid': 'pan-grid 20s linear infinite',
            },
            keyframes: {
                shimmer: {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(100%)' }
                },
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(150px, -150px) scale(1.2)",
                    },
                    "66%": {
                        transform: "translate(-100px, 150px) scale(0.8)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                'pan-grid': {
                    "0%": { backgroundPosition: "0% 0%" },
                    "100%": { backgroundPosition: "100% 100%" }
                }
            }
        },
    },
    plugins: [
        require('tailwindcss-animation-delay'),
    ],
}
