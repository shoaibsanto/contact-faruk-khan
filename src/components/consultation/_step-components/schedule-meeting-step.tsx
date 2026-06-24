// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import type { FormData } from "../consultation-booking"
// import { ChevronLeft, ChevronRight, Clock, Video, Globe, AlertCircle, ChevronDown, CircleCheck } from "lucide-react"
// import {
//   format,
//   addMonths,
//   subMonths,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   isSameMonth,
//   isSameDay,
//   getDay,
//   isBefore,
//   startOfDay,
// } from "date-fns"
// import { cn } from "@/lib/utils"
// import { getAvailableTimes, createCalcomBooking, getEventTypes, type EventType } from "@/lib/api"
// import { useToast } from "@/hooks/use-toast"
// import { COMMON_TIMEZONES, formatTimezoneForAPI, formatStartTimeWithOffset, getTimezoneOffsetFromList } from "@/lib/timezone-utils"

// interface ScheduleMeetingStepProps {
//   formData: FormData
//   updateFormData: (data: Partial<FormData>) => void
//   onConfirm: () => void
//   onBack: () => void
//   isSubmitting?: boolean
//   submitError?: string | null
//   // Called after Cal.com booking succeeds so parent can track success
//   onBookingSuccess?: () => void
// }

// export function ScheduleMeetingStep({ formData, updateFormData, onConfirm, onBack, isSubmitting = false, submitError, onBookingSuccess }: ScheduleMeetingStepProps) {
//   const [currentMonth, setCurrentMonth] = useState(new Date()) 
//   const [timeFormat, setTimeFormat] = useState("24h")
//   const [slotsData, setSlotsData] = useState<Record<string, Array<{ start: string; end: string }>> | null>(null)
//   const [loadingSlots, setLoadingSlots] = useState(false)
//   const [slotsError, setSlotsError] = useState<string | null>(null)
//   const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)
//   const { toast } = useToast()
  
//   // Event types state
//   const [eventTypes, setEventTypes] = useState<EventType[]>([])
//   const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
//   const [loadingEventTypes, setLoadingEventTypes] = useState(false)
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)
//   const dropdownRef = useRef<HTMLDivElement>(null)
  
//   // Selected timezone from dropdown
//   const [timezone, setTimezone] = useState<string>("Asia/Dhaka")
//   const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false)

//   // Helper function to format time from API response
//   const formatSlotTime = (iso: string) => {
//     try {
//       const date = new Date(iso)
//       const opts: Intl.DateTimeFormatOptions = {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: timeFormat === "12h",
//         timeZone: timezone,
//       }
//       return new Intl.DateTimeFormat("en-US", opts).format(date)
//     } catch (e) {
//       return iso
//     }
//   }

//   // Helper function to format date key (yyyy-MM-dd)
//   const formatDateKey = (d: Date) => {
//     try {
//       return format(d, "yyyy-MM-dd")
//     } catch (e) {
//       return ""
//     }
//   }

//   // Fetch event types from API
//   const fetchEventTypes = async () => {
//     setLoadingEventTypes(true)
    
//     try {
//       console.log('🔄 Fetching event types from API...')
//       const data = await getEventTypes()
//       console.log('✅ Event Types API Success:', data)
      
//       // Extract event types from the response
//       const allEventTypes: EventType[] = []
//       data.eventTypes.data.eventTypeGroups.forEach(group => {
//         if (group.eventTypes) {
//           allEventTypes.push(...group.eventTypes)
//         }
//       })
      
//       setEventTypes(allEventTypes)
      
//       // Set default selection to first event type if none selected
//       if (allEventTypes.length > 0 && !selectedEventType) {
//         setSelectedEventType(allEventTypes[0])
//       }
//     } catch (error) {
//       console.error('❌ Event Types API Failed:', error)
//       toast({
//         title: "Error",
//         description: "Failed to load meeting types. Please refresh the page.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoadingEventTypes(false)
//     }
//   }

//   // Fetch available slots from API
//   const fetchAvailableSlots = async (startDate: Date, endDate: Date) => {
//     if (!selectedEventType) {
//       console.log('⚠️ No event type selected, skipping slot fetch')
//       return
//     }
    
//     if (!timezone) {
//       console.log('⚠️ Timezone not detected yet, skipping slot fetch')
//       return
//     }
    
//     setLoadingSlots(true)
//     setSlotsError(null)
    
//     try {
//       console.log('🔄 Fetching available slots from API...')
      
//       const params = {
//         eventTypeSlug: selectedEventType.slug,
//         startDate: formatDateKey(startDate),
//         endDate: formatDateKey(endDate),
//         timezone: formatTimezoneForAPI(timezone)
//       }
      
