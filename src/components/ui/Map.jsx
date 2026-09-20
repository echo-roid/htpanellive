import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

// 🌎 World Map Source
const WORLD_MAP = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// 🗺️ Random Colors for Countries
const colors = [
  "#60a5fa", "#34d399", "#f87171", "#fbbf24", "#a78bfa", "#f472b6", "#22d3ee",
  "#4ade80", "#facc15", "#fb7185", "#c084fc", "#2dd4bf", "#93c5fd"
];

// 📍 Markers for Major Countries
const markers = [
  { name: "India", coordinates: [78.9629, 20.5937], info: "1.4B People" },
  { name: "USA", coordinates: [-98.5795, 39.8283], info: "331M People" },
  { name: "China", coordinates: [104.1954, 35.8617], info: "1.41B People" },
  { name: "Brazil", coordinates: [-51.9253, -14.235], info: "213M People" },
  { name: "Australia", coordinates: [133.7751, -25.2744], info: "26M People" },
  { name: "Russia", coordinates: [105.3188, 61.524], info: "146M People" },
  { name: "UK", coordinates: [-3.435973, 55.378051], info: "67M People" },
];

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-800 text-white flex flex-col p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-center tracking-wide drop-shadow-xl">
        🌍 Global Dashboard
      </h1>

      <div className="flex flex-1 bg-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/20">
        {/* Sidebar */}
        <div className="w-1/4 border-r border-white/20 pr-4">
          <h2 className="text-2xl font-semibold mb-4 text-sky-300">Overview</h2>
          <ul className="space-y-3 text-sm">
            <li>🧭 Continents: <b>7</b></li>
            <li>🏳️‍🌈 Countries: <b>195</b></li>
            <li>👨‍👩‍👧‍👦 Population: <b>8 Billion+</b></li>
            <li>🌎 Oceans: <b>5</b></li>
          </ul>

          {selectedCountry && (
            <motion.div
              className="mt-8 p-4 bg-white/20 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold text-sky-200">
                📍 {selectedCountry.name}
              </h3>
              <p className="text-sm text-gray-200">{selectedCountry.info}</p>
            </motion.div>
          )}
        </div>

        {/* 🌍 World Map */}
        <div className="flex-1 flex items-center justify-center relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 140,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={WORLD_MAP}>
              {({ geographies }) =>
                geographies.map((geo, index) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() =>
                      setSelectedCountry({
                        name: geo.properties.name,
                        info: `Country: ${geo.properties.name}`,
                      })
                    }
                    fill={colors[index % colors.length]}
                    stroke="#ffffffaa"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#f472b6", transition: "0.3s ease" },
                      pressed: { fill: "#f87171", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {markers.map(({ name, coordinates, info }) => (
              <Marker key={name} coordinates={coordinates}>
                <motion.circle
                  r={6}
                  fill="#fb923c"
                  stroke="#fff"
                  strokeWidth={1.5}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="cursor-pointer"
                  onClick={() => setSelectedCountry({ name, info })}
                />
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontFamily: "system-ui",
                    fill: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {name}
                </text>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
    </div>
  );
}


