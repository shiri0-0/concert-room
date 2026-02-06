"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_URL, token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setBookings(data.bookings || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      setLoading(false);
    }
  };

  const handleViewReceipt = (bookingId) => {
    router.push(`/bookings/${bookingId}/receipt`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("Booking cancelled successfully");
        fetchBookings();
      } else {
        alert("Failed to cancel booking");
      }
    } catch (error) {
      alert("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-2xl text-purple-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎫 My Bookings
          </h1>
          <p className="text-gray-600 text-lg">View and manage your concert tickets</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => router.push("/concerts")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            🎵 Browse Concerts
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎭</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">No Bookings Yet</h2>
            <p className="text-gray-600 mb-8">Start booking your favorite concerts!</p>
            <button
              onClick={() => router.push("/concerts")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Explore Concerts
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  booking.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                <div className="md:flex">
                  {/* Concert Image Section */}
                  <div className="md:w-1/3 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-8 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-7xl mb-4">🎤</div>
                      <h3 className="text-2xl font-bold mb-2">
                        {booking.concertId.title}
                      </h3>
                      <p className="text-purple-100">
                        {booking.concertId.artist}
                      </p>
                    </div>
                  </div>

                  {/* Booking Details Section */}
                  <div className="md:w-2/3 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {booking.concertId.title}
                        </h3>
                        <p className="text-gray-600">
                          {booking.concertId.artist}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">📅</span>
                          <span>
                            {new Date(booking.concertId.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">📍</span>
                          <span>
                            {booking.concertId.venue}, {booking.concertId.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">🎫</span>
                          <span>
                            {booking.totalSeats} seat{booking.totalSeats > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">💰</span>
                          <span className="text-xl font-bold text-purple-600">
                            ₹{booking.totalAmount}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">📝</span>
                          <span className="text-sm">
                            Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">💵</span>
                          <span className="text-sm">Payment: {booking.paymentMode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seats Display */}
                    <div className="bg-purple-50 rounded-xl p-4 mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Your Seats:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats.map((seat, index) => (
                          <span
                            key={index}
                            className="bg-white border-2 border-purple-300 px-3 py-1 rounded-lg font-bold text-purple-600"
                          >
                            {seat.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Payment Status */}
                    {booking.status === "confirmed" && (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          <div>
                            <p className="font-bold text-gray-800">
                              Payment: Cash on Venue
                            </p>
                            <p className="text-sm text-gray-600">
                              Please pay ₹{booking.totalAmount} at the venue entrance
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {booking.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleViewReceipt(booking._id)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                          >
                            📄 View Ticket
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "cancelled" && (
                        <div className="w-full text-center py-3 bg-red-100 text-red-700 font-bold rounded-xl">
                          This booking has been cancelled
                        </div>
                      )}
                    </div>
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