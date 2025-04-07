import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from './ui/sonner';

const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1c2a]">
      <Navbar />
      <main className="container mx-auto py-6 px-4 sm:px-6">
        <Outlet />
      </main>
      <Toaster position="top-right" closeButton richColors duration={3000} />
    </div>
  );
};

export default Layout; 