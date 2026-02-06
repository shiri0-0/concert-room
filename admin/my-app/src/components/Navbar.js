"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              🎵 Concert Hub
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/concerts"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Concerts
            </Link>

            {user ? (
              <>
                <span className="text-gray-600 text-sm">
                  {user.name} ({user.role})
                </span>
                {user.role === "admin" && (
                  <Link
                    href="/add-concert"
                    className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Add Concert
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}