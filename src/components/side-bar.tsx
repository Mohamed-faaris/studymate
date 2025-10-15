"use client";
import { useState } from "react";

export default function SideBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-full border-r bg-white shadow-md transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="m-2 p-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {isCollapsed ? "Expand" : "Collapse"}
      </button>
      {!isCollapsed && (
        <div className="p-4">
          <h2 className="text-lg font-semibold">Side Bar</h2>
          <ul className="mt-2">
            <li>
              <a
                href="#"
                className="block py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Link 1
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Link 2
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Link 3
              </a>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}
