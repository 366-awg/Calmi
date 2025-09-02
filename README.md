Calmi 🌊
Your AI-Powered Haven for Emotional Support and Crisis Prevention

Calmi is a web application designed to provide immediate, accessible, and stigma-free mental health support. It combines an empathetic AI chatbot, crisis resources, and emotional tracking to help users navigate difficult moments and understand their emotional patterns over time.

Inspiration
Mental health remains one of the most neglected areas in global healthcare, with rising rates of depression and anxiety worldwide. The situation is particularly alarming in regions like Central Kenya, where high suicide rates among men highlight a critical need for accessible, immediate, and private support. Calmi was built to be a digital lifeline—a first step towards healing that is available to anyone, anywhere, at any time.

Core Features
AI Emotional Support Chatbot: An empathetic, context-aware AI companion for stigma-free conversation

Voice Input Mode: Users can speak their feelings instead of typing during low moments

Crisis Help Button: Quick-access button connecting users to emergency hotlines and critical resources

Mood Tracker & Journal: Private tool for logging daily mood and journaling thoughts

Support Us (Donations): Secure donation portal to keep the platform free and accessible

Tech Stack
Frontend: Vite, React, TypeScript, Tailwind CSS

Backend: Node.js (Netlify Functions)

AI: Hugging Face API

Payments: Paystack API

Deployment: Netlify

Package Manager: pnpm

Project Structure
text
├── builder/rules/
├── client/
├── netlify/functions/
├── public/
├── server/
├── shared/
├── .env
├── index.html
├── netlify.toml
├── package.json
├── tsconfig.json
└── vite.config.ts
Setup Instructions
Install dependencies:

bash
pnpm install
Set up environment variables:

Create a .env file

Add your Hugging Face and Paystack keys:

text
HUGGINGFACE_API_KEY=your_api_key_here
PUBLIC_PAYSTACK_KEY=your_public_key_here
Run the development server:

bash
pnpm run dev
Building for Production
bash
pnpm run build
Development Process & Prompts
Here are the key prompts I used during development:

"Create a mental health chat app with React and TypeScript"

"Add a voice input button using the Web Speech API"

"Implement a crisis help modal with hotline numbers"

"Integrate Hugging Face AI API for chat responses"

"Add a donation button with Paystack payment integration"

"Set up Netlify functions for the backend API"

"Create a mood tracking component with emotion buttons"

"Make the UI responsive and mobile-friendly with Tailwind CSS"

"Add streaming responses for the AI chat"

"Implement a clean and calming color scheme for mental health app"

Important Disclaimer
Calmi is not a replacement for professional therapy, medical advice, or emergency services. It is a supportive tool for emotional relief. In case of a medical emergency or crisis, please use the provided hotlines or call your local emergency number immediately.