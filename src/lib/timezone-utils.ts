/**
 * Utility functions for timezone detection and handling
 */

// Common timezones list for dropdown
export const COMMON_TIMEZONES = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (UTC+06:00)", offset: "+06:00" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (UTC+05:30)", offset: "+05:30" },
  { value: "Asia/Karachi", label: "Asia/Karachi (UTC+05:00)", offset: "+05:00" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UTC+04:00)", offset: "+04:00" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+09:00)", offset: "+09:00" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+08:00)", offset: "+08:00" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+08:00)", offset: "+08:00" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+07:00)", offset: "+07:00" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (UTC+07:00)", offset: "+07:00" },
  { value: "Asia/Manila", label: "Asia/Manila (UTC+08:00)", offset: "+08:00" },
  { value: "America/New_York", label: "America/New_York (UTC-05:00)", offset: "-05:00" },
  { value: "America/Chicago", label: "America/Chicago (UTC-06:00)", offset: "-06:00" },
  { value: "America/Denver", label: "America/Denver (UTC-07:00)", offset: "-07:00" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-08:00)", offset: "-08:00" },
  { value: "Europe/London", label: "Europe/London (UTC+00:00)", offset: "+00:00" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+01:00)", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+01:00)", offset: "+01:00" },
  { value: "Europe/Moscow", label: "Europe/Moscow (UTC+03:00)", offset: "+03:00" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10:00)", offset: "+10:00" },
  { value: "Australia/Melbourne", label: "Australia/Melbourne (UTC+10:00)", offset: "+10:00" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (UTC+12:00)", offset: "+12:00" },
  { value: "UTC", label: "UTC (UTC+00:00)", offset: "+00:00" }
]

/**
 * Auto-detect user's timezone using browser Intl API
 * @returns The detected timezone string (e.g., "America/New_York", "Asia/Tokyo")
 */
export const detectTimezone = (): string => {
  try {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log('🌍 Auto-detected timezone:', detectedTimezone)
    return detectedTimezone
  } catch (error) {
    console.error('❌ Failed to detect timezone:', error)
    // Fallback to Asia/Dhaka if detection fails
    return "Asia/Dhaka"
  }
}

/**
 * Get timezone offset information
 * @param timezone The timezone string
 * @returns Object with timezone offset information
 */
export const getTimezoneInfo = (timezone: string) => {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const parts = formatter.formatToParts(now)
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone
    
    return {
      timezone,
      timeZoneName,
      offset: now.getTimezoneOffset(),
      currentTime: formatter.format(now)
    }
  } catch (error) {
    console.error('❌ Failed to get timezone info:', error)
    return {
      timezone,
      timeZoneName: timezone,
      offset: 0,
      currentTime: new Date().toISOString()
    }
  }
}

/**
 * Format timezone for API calls
 * @param timezone The timezone string
 * @returns Formatted timezone string for API consumption
 */
export const formatTimezoneForAPI = (timezone: string): string => {
  // Ensure timezone is in the correct format for API calls
  // Most APIs expect IANA timezone format (e.g., "America/New_York", "Asia/Tokyo")
  return timezone
}

/**
 * Get timezone offset in format +HH:MM or -HH:MM
 * @param timezone The timezone string
 * @returns Timezone offset string (e.g., "+06:00", "-05:00")
 */
export const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString("en-US", { timeZone: timezone }))
    const offsetMs = targetTime.getTime() - utc.getTime()
    const offsetHours = Math.floor(Math.abs(offsetMs) / (1000 * 60 * 60))
    const offsetMinutes = Math.floor((Math.abs(offsetMs) % (1000 * 60 * 60)) / (1000 * 60))
    const sign = offsetMs >= 0 ? '+' : '-'
    
    return `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`
  } catch (error) {
    console.error('❌ Failed to get timezone offset:', error)
    return '+00:00' // Fallback to UTC
  }
}

/**
 * Get timezone offset from the hardcoded list
 * @param timezone The timezone string
 * @returns Timezone offset string (e.g., "+06:00", "-05:00")
 */
export const getTimezoneOffsetFromList = (timezone: string): string => {
  const timezoneObj = COMMON_TIMEZONES.find(tz => tz.value === timezone)
  return timezoneObj ? timezoneObj.offset : "+00:00"
}

/**
 * Format startTime with timezone offset for API calls (exact format from API response)
 * @param date The date object
 * @param time The time string (e.g., "10:45 AM" or "10:45")
 * @param timezone The timezone string
 * @returns Formatted startTime string with timezone offset
 */
export const formatStartTimeWithOffset = (date: Date, time: string, timezone: string): string => {
  try {
    // Convert time to 24-hour format if needed
    let time24h = time
    if (time.includes('AM') || time.includes('PM')) {
      time24h = convertTo24Hour(time)
    }
    
    // Format date as YYYY-MM-DD using timezone-aware formatting
    // This prevents date shifting when converting to UTC
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
    
    // Get timezone offset from hardcoded list
    const offset = getTimezoneOffsetFromList(timezone)
    
    // Combine date, time, and offset - exact format: "2025-10-23T10:00:00.000+06:00"
    return `${dateStr}T${time24h}:00.000${offset}`
  } catch (error) {
    console.error('❌ Failed to format startTime with offset:', error)
    // Fallback format - use local date formatting to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return `${dateStr}T${time}:00.000+00:00`
  }
}

/**
 * Convert 12-hour time to 24-hour format
 * @param time12h Time in 12-hour format (e.g., "10:45 AM")
 * @returns Time in 24-hour format (e.g., "10:45")
 */
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString()
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`
}

/**
 * Validate timezone string
 * @param timezone The timezone string to validate
 * @returns True if timezone is valid, false otherwise
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (error) {
    return false
  }
}
