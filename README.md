# iLy.quest

<p align="center">
  <img src="public/iLy.svg" alt="iLy.quest Logo" width="90" />
</p>

<p align="center">
  <strong>Build websites with AI, no code required.</strong>
</p>

<p align="center">
  <a href="https://ily.quest">Website</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#development">Development</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/c017700d-ffc9-49b5-9304-eb02d7a37a58" alt="iLy.quest Screenshot" width="50%" />
</p>

---

## Overview

iLy.quest is an AI-powered web development platform that enables users to create sophisticated websites using natural language instructions. It combines a code editor, real-time preview, and advanced AI assistance powered by DeepSeek to streamline the web development process.

## Features

### 🤖 AI-Powered Development
- Generate complete HTML, CSS, and JavaScript from natural language descriptions.
- Get intelligent suggestions and improvements for your code.
- Ask questions about web development and receive expert guidance.

### 📝 Professional Code Editor
- Syntax highlighting and autocompletion.
- Error detection and code suggestions.
- Full access to edit and customize generated code.

### 👁️ Real-Time Preview
- See your changes instantly.
- Test responsiveness and interactions.
- Debug visual elements in real-time.

### 🚀 One-Click Deployment
- Deploy to Hugging Face Spaces with a single click.
- Share your creation with a public URL.
- Allow others to remix and build upon your work.

### 🔄 Remix and Collaborate
- Start from existing templates.
- Remix other users' projects.
- Share and collaborate on web development.

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge).
- A [Hugging Face](https://huggingface.co) account for authentication and deployment.

### Quick Start
1. Visit [iLy.quest](https://ily.quest).
2. Sign in with your Hugging Face account.
3. Start a new project or remix an existing one.
4. Use AI to generate code or start coding manually.
5. Deploy your site when ready.

### Example Prompts
Try these prompts to see what iLy.quest can do:
- "Create a responsive landing page for a fitness app with a hero section, features, and pricing."
- "Build a portfolio website with a gallery, about section, and contact form."
- "Make an e-commerce product page with an image carousel, description, and add-to-cart button."
- "Design a dashboard layout with sidebar navigation, stats cards, and a data table."

---

## Development

iLy.quest is built with modern web technologies:

- **Frontend:** Next.js, React, TailwindCSS
- **AI:** DeepSeek integration via AI SDK
- **Authentication:** Hugging Face OAuth
- **Database:** Supabase
- **Deployment:** Vercel, Hugging Face Spaces

### Local Development Setup

```sh
# Clone the repository
git clone https://github.com/yllvar/ily.quest.git
cd ily.quest

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys and configuration

# Start the development server
npm run dev
```

### Environment Variables

The following environment variables are required:

```plaintext
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
OAUTH_CLIENT_ID=your_huggingface_oauth_client_id
OAUTH_CLIENT_SECRET=your_huggingface_oauth_client_secret
REDIRECT_URI=http://localhost:3000/api/auth/callback

# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key
DEFAULT_HF_TOKEN=your_huggingface_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## Deployment

### Deploying to Vercel
The easiest way to deploy iLy.quest is using Vercel:

1. Fork this repository.
2. Create a new project on [Vercel](https://vercel.com).
3. Connect your forked repository.
4. Configure environment variables.
5. Deploy.

### Manual Deployment
For other hosting providers:

```sh
# Build the application
npm run build

# Start the production server
npm start
```

---

## Project Structure

```plaintext
ily.quest/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utility functions and configuration
├── public/               # Static assets
└── ...                   # Configuration files
```

---

## Security Considerations
- API keys are securely stored as environment variables.
- Authentication is handled via OAuth with secure token storage.
- CORS headers are properly configured for API security.
- Rate limiting is implemented to prevent abuse.
- User content is sanitized to prevent XSS attacks.

---

## Performance Optimizations
- Code splitting and lazy loading for faster initial load.
- Static generation for non-dynamic pages.
- Optimized image loading and processing.
- Efficient state management to minimize re-renders.
- Edge caching for API responses where appropriate.

---

## Contributing
We welcome contributions to iLy.quest! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

### Development Guidelines
- Follow the existing code style and conventions.
- Write tests for new features.
- Update documentation as needed.
- Ensure all tests pass before submitting a PR.

---

## Roadmap
- Enhanced component library.
- Collaborative editing features.
- Additional deployment options.
- Advanced AI customization.
- Mobile app development support.
- Integration with design tools.

---

## License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgements
- [DeepSeek](https://deepseek.ai) for AI-powered assistance.
- [Hugging Face](https://huggingface.co) for authentication and hosting.
- [Supabase](https://supabase.io) for database services.
- [Next.js](https://nextjs.org) for the application framework.
- [Vercel](https://vercel.com) for hosting and infrastructure.

