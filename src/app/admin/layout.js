// src/app/admin/layout.js
import Link from 'next/link';
import AdminRoute from '@/components/AdminRoute';

export const metadata = {
  title: 'ClearVote - Admin Panel',
};

export default function AdminLayout({ children }) {
  return (
    <AdminRoute>
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
          <nav>
            <ul>
              <li className="mb-2">
                <Link href="/admin" className="block py-2 px-3 rounded hover:bg-gray-700">
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/users" className="block py-2 px-3 rounded hover:bg-gray-700">
                  Registered Users
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/campaigns" className="block py-2 px-3 rounded hover:bg-gray-700">
                  Campaigns
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/results" className="block py-2 px-3 rounded hover:bg-gray-700">
                  Live Results
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-100">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}