import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Concert Hub",
  description: "Book your favorite concerts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}