/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                afife: {
                    primary: '#2E7D32', // Forest Green
                    'primary-dark': '#1B5E20', // Darker Green for gradients
                    secondary: '#D4AF37', // Gold
                    'secondary-dark': '#B8860B', // Darker Gold
                    accent: '#1E293B', // Slate
                    bg: '#F8FAFC', // Light Background
                    text: '#0F172A', // Dark Text
                }
            },
            fontFamily: {
                heading: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
