import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}
