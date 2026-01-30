# Authentication Frontend React

A modern React + TypeScript authentication system with comprehensive security features and property-based testing.

## Features

- 🔐 Multiple authentication methods (OTP, Google OAuth, Email/Password)
- 🛡️ Security-first approach with input validation and XSS protection
- 📱 Responsive design for mobile, tablet, and desktop
- ♿ Accessibility compliance with ARIA labels and keyboard navigation
- 🧪 Comprehensive testing with property-based tests
- 🎯 TypeScript strict mode for type safety
- ⚡ Vite for fast development and optimized builds

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── forms/          # Form-specific components
│   └── auth/           # Authentication-specific components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── contexts/           # React Context providers
├── constants/          # Application constants
├── assets/             # Static assets
└── __tests__/          # Test files
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables in `.env` file

4. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Environment Variables

See `.env.example` for all available environment variables.

Required variables:
- `VITE_APP_NAME` - Application name
- `VITE_ENVIRONMENT` - Environment (development, staging, production, local)
- `VITE_API_BASE_URL` - API base URL
- `VITE_API_KEY` - API key

## Testing

The project uses a dual testing approach:
- **Unit tests** for specific examples and edge cases
- **Property-based tests** for universal properties across all inputs

Run tests with:
```bash
npm test
```

## Security Features

- Input validation and sanitization
- XSS and injection attack prevention
- CSRF protection
- Secure token storage and management
- Rate limiting for authentication attempts

## Architecture

The application follows a modular, layered architecture with clear separation of concerns:
- UI Components Layer
- State Management Layer (React Context)
- Services Layer (Business Logic)
- API Client Layer
- Security Layer (Cross-cutting)

## Contributing

1. Follow TypeScript strict mode guidelines
2. Write both unit tests and property-based tests for new features
3. Ensure ESLint passes with security-focused rules
4. Maintain accessibility compliance
5. Update documentation as needed