//       console.log('📅 API Params:', params)
//       const data = await getAvailableTimes(params)
//       console.log('✅ API Success:', data)
//       setSlotsData(data.slots.data)
//     } catch (error) {
//       console.error('❌ API Failed:', error)
//       setSlotsError('Failed to load available time slots.')
//       setSlotsData(null)
//     } finally {
//       setLoadingSlots(false)
//     }
//   }

//   // Fetch event types on component mount
//   useEffect(() => {
//     fetchEventTypes()
//   }, [])

//   // Fetch slots for current month when event type, month, or timezone changes
//   useEffect(() => {
//     if (selectedEventType && timezone) {
//       const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
//       const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
//       fetchAvailableSlots(startOfMonth, endOfMonth)
//     }
//   }, [currentMonth, selectedEventType, timezone])

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false)
//       }
//       // Close timezone dropdown when clicking outside
//       const timezoneDropdown = document.querySelector('[data-timezone-dropdown]')
//       if (timezoneDropdown && !timezoneDropdown.contains(event.target as Node)) {
//         setIsTimezoneDropdownOpen(false)
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [])

//   const handleDateSelect = (date: Date) => {
//     updateFormData({ selectedDate: date })
//     // Fetch slots for the selected date (same day as start and end)
//     fetchAvailableSlots(date, date)
//   }

//   const handleTimeSelect = (time: string) => {
//     updateFormData({ selectedTime: time })
//   }

//   const handleEventTypeSelect = (eventType: EventType) => {
//     setSelectedEventType(eventType)
//     setIsDropdownOpen(false)
//     // Clear previous selections when event type changes
//     updateFormData({ selectedDate: null, selectedTime: "" })
//     setSlotsData(null)
//   }

//   const handleConfirm = async () => {
//     if (!formData.selectedDate || !formData.selectedTime || !selectedEventType) {
//       toast({
//         title: "Selection Required",
//         description: "Please select a meeting type, date, and time",
//         variant: "destructive",
//       })
//       return
//     }

//     if (!timezone) {
//       toast({
//         title: "Timezone Detection Required",
//         description: "Please wait for timezone detection to complete",
//         variant: "destructive",
//       })
//       return
//     }

//     // Prevent double submission
//     if (isBookingSubmitting) {
//       console.log('⚠️ Booking submission already in progress, skipping duplicate call')
//       return
//     }

//     setIsBookingSubmitting(true)

//     try {
//       // Extract start time from selected time (format: "09:00 AM - 09:30 AM")
//       const timeParts = formData.selectedTime.split(' - ')
//       const startTimeStr = timeParts[0]
      
//       // Format startTime with timezone offset (e.g., "2025-10-15T10:45:00.000+06:00")
//       const startTimeISO = formatStartTimeWithOffset(formData.selectedDate, startTimeStr, timezone)

//       // API 1: Create Cal.com booking with auto-detected timezone
//       const bookingData = {
//         name: formData.fullName,
//         email: formData.email,
//         timeZone: formatTimezoneForAPI(timezone), // Auto-detected timezone
//         startTime: startTimeISO, // Formatted with timezone offset
//         eventTypeId: selectedEventType.id // Use selected event type ID
//       }

//       console.log('🔄 Submitting booking data with auto-detected timezone:', bookingData)
//       await createCalcomBooking(bookingData)
//       console.log('✅ Cal.com booking created successfully with timezone:', timezone)

//       // Notify parent that booking step succeeded
//       try {
//         onBookingSuccess && onBookingSuccess()
//       } catch {}

//       // Booking successful, proceed with confirmation
//       // Note: sendContactEmail is handled by the parent component
//       console.log('🔄 Calling onConfirm to trigger parent handleConfirmBooking')
//       onConfirm()
      
//     } catch (error) {
//       console.error('❌ Booking submission failed:', error)
//       toast({
//         title: "Booking Failed",
//         description: error instanceof Error ? error.message : 'Failed to book your consultation. Please try again.',
//         variant: "destructive",
//       })
//     } finally {
//       setIsBookingSubmitting(false)
//     }
//   }


//   const monthStart = startOfMonth(currentMonth)
//   const monthEnd = endOfMonth(currentMonth)
//   const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
//   const startDayOfWeek = getDay(monthStart)
//   const calendarDays = Array(startDayOfWeek).fill(null).concat(daysInMonth)

//   return (
//     <>
//       <div className="max-w-5xl mx-auto bg-white rounded-xl border border-gray-200 ">
//         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_230px]">
//           {/* --- Left Column: Profile + Meeting Details --- */}
//           <div className="border-r-0 lg:border-r border-gray-200 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
//             {/* Profile */}
//             <div className="flex items-center gap-3">
//               <img
//                 src="/ceo.png"
//                 alt="profile"
//                 className="w-10 h-10 rounded-full object-cover  border-gray-300"
//               />
//               <p className="text-sm font-medium text-gray-900">Md Faruk Khan</p>
//             </div>

