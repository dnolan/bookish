# Bookish - Personal Book Library

A modern book management application built with Next.js, React, TypeScript, and Firebase.

## 🏗️ Project Structure

```
bookish/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (entry point)
├── components/            # Reusable React components
│   ├── BookDialog.tsx     # Add/Edit book modal
│   ├── BookManager.tsx    # Main book management component
│   ├── BookTable.tsx      # Books list table
│   └── index.ts           # Component exports
├── hooks/                 # Custom React hooks
│   ├── useAuthors.ts      # Authors data management
│   ├── useBooks.ts        # Books data management
│   └── index.ts           # Hook exports
├── lib/                   # Core business logic
│   ├── db.ts             # Firebase database operations
│   ├── firebase.ts       # Firebase configuration
│   ├── types.ts          # TypeScript type definitions
│   └── index.ts          # Library exports
├── utils/                 # Utility functions
│   ├── bookUtils.ts      # Book data transformation utilities
│   └── index.ts          # Utility exports
└── public/               # Static assets
```

## 🚀 Features

- **Add Books**: Create new book entries with title, publication date, and authors
- **Edit Books**: Update existing book information
- **Delete Books**: Remove books with confirmation prompt
- **Author Management**: Autocomplete authors list with ability to add new authors
- **Data Persistence**: All data stored in Firebase Firestore
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Database**: Firebase Firestore
- **State Management**: React hooks (useState, useEffect)
- **Build Tool**: Next.js built-in bundler

## 📦 Architecture Principles

### Component Structure
- **BookManager**: Main container component that orchestrates all book operations
- **BookTable**: Displays books in a table format with actions
- **BookDialog**: Modal form for adding and editing books

### Custom Hooks
- **useBooks**: Manages book state and operations (CRUD)
- **useAuthors**: Manages author data and operations

### Data Layer
- **lib/db.ts**: Centralized database operations with Firebase
- **lib/types.ts**: TypeScript interfaces for type safety
- **utils/bookUtils.ts**: Data transformation and validation utilities

### Key Design Patterns
- **Separation of Concerns**: UI, business logic, and data access are separated
- **Custom Hooks**: Encapsulate state logic for reusability
- **Component Composition**: Small, focused components that compose together
- **Props Interface**: TypeScript interfaces for component props
- **Error Boundaries**: Proper error handling throughout the application

## 🔧 Setup & Development

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Update `lib/firebase.ts` with your Firebase configuration

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Code Standards

- **TypeScript**: Strict typing throughout the application
- **React Best Practices**: Functional components with hooks
- **Clean Code**: Meaningful names, single responsibility principle
- **Error Handling**: Proper try-catch blocks and user feedback
- **Performance**: Efficient re-renders and data fetching

## 🔮 Future Enhancements

- Book cover image uploads
- Advanced search and filtering
- Reading progress tracking
- Book recommendations
- Export/import functionality
- Social features (reviews, sharing)

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add TypeScript types for new features
3. Include error handling for new operations
4. Update documentation for significant changes
