"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SeatLayoutSelector from "@/components/SeatLayoutSelector";

export default function AddConcert() {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    date: "",
    venue: "",
    city: "",
    description: "",
    totalSeats: "",
    seatLayout: "",
  });
  const [error, setError] = useState("");
  const { API_URL, token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/concerts");
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLayoutChange = ({ seatLayout, totalSeats }) => {
    setFormData({
      ...formData,
      seatLayout,
      totalSeats: totalSeats.toString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/concerts/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/concerts");
      } else {
        setError(data.message || "Failed to add concert");
      }
    } catch (error) {
      setError("Failed to add concert");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-100">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Add New Concert
            </h2>
            <p className="text-gray-600">Create an amazing concert experience</p>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎵</span> Concert Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Concert Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border-2 border-purple-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  name="artist"
                  placeholder="Artist Name"
                  value={formData.artist}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border-2 border-purple-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border-2 border-purple-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  name="venue"
                  placeholder="Venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border-2 border-purple-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-4 py-3 border-2 border-purple-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
              </div>

              <textarea
                name="description"
                placeholder="Concert Description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full mt-4 px-4 py-3 border-2 border-purple-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Seat Layout Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎫</span> Seat Configuration
              </h3>
              <SeatLayoutSelector onLayoutChange={handleLayoutChange} />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              🎉 Create Concert
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}