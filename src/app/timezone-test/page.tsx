"use client"

import { useState, useEffect } from "react"
import { COMMON_TIMEZONES, getTimezoneInfo, formatTimezoneForAPI, isValidTimezone, formatStartTimeWithOffset, getTimezoneOffsetFromList } from "@/lib/timezone-utils"

export default function TimezoneTestPage() {
  const [timezone, setTimezone] = useState<string>("Asia/Dhaka")
  const [timezoneInfo, setTimezoneInfo] = useState<any>(null)
  const [isValid, setIsValid] = useState<boolean>(false)

  useEffect(() => {
    const info = getTimezoneInfo(timezone)
    setTimezoneInfo(info)
    
    const valid = isValidTimezone(timezone)
    setIsValid(valid)
  }, [timezone])

  const testAPIFormat = () => {
    if (timezone) {
      const formatted = formatTimezoneForAPI(timezone)
      console.log('🌍 Original timezone:', timezone)
      console.log('📡 API formatted timezone:', formatted)
      console.log('✅ Is valid timezone:', isValid)
      console.log('ℹ️ Timezone info:', timezoneInfo)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Timezone Detection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Timezone Selection</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Timezone:
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validation Status:
              </label>
              <div className={`p-3 rounded-md font-medium ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isValid ? '✅ Valid Timezone' : '❌ Invalid Timezone'}
              </div>
            </div>
            
            {timezoneInfo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone Information:
                </label>
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="space-y-2 text-sm">
                    <div><strong>Timezone:</strong> {timezoneInfo.timezone}</div>
                    <div><strong>Display Name:</strong> {timezoneInfo.timeZoneName}</div>
                    <div><strong>Current Time:</strong> {timezoneInfo.currentTime}</div>
                    <div><strong>Offset:</strong> {timezoneInfo.offset} minutes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Format Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Formatted Timezone:
              </label>
              <div className="p-3 bg-gray-100 rounded-md font-mono">
                {timezone ? formatTimezoneForAPI(timezone) : "N/A"}
              </div>
            </div>
            
            <button
              onClick={testAPIFormat}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Test API Format (Check Console)
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Call Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">getAvailableTimes API Call:</h3>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm">
                <pre>{JSON.stringify({
                  eventTypeSlug: "30min",
                  startDate: "2025-10-10",
                  endDate: "2025-10-15",
                  timezone: timezone ? formatTimezoneForAPI(timezone) : "Asia/Dhaka"
                }, null, 2)}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">createCalcomBooking API Call:</h3>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm">
                <pre>{JSON.stringify({
                  name: "John Doe",
                  email: "john@example.com",
                  timeZone: timezone ? formatTimezoneForAPI(timezone) : "Asia/Dhaka",
                  startTime: timezone ? formatStartTimeWithOffset(new Date('2025-10-12'), "10:30", timezone) : "2025-10-12T10:30:00.000+06:00",
                  eventTypeId: 3583077
                }, null, 2)}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Timezone Offset Information:</h3>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm">
                <div>Timezone: {timezone || "N/A"}</div>
                <div>Offset: {timezone ? getTimezoneOffsetFromList(timezone) : "N/A"}</div>
                <div>Example startTime: {timezone ? formatStartTimeWithOffset(new Date('2025-10-15'), "10:45", timezone) : "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
