"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ConcertList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_URL, token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      const res = await fetch(`${API_URL}/concerts`);
      const data = await res.json();
      setConcerts(data.concerts || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch concerts", error);
      setLoading(false);
    }
  };

  const deleteConcert = async (id) => {
    if (!confirm("Are you sure you want to delete this concert?")) return;

    try {
      const res = await fetch(`${API_URL}/concerts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchConcerts();
      } else {
        alert("Failed to delete concert");
      }
    } catch (error) {
      alert("Failed to delete concert");
    }
  };

  const handleBookNow = (concertId) => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/concerts/${concertId}/book`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-2xl text-purple-600 font-bold">Loading concerts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎵 Upcoming Concerts
          </h1>
          <p className="text-gray-600 text-lg">Book your favorite artist's live performance</p>
        </div>

        {/* User Actions Bar */}
        {user && (
          <div className="flex justify-center gap-4 mb-8">
            {user.role === "admin" && (
              <button
                onClick={() => router.push("/add-concert")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                ➕ Add Concert
              </button>
            )}
            <button
              onClick={() => router.push("/my-bookings")}
              className="bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
            >
              🎫 My Bookings
            </button>
          </div>
        )}

        {concerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-gray-600 text-xl">No concerts available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <div
                key={concert._id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Concert Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center">
                  <span className="text-6xl">🎤</span>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {concert.title}
                  </h3>
                  
                  <div className="space-y-2 text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">🎤</span>
                      {concert.artist}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">📍</span>
                      {concert.venue}, {concert.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">📅</span>
                      {new Date(concert.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">🎫</span>
                      {concert.totalSeats} seats
                    </p>
                  </div>

                  {concert.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {concert.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {user?.role === "user" && (
                      <button
                        onClick={() => handleBookNow(concert._id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        🎫 Book Now
                      </button>
                    )}
                    
                    {user?.role === "admin" && (
                      <>
                        <button
                          onClick={() => router.push(`/concerts/${concert._id}/book`)}
                          className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
                        >
                          View Seats
                        </button>
                        <button
                          onClick={() => deleteConcert(concert._id)}
                          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
                        >
                          🗑️
                        </button>
                      </>
                    )}

                    {!user && (
                      <button
                        onClick={() => router.push("/login")}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                      >
                        Login to Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}