"use client";

import { useState } from "react";

const HALL_CONFIGS = {
  small: {
    name: "Small Hall",
    rows: 6,
    seatsPerRow: 8,
    total: 48,
    icon: "🎪",
  },
  medium: {
    name: "Medium Hall",
    rows: 10,
    seatsPerRow: 12,
    total: 120,
    icon: "🎭",
  },
  large: {
    name: "Large Hall",
    rows: 15,
    seatsPerRow: 16,
    total: 240,
    icon: "🏟️",
  },
};

export default function SeatLayoutSelector({ onLayoutChange }) {
  const [selectedHall, setSelectedHall] = useState("medium");

  const handleHallChange = (hallType) => {
    setSelectedHall(hallType);
    const config = HALL_CONFIGS[hallType];
    const seatLayout = `${hallType}:${config.rows}x${config.seatsPerRow}`;
    onLayoutChange({
      seatLayout,
      totalSeats: config.total,
    });
  };

  const renderSeats = () => {
    const config = HALL_CONFIGS[selectedHall];
    const rows = [];
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < config.rows; i++) {
      const seats = [];
      for (let j = 0; j < config.seatsPerRow; j++) {
        seats.push(
          <div
            key={`${i}-${j}`}
            className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg border-2 border-purple-600 hover:scale-110 transition-transform duration-200 shadow-md"
            title={`${rowLabels[i]}${j + 1}`}
          />
        );
      }
      rows.push(
        <div key={i} className="flex items-center gap-1 mb-1">
          <span className="text-xs font-bold text-gray-600 w-6 text-center">
            {rowLabels[i]}
          </span>
          <div className="flex gap-1">{seats}</div>
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="space-y-6">
      {/* Hall Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Hall Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(HALL_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleHallChange(key)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedHall === key
                  ? "border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105"
                  : "border-gray-300 bg-white hover:border-purple-400 hover:shadow-md"
              }`}
            >
              <div className="text-3xl mb-2">{config.icon}</div>
              <div className="text-sm font-bold text-gray-800">
                {config.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {config.total} seats
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seat Layout Preview */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
        <div className="text-center mb-4">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 px-8 py-2 rounded-lg shadow-lg font-bold text-sm mb-6">
            🎬 SCREEN 🎬
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-block bg-white p-6 rounded-2xl shadow-xl border-2 border-purple-200">
            {renderSeats()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mt-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg border-2 border-purple-600"></div>
            <span className="text-gray-700 font-medium">Available Seat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Total: <strong className="text-purple-600">{HALL_CONFIGS[selectedHall].total}</strong> seats
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600 mb-1">Rows</div>
            <div className="text-2xl font-bold text-purple-600">
              {HALL_CONFIGS[selectedHall].rows}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Seats/Row</div>
            <div className="text-2xl font-bold text-purple-600">
              {HALL_CONFIGS[selectedHall].seatsPerRow}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Total Seats</div>
            <div className="text-2xl font-bold text-purple-600">
              {HALL_CONFIGS[selectedHall].total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}