import { useState } from "react";

const SetupPage = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-white px-10 py-8 relative text-[10px] text-gray-900">
      {/* Header */}
      <h1 className="font-semibold mb-2 text-[10px]">Setup</h1>
      <p className="text-gray-600 mb-8 max-w-3xl text-[10px]">
        Discover more value with Microsoft 365. Set up services, solutions, and
        add-ons available with your subscription.
      </p>

      {/* For organizations like yours */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[10px]">
          For organizations like yours
        </h2>
        <button className="text-blue-600 hover:underline text-[10px]">
          Show more
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-5xl">
        {/* Card 1 */}
        <div
          onClick={() => setOpenDrawer(true)}
          className="border rounded-lg p-6 flex gap-4 hover:shadow-md transition cursor-pointer items-start"
        >
          <div className="w-20 h-10 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 font-bold text-[10px]">B</span>
          </div>

          <div>
            <h3 className="font-semibold flex gap-3 mb-1 text-[10px]">
              Ticketing Management Element
              <label className="relative inline-flex items-center cursor-pointer ml-2">
  <input type="checkbox" className="sr-only peer" />
  
  {/* Track */}
  <div className="
    w-6 h-3
    bg-gray-300
    rounded-full
    peer-checked:bg-blue-600
    transition-colors
  "></div>

  {/* Thumb */}
  <div className="
    absolute left-[1px] top-[1px]
    w-2 h-2
    bg-white
    rounded-full
    transition-transform
    peer-checked:translate-x-3
  "></div>
</label>

            </h3>
            <p className="text-gray-600 text-[10px] leading-snug">
              Manages all ticket-related activities, including flight details,
              booking status, guest assignment, ticket uploads, and data
              verification.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border rounded-lg p-6 flex gap-4 hover:shadow-md transition">
          <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center">
            <span className="text-indigo-600 text-[10px]">📱</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-[10px]">
              Visa Management Element
            </h3>
            <p className="text-gray-600 text-[10px] leading-snug">
              Manages visa-related processes including application tracking,
              document upload, and vendor coordination.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border rounded-lg p-6 flex gap-4 hover:shadow-md transition">
          <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center">
            <span className="text-indigo-600 text-[10px]">📱</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-[10px]">
              Hotel & Transit Hotel Management Element
            </h3>
            <p className="text-gray-600 text-[10px] leading-snug">
              Manages hotel and transit hotel bookings, room allocation, and
              confirmations.
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="border rounded-lg p-6 flex gap-4 hover:shadow-md transition">
          <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center">
            <span className="text-indigo-600 text-[10px]">📱</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-[10px]">
              Transport Management Element
            </h3>
            <p className="text-gray-600 text-[10px] leading-snug">
              Manages vehicle booking, routes, pickup and drop schedules.
            </p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="border rounded-lg p-6 flex gap-4 hover:shadow-md transition">
          <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center">
            <span className="text-indigo-600 text-[10px]">📱</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-[10px]">
              Guest Support Management Element
            </h3>
            <p className="text-gray-600 text-[10px] leading-snug">
              Handles guest queries, requests, and issue resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Featured collections */}
      <h2 className="font-semibold mb-1 text-[10px]">
        Featured collections
      </h2>
      <p className="text-gray-600 mb-6 text-[10px]">
        Lists of related actions to help you manage a scenario or meet a goal.
      </p>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {["Remote work essentials", "Advanced deployment guides & assistance", "Migration and imports"].map(
          (title, i) => (
            <div key={i} className="border rounded-lg p-6 hover:shadow-md transition">
              <h3 className="font-semibold mb-1 text-[10px]">{title}</h3>
              <p className="text-gray-600 text-[10px]">
                Supporting tools and actions for streamlined operations.
              </p>
            </div>
          )
        )}
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-30">
        <button className="w-12 h-12 bg-teal-600 rounded-md text-white shadow-lg text-[10px]">
          🎧
        </button>
        <button className="w-12 h-12 bg-gray-600 rounded-md text-white shadow-lg text-[10px]">
          💬
        </button>
      </div>

      {/* Drawer */}
      {openDrawer && (
        <>
          <div
            onClick={() => setOpenDrawer(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />

          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl animate-slideIn text-[10px]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-[10px]">
                Ticketing Management Element
              </h3>
              <button
                onClick={() => setOpenDrawer(false)}
                className="text-gray-500 hover:text-gray-800 text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-[10px]">
                Configure ticket workflows, validations, and automation rules.
              </p>

              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-[10px]">
                Get Started
              </button>
            </div>
          </div>
        </>
      )}

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default SetupPage;
