"use client"

import { useState, useEffect } from "react"
import { StepIndicator } from "./step-indicator"
import { PersonalInfoStep } from "./_step-components/personal-info-step"
import { BusinessInfoStep } from "./_step-components/business-info-step"
import { ServiceNeedsStep } from "./_step-components/service-needs-step"
// ScheduleMeetingStep is no longer used — step 4 removed in favor of submitting on step 3
// import { ScheduleMeetingStep } from "./_step-components/schedule-meeting-step"
import { ThankYouScreen } from "./thank-you-modal"
import Image from "next/image"
import { sendContactEmail, formatFormDataToMessage, sendPartialFormData, formatPartialFormDataToMessage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export interface FormData {
  // Personal Info
  fullName: string
  email: string
  countryCode: string
  phone: string
  referralSource: string

  // Business Info
  companyName: string
  businessType: string
  website: string
  hasDoneSEO: string

  // Service Needs
  goals: string[]
  serviceTeam: string

  // Schedule Meeting
  selectedDate: Date | null
  selectedTime: string
}

const steps = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Business Info" },
  { number: 3, label: "Service Needs" },
  // Step 4 (Schedule Meeting) removed — submission now happens after step 3
]

export default function ConsultationBooking() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showThankYou, setShowThankYou] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { toast } = useToast()
  // Track success so we don't send partial if both succeed
  const [contactEmailSent, setContactEmailSent] = useState(false)
  const [bookingCreated, setBookingCreated] = useState(false)
  const [partialSent, setPartialSent] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    countryCode: "+88",
    phone: "",
    referralSource: "",
    companyName: "",
    businessType: "",
    website: "",
    hasDoneSEO: "",
    goals: [],
    serviceTeam: "",
    selectedDate: null,
    selectedTime: "",
  })

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const sendPartialSubmission = async (step: number) => {
    // Only send partial submission if we have at least name and email
    if (!formData.fullName || !formData.email) {
      return
    }

    try {
      const message = formatPartialFormDataToMessage(formData, step)
      
      await sendPartialFormData({
        email: formData.email,
        name: formData.fullName,
        service: "SEO",
        budget: "500 USD",
        currentStep: step.toString(),
        message: message
      })
      setPartialSent(true)
    } catch (error) {
      // Silently fail for partial submissions to not interrupt user experience
      console.log('Partial submission failed:', error)
    }
  }

  const handleNext = () => {
    // If there are further steps (less than the number of steps), advance.
    // Otherwise (we're on the last step now), submit the form.
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last step reached — perform final submission
      handleConfirmBooking()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    const shouldSendPartial = () => {

      if (partialSent) return false

      if (contactEmailSent) return false

      if (!(formData.fullName && formData.email && currentStep < steps.length)) return false
      return true
    }

    const handleBeforeUnload = () => {
      if (shouldSendPartial()) {
        // Fire and forget; navigator.sendBeacon would be ideal but fetch is acceptable
        sendPartialSubmission(currentStep)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && shouldSendPartial()) {
        sendPartialSubmission(currentStep)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentStep, formData.fullName, formData.email, contactEmailSent, bookingCreated, partialSent])

  const handleConfirmBooking = async () => {

    if (isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const message = formatFormDataToMessage(formData)

      await sendContactEmail({
        name: formData.fullName,
        email: formData.email,
        message: message,
        details: formData,
      })
   
      setContactEmailSent(true)
      
      toast({
        title: "Consultation Request Submitted!",
        description: "Thank you for your interest. We'll get back to you soon.",
        duration: 5000,
      })
      
      setShowThankYou(true)
    } catch (error) {
      console.error('Failed to submit form:', error)
      setSubmitError('Failed to submit your consultation request. Please try again.')
      
      // Show error toast
      toast({
        title: "Submission Failed",
        description: "Failed to submit your consultation request. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <Image
            width={150}
            height={150}
            src="/logo.png"
            alt="MD Faruk Khan Logo"
            className="h-8 sm:h-12 w-auto"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 px-2">Schedule Your Free Consultation</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground px-2">
            Let's discuss how we can grow your business together
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-4 sm:mb-6">
          <StepIndicator steps={steps} currentStep={currentStep} showThankYou={showThankYou} />
        </div>

        {/* Step Content */}
        <div className="mt-4 sm:mt-8 lg:mt-12">
          {/* When showThankYou is true we hide the step content and only render the Thank You screen */}
          {!showThankYou && (
            <>
              {currentStep === 1 && (
                <PersonalInfoStep formData={formData} updateFormData={updateFormData} onNext={handleNext} />
              )}
              {currentStep === 2 && (
                <BusinessInfoStep
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <ServiceNeedsStep
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
            </>
          )}

          {showThankYou && <ThankYouScreen />}
        </div>
      </div>
    </div>
  )
}
