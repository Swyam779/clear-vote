'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

// --- Loading Skeleton ---
const UserTableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-9 w-1/3 bg-slate-700 rounded-md mb-6"></div>
    <div className="bg-slate-800 shadow-md rounded-lg overflow-hidden">
      <div className="min-w-full">
        {/* Skeleton Header */}
        <div className="bg-slate-700/50 flex">
          <div className="px-6 py-3 h-12 w-1/4"></div>
          <div className="px-6 py-3 h-12 w-1/4"></div>
          <div className="px-6 py-3 h-12 w-1/4"></div>
          <div className="px-6 py-3 h-12 w-1/4"></div>
        </div>
        {/* Skeleton Body */}
        <div className="divide-y divide-slate-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="px-6 py-4 w-1/4">
                <div className="w-10 h-10 rounded-full bg-slate-700"></div>
              </div>
              <div className="px-6 py-4 w-1/4">
                <div className="h-5 w-3/4 bg-slate-700 rounded"></div>
              </div>
              <div className="px-6 py-4 w-1/4">
                <div className="h-5 w-5/6 bg-slate-700 rounded"></div>
              </div>
              <div className="px-6 py-4 w-1/4">
                <div className="h-5 w-1/2 bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Fallback Avatar ---
const DefaultAvatar = ({ name }) => (
  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shadow-inner">
    <span className="text-sm font-medium text-cyan-200">
      {name ? name.charAt(0).toUpperCase() : '?'}
    </span>
  </div>
);

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection);
        const querySnapshot = await getDocs(q);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
        // Note: You will need to update your Firestore rules
        // to allow admins to read the 'users' collection.
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <UserTableSkeleton />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-cyan-100 mb-6">Registered Users</h1>
      <div className="bg-slate-800 shadow-md rounded-lg overflow-x-auto border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Profile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Voter ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => e.target.style.display = 'none'} // Hide on error
                      />
                    ) : (
                      <DefaultAvatar name={user.name} />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cyan-100">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-300 font-mono">{user.voterId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