//             {/* Meeting Info */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">
//                 {selectedEventType ? selectedEventType.title : "Select Meeting Type"}
//               </h2>
//               <p className="text-sm text-gray-600 mt-2 leading-relaxed">
//                 Book your strategy call today to explore how SEO and AI-driven search optimization can accelerate your
//                 business growth.
//               </p>
//             </div>

//             {/* Meeting Details */}
//             <div className="space-y-4 mt-4">
//               {/* Meeting Type */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-shrink-0 w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
//                   <Clock className="w-5 h-5 text-[#F47E20]" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       type="button"
//                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                       className="flex items-center justify-between w-full text-left hover:text-[#F47E20] transition-colors min-w-0"
//                       disabled={loadingEventTypes}
//                     >
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-medium text-gray-900 truncate">
//                           {selectedEventType 
//                             ? selectedEventType.title
//                             : loadingEventTypes 
//                               ? "Loading meeting types..."
//                               : "Select meeting type"
//                           }
//                         </p>
//                         {selectedEventType && (
//                           <p className="text-xs text-gray-500">{selectedEventType.length} minutes</p>
//                         )}
//                       </div>
//                       <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
//                     </button>
                    
//                     {isDropdownOpen && eventTypes.length > 0 && (
//                       <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
//                         {eventTypes.map((eventType) => (
//                           <button
//                             key={eventType.id}
//                             type="button"
//                             onClick={() => handleEventTypeSelect(eventType)}
//                             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
//                           >
//                             <div className="font-medium text-gray-900 truncate">{eventType.title}</div>
//                             <div className="text-xs text-gray-500">{eventType.length} minutes</div>
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Meeting Platform */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-shrink-0 w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
//                   <Video className="w-5 h-5 text-[#F47E20]" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-900">Google Meet</p>
//                   <p className="text-xs text-gray-500">Video call link will be sent</p>
//                 </div>
//               </div>

//               {/* Timezone */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-shrink-0 w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
//                   <Globe className="w-5 h-5 text-[#F47E20]" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="relative" data-timezone-dropdown>
//                     <button
//                       type="button"
//                       onClick={() => setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen)}
//                       className="flex items-center justify-between w-full text-left hover:text-[#F47E20] transition-colors min-w-0"
//                     >
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-medium text-gray-900 truncate">
//                           {COMMON_TIMEZONES.find(tz => tz.value === timezone)?.label || timezone}
//                         </p>
//                         <p className="text-xs text-gray-500">Your timezone</p>
//                       </div>
//                       <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
//                     </button>
                    
//                     {isTimezoneDropdownOpen && (
//                       <div className="absolute top-full left-0 mt-1 w-full max-w-xs sm:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
//                         {COMMON_TIMEZONES.map((tz) => (
//                           <button
//                             key={tz.value}
//                             type="button"
//                             onClick={() => {
//                               setTimezone(tz.value)
//                               setIsTimezoneDropdownOpen(false)
//                             }}
//                             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
//                           >
//                             <div className="font-medium text-gray-900 truncate">{tz.label}</div>
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-amber-50 border border-amber-200 rounded-full p-2 flex items-center gap-3 mt-6">
//               <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
//                 <CircleCheck className="w-4 h-4 text-amber-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-amber-800">Requires confirmation</p>
//                 {/* <p className="text-xs text-amber-700">You'll receive a confirmation email after booking</p> */}
//               </div>
//             </div>
//           </div>

//           {/* --- Middle Column: Calendar --- */}
//           <div className="p-4 sm:p-6 border-r-0 lg:border-r border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h3>
//                <div className="flex gap-1">
//                  <Button
//                    variant="ghost"
//                    size="icon"
//                    className="h-8 w-8"
//                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
//                    disabled={isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(new Date()))}
//                  >
//                    <ChevronLeft className="h-4 w-4" />
//                  </Button>
//                  <Button
//                    variant="ghost"
//                    size="icon"
//                    className="h-8 w-8"
//                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
//                  >
//                    <ChevronRight className="h-4 w-4" />
//                  </Button>
//                </div>
//             </div>

//             {/* Days header */}
//             <div className="grid grid-cols-7 gap-1 mb-2">
//               {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
//                 <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1 sm:py-2">
//                   {day}
//                 </div>
//               ))}
//             </div>

//             {/* Calendar days */}
//             <div className="grid grid-cols-7 gap-1">
//               {calendarDays.map((day, index) => {
//                 if (!day) {
//                   return <div key={`empty-${index}`} className="aspect-square min-h-[32px] sm:min-h-[40px]" />
//                 }

