import { Cloud, House, User } from "lucide-react";
import React from "react";

const Sidebar = () => {
  return (
    <div className="flex h-screen border-r border-gray-200">
      {/* Sidebar */}
      <nav className="w-1/4 min-w-[200px] max-w-[250px]  p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-8">Dashboard</h2>

        <ul className="space-y-1">
          <li className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition">
            <House size={20} />
            <span className="text-base font-medium">Overview</span>
          </li>

          <li className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition">
            <User size={20} />
            <span className="text-base font-medium">Personal</span>
          </li>
          <li className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition">
            <Cloud size={20} />
            <span className="text-base font-medium">Admin Panel</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
