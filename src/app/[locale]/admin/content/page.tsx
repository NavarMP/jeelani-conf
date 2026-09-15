import React from "react";

export const metadata = {
  title: "Content Manager | Admin",
};

export default function ContentManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Manage global site copy, hero sections, and settings</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            Discard Changes
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors">
            Publish All
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <nav className="flex flex-col">
              <button className="px-4 py-3 text-left text-sm font-medium bg-gray-50 text-[var(--color-navy)] border-l-4 border-[var(--color-navy)]">
                Global Settings
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors border-t border-gray-100">
                Hero Section
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors border-t border-gray-100">
                About / Central Idea
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors border-t border-gray-100">
                Speakers Roster
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors border-t border-gray-100">
                Footer & Social Links
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors border-t border-gray-100">
                Translation (ML / AR)
              </button>
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Global Site Settings</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                
                <div className="sm:col-span-3">
                  <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">Event Date</label>
                  <div className="mt-1">
                    <input type="datetime-local" id="event-date" defaultValue="2026-09-27T10:00" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Event End Date</label>
                  <div className="mt-1">
                    <input type="datetime-local" id="end-date" defaultValue="2026-09-27T22:00" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700">Venue / Location Name</label>
                  <div className="mt-1">
                    <input type="text" id="venue" defaultValue="Alathurpadi, Melmuri" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="map-url" className="block text-sm font-medium text-gray-700">Google Maps URL</label>
                  <div className="mt-1">
                    <input type="url" id="map-url" defaultValue="https://maps.app.goo.gl/nCJ4g6Rx9B9Sn3c99" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">Tagline (EN)</label>
                  <div className="mt-1">
                    <input type="text" id="tagline" defaultValue="From Baghdad to Malabar — Persian Artistry. Malabar Soul." className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Organizer Name</label>
                  <div className="mt-1">
                    <input type="text" id="organizer" defaultValue="Alathurpadi Students Association" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input id="registrations-open" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)]" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="registrations-open" className="font-medium text-gray-700">Registrations Open</label>
                      <p className="text-gray-500">Toggle whether the public registration forms accept new entries.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
