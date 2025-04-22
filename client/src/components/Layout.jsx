import React from 'react';
import NavBar from './NavBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t text-center py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Marco Polo Clone. All rights reserved.
      </footer>
    </div>
  );
}