//                 const isSelected = formData.selectedDate && isSameDay(day, formData.selectedDate)
//                 const isCurrentMonth = isSameMonth(day, currentMonth)
//                 const isPastDate = isBefore(day, startOfDay(new Date()))
//                 const dateKey = formatDateKey(day)
//                 const hasSlots = slotsData && slotsData[dateKey] && slotsData[dateKey].length > 0

//                 return (
//                    <button
//                      key={day.toISOString()}
//                      type="button"
//                      onClick={() => handleDateSelect(day)}
//                      disabled={!isCurrentMonth || isPastDate}
//                      className={cn(
//                        "aspect-square min-h-[32px] sm:min-h-[40px] flex items-center justify-center text-xs sm:text-sm rounded-md transition-colors",
//                        "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
//                        isSelected && "bg-[#FF8C42] text-white font-semibold",
//                        !isSelected && isCurrentMonth && !isPastDate && "text-gray-900",
//                        !isSelected && !isCurrentMonth && "text-gray-400",
//                        isPastDate && "text-gray-300",
//                        hasSlots && !isSelected && isCurrentMonth && !isPastDate && "border border-green-300 bg-green-50",
//                      )}
//                    >
//                      {format(day, "d")}
//                    </button>
//                 )
//               })}
//             </div>
//           </div>

//           {/* --- Right Column: Time Slots --- */}
//           <div className="p-4 sm:p-6">
//             <p className="text-sm font-semibold text-gray-900 mb-4">
//               {formData.selectedDate ? format(formData.selectedDate, "EEEE, MMM d") : "Select a date"}
//             </p>
//             <div className="flex gap-2 mb-4 ">
//               <div className="flex items-center bg-[#EDF1FD] rounded-[8px] p-1">
//                 <button
//                   type="button"
//                   className={cn(
//                     "px-3 py-1 text-sm font-medium rounded-[6px] transition-colors",
//                     timeFormat === "12h" ? "bg-[#0A1F44] text-white" : "text-gray-700"
//                   )}
//                   onClick={() => setTimeFormat("12h")}
//                 >
//                   12h
//                 </button>
//                 <button
//                   type="button"
//                   className={cn(
//                     "px-3 py-1 text-sm font-medium rounded-[6px] transition-colors",
//                     timeFormat === "24h" ? "bg-[#0A1F44] text-white" : "text-gray-700"
//                   )}
//                   onClick={() => setTimeFormat("24h")}
//                 >
//                   24h
//                 </button>
//               </div>
//             </div>

//              <div className="space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto">
//                {!formData.selectedDate && (
//                  <div className="text-sm text-gray-500 p-2">Please select a date first</div>
//                )}
//                {loadingSlots && (
//                  <div className="text-sm text-gray-500 p-2">Loading available time slots...</div>
//                )}
//                {slotsError && (
//                  <div className="text-sm text-red-500 p-2">
//                    <div>{slotsError}</div>
//                    <button 
//                      onClick={() => formData.selectedDate && fetchAvailableSlots(formData.selectedDate, formData.selectedDate)}
//                      className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
//                    >
//                      Retry
//                    </button>
//                  </div>
//                )}
//                {formData.selectedDate && !loadingSlots && !slotsError && slotsData && (() => {
//                  const selectedDateKey = formatDateKey(formData.selectedDate)
//                  const availableSlots = slotsData[selectedDateKey] || []
                 
//                  if (availableSlots.length === 0) {
//                    return <div className="text-sm text-gray-500 p-2">No available slots for this date.</div>
//                  }
                 
//                  return availableSlots.map((slot) => {
//                    const timeLabel = `${formatSlotTime(slot.start)} - ${formatSlotTime(slot.end)}`
//                    return (
//                      <button
//                        key={slot.start}
//                        type="button"
//                        onClick={() => handleTimeSelect(timeLabel)}
//                        className={cn(
//                          "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-colors text-left",
//                          formData.selectedTime === timeLabel
//                            ? "bg-[#FF8C42] text-white"
//                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-900",
//                        )}
//                      >
//                        {timeLabel}
//                      </button>
//                    )
//                  })
//                })()}
//              </div>
//           </div>
//         </div>
        
//       </div>
      
//       {/* Error Message */}
//       {submitError && (
//         <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-sm text-red-600">{submitError}</p>
//         </div>
//       )}
      
//       <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-gray-200">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onBack}
//             className="px-4 sm:px-6 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-sm sm:text-base"
//             disabled={isSubmitting}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             onClick={handleConfirm}
//             className="px-4 sm:px-6 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white font-medium text-sm sm:text-base"
//             disabled={!selectedEventType || !formData.selectedDate || !formData.selectedTime || isBookingSubmitting}
//           >
//             {isBookingSubmitting ? (
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Submitting...
//               </div>
//             ) : (
//               "Confirm Booking"
//             )}
//           </Button>
//         </div>
//     </>
//   )
// }
