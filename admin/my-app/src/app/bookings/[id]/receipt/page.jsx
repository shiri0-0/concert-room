"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function BookingReceipt() {
  const params = useParams();
  const bookingId = params.id;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);
  
  const { API_URL, token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchBooking();
  }, [bookingId, user]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setBooking(data.booking);
      } else {
        alert("Booking not found");
        router.push("/my-bookings");
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch booking", error);
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`ticket-${booking._id}.pdf`);
    } catch (error) {
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-2xl text-purple-600">Loading receipt...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">Your tickets are ready</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "📄 Download PDF Ticket"}
          </button>
          <button
            onClick={() => router.push("/my-bookings")}
            className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg"
          >
            🎫 View All Bookings
          </button>
        </div>

        {/* Receipt */}
        <div ref={receiptRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">🎵 Concert Ticket</h2>
              <p className="text-purple-100">Booking ID: {booking._id}</p>
            </div>
          </div>

          {/* Concert Details */}
          <div className="p-8 border-b-4 border-dashed border-gray-300">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              {booking.concertId.title}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Artist</p>
                <p className="text-lg font-semibold text-gray-800">
                  🎤 {booking.concertId.artist}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                <p className="text-lg font-semibold text-gray-800">
                  📅 {new Date(booking.concertId.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Venue</p>
                <p className="text-lg font-semibold text-gray-800">
                  📍 {booking.concertId.venue}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">City</p>
                <p className="text-lg font-semibold text-gray-800">
                  🏙️ {booking.concertId.city}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-8 bg-gray-50 border-b-4 border-dashed border-gray-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4">🎫 Your Seats</h4>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {booking.seats.map((seat, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-purple-300 rounded-xl p-4 text-center"
                >
                  <p className="text-2xl font-bold text-purple-600">{seat.seatNumber}</p>
                  <p className="text-sm text-gray-600">₹{seat.price}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Seats:</span>
                <span className="font-bold text-gray-800">{booking.totalSeats}</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-gray-800">Total Amount:</span>
                <span className="font-bold text-purple-600">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-8 border-b-4 border-dashed border-gray-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4">👤 Customer Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-800">{booking.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold text-gray-800">{booking.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-800">{booking.userPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-8 bg-yellow-50">
            <div className="flex items-center gap-4">
              <div className="text-4xl">💰</div>
              <div>
                <p className="font-bold text-lg text-gray-800">Payment: Cash on Venue</p>
                <p className="text-sm text-gray-600">
                  Please pay ₹{booking.totalAmount} at the venue entrance
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="p-8 bg-gradient-to-r from-purple-100 to-pink-100 text-center">
            <div className="inline-block bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center mb-3">
                <div className="text-6xl">📱</div>
              </div>
              <p className="text-sm text-gray-600">Scan at venue entrance</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 text-white p-6 text-center">
            <p className="text-sm mb-2">⚠️ Important Instructions</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Carry this ticket (printed or digital) to the venue</li>
              <li>• Arrive 30 minutes before the show starts</li>
              <li>• Valid ID proof is mandatory</li>
              <li>• No refunds or cancellations allowed</li>
            </ul>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/concerts")}
            className="text-purple-600 hover:text-purple-800 font-semibold underline"
          >
            ← Back to Concerts
          </button>
        </div>
      </div>
    </div>
  );
}