"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ref, onValue, set } from "firebase/database";
import { database } from "@/firebase/config";

const SEAT_PRICES = {
  premium: 1000,  // Rows A-C
  standard: 700,  // Rows D-G
  economy: 500    // Rows H+
};

export default function SeatBooking() {
  const params = useParams();
  const concertId = params.id;
  const [concert, setConcert] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const { API_URL, token, user } = useAuth();
  const router = useRouter();

  // Fetch concert details
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchConcert();
  }, [concertId, user]);

  // Real-time Firebase sync for booked seats
  useEffect(() => {
    if (!concertId) return;

    const seatsRef = ref(database, `concerts/${concertId}/bookedSeats`);
    
    const unsubscribe = onValue(seatsRef, (snapshot) => {
      const seats = snapshot.val() || [];
      setBookedSeats(seats);
    });

    return () => unsubscribe();
  }, [concertId]);

  const fetchConcert = async () => {
    try {
      const res = await fetch(`${API_URL}/concerts/${concertId}`);
      const data = await res.json();
      setConcert(data.concert);

      // Initial fetch from backend
      const bookedRes = await fetch(`${API_URL}/bookings/booked-seats/${concertId}`);
      const bookedData = await bookedRes.json();
      setBookedSeats(bookedData.bookedSeats || []);
      
      // Sync to Firebase
      const seatsRef = ref(database, `concerts/${concertId}/bookedSeats`);
      await set(seatsRef, bookedData.bookedSeats || []);
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch concert", error);
      setLoading(false);
    }
  };

  const parseSeatLayout = (layout) => {
    const [hallType, dimensions] = layout.split(":");
    const [rows, seatsPerRow] = dimensions.split("x").map(Number);
    return { rows, seatsPerRow };
  };

  const getSeatPrice = (row) => {
    const rowIndex = row.charCodeAt(0) - 65; // A=0, B=1, etc.
    if (rowIndex < 3) return SEAT_PRICES.premium;
    if (rowIndex < 7) return SEAT_PRICES.standard;
    return SEAT_PRICES.economy;
  };

  const getSeatCategory = (row) => {
    const rowIndex = row.charCodeAt(0) - 65;
    if (rowIndex < 3) return "Premium";
    if (rowIndex < 7) return "Standard";
    return "Economy";
  };

  const handleSeatClick = (seatId, row) => {
    if (bookedSeats.includes(seatId)) return; // Already booked

    if (selectedSeats.find(s => s.seatNumber === seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        alert("Maximum 10 seats can be booked at once");
        return;
      }
      setSelectedSeats([
        ...selectedSeats,
        {
          seatNumber: seatId,
          row,
          price: getSeatPrice(row)
        }
      ]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    setShowForm(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBooking(true);

    try {
      const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

      const res = await fetch(`${API_URL}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          concertId,
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
          seats: selectedSeats,
          totalAmount
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update Firebase with new booked seats
        const newBookedSeats = [...bookedSeats, ...selectedSeats.map(s => s.seatNumber)];
        const seatsRef = ref(database, `concerts/${concertId}/bookedSeats`);
        await set(seatsRef, newBookedSeats);

        // Redirect to receipt
        router.push(`/bookings/${data.booking._id}/receipt`);
      } else {
        alert(data.message || "Booking failed");
        fetchConcert(); // Refresh seats
      }
    } catch (error) {
      alert("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const renderSeats = () => {
    if (!concert) return null;

    const { rows, seatsPerRow } = parseSeatLayout(concert.seatLayout);
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const allRows = [];

    for (let i = 0; i < rows; i++) {
      const row = rowLabels[i];
      const category = getSeatCategory(row);
      const seats = [];

      for (let j = 1; j <= seatsPerRow; j++) {
        const seatId = `${row}${j}`;
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.find(s => s.seatNumber === seatId);

        seats.push(
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId, row)}
            disabled={isBooked}
            className={`
              w-8 h-8 rounded-t-lg text-xs font-bold transition-all duration-200
              ${isBooked 
                ? "bg-red-500 cursor-not-allowed opacity-50" 
                : isSelected
                ? "bg-green-500 text-white scale-110 shadow-lg"
                : "bg-gray-300 hover:bg-purple-400 hover:scale-105"
              }
            `}
            title={`${seatId} - ₹${getSeatPrice(row)}`}
          >
            {isBooked ? "✕" : j}
          </button>
        );
      }

      allRows.push(
        <div key={row} className="mb-2">
          <div className="flex items-center gap-2">
            <div className="w-12 text-center">
              <span className="text-sm font-bold text-gray-700">{row}</span>
              <div className="text-xs text-gray-500">{category}</div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {seats}
            </div>
          </div>
        </div>
      );

      // Add spacing after premium and standard rows
      if (i === 2 || i === 6) {
        allRows.push(<div key={`space-${i}`} className="h-4" />);
      }
    }

    return allRows;
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-2xl text-purple-600">Loading seats...</div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600">Concert not found</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← Back to seat selection
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Complete Your Booking
            </h2>

            <div className="bg-purple-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-3">🎫 Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Concert:</strong> {concert.title}</p>
                <p><strong>Seats:</strong> {selectedSeats.map(s => s.seatNumber).join(", ")}</p>
                <p><strong>Total:</strong> ₹{totalAmount}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  💰 <strong>Payment:</strong> Cash on venue (₹{totalAmount})
                </p>
              </div>

              <button
                type="submit"
                disabled={booking}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {booking ? "Booking..." : "🎉 Confirm Booking"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Concert Info Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">{concert.title}</h1>
          <p className="text-gray-600">🎤 {concert.artist} | 📍 {concert.venue} | 📅 {new Date(concert.date).toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 px-12 py-3 rounded-xl shadow-lg font-bold mb-8">
                🎬 SCREEN 🎬
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              {renderSeats()}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-8 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-t-lg"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-t-lg"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded-t-lg opacity-50"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="space-y-4">
            {/* Price Legend */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-lg mb-4">💰 Seat Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-semibold">Premium (A-C)</span>
                  <span className="text-purple-600 font-bold">₹1000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold">Standard (D-G)</span>
                  <span className="text-blue-600 font-bold">₹700</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold">Economy (H+)</span>
                  <span className="text-green-600 font-bold">₹500</span>
                </div>
              </div>
            </div>

            {/* Selected Seats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-lg mb-4">
                🎫 Selected Seats ({selectedSeats.length})
              </h3>
              
              {selectedSeats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No seats selected</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {selectedSeats.map((seat) => (
                      <div key={seat.seatNumber} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="font-semibold">{seat.seatNumber}</span>
                        <span className="text-purple-600">₹{seat.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg">Total Amount:</span>
                      <span className="font-bold text-2xl text-purple-600">₹{totalAmount}</span>
                    </div>

                    <button
                      onClick={handleProceed}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Proceed to Book
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Live Status */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">
                  Live seat updates enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}