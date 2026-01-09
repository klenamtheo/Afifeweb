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
                    primary: '#2E7D32', // Forest Green - Agriculture/Nature
                    secondary: '#D4AF37', // Gold - Tradition/Culture
                    accent: '#1E293B', // Slate - Modern/Professional
                    bg: '#F8FAFC', // Light Blue Grey - Clean Background
                    text: '#0F172A', // Dark Slate - Readable Text
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
