'use client'; // Required to use the usePathname hook

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import hook to track active page
import AdminRoute from '@/components/AdminRoute';

export default function AdminLayout({ children }) {
  const pathname = usePathname(); // Get the current URL path

  // --- Reusable Link Styles ---
  // Base style for all links
  const baseLinkStyle = "block py-2 px-3 rounded-md text-slate-300 hover:bg-slate-700 hover:text-cyan-100 transition-colors duration-150";
  // Style for the currently active link
  const activeLinkStyle = "bg-slate-700 text-cyan-100";

  // Helper function to check if a link is active
  const isActive = (path) => {
    // Exact match for dashboard
    if (path === '/admin') {
      return pathname === path;
    }
    // Broader match for sub-pages (e.g., /admin/users/123)
    return pathname.startsWith(path);
  };

  return (
    <AdminRoute>
      {/* This flex container is inside the RootLayout's <main> tag.
        It will automatically grow to fill the space between the
        Header and Footer, and the sidebar/main content will
        stretch to the height of the tallest of the two.
      */}
      <div className="flex flex-grow">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-800 text-slate-300 p-4 border-r border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-cyan-100">Admin Panel</h2>
          <nav>
            <ul>
              <li className="mb-2">
                <Link 
                  href="/admin" 
                  className={`${baseLinkStyle} ${isActive('/admin') ? activeLinkStyle : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  href="/admin/users" 
                  className={`${baseLinkStyle} ${isActive('/admin/users') ? activeLinkStyle : ''}`}
                >
                  Registered Users
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  href="/admin/campaigns" 
                  className={`${baseLinkStyle} ${isActive('/admin/campaigns') ? activeLinkStyle : ''}`}
                >
                  Campaigns
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  href="/admin/results" 
                  className={`${baseLinkStyle} ${isActive('/admin/results') ? activeLinkStyle : ''}`}
                >
                  Live Results
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        {/* Removed bg-gray-100. It now correctly inherits bg-slate-900 from RootLayout */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
