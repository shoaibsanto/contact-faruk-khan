"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight } from "lucide-react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import type { FormData } from "../consultation-booking"

interface PersonalInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
}

export function PersonalInfoStep({ formData, updateFormData, onNext }: PersonalInfoStepProps) {
  const [error, setError] = useState("")
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [referralError, setReferralError] = useState("")

  const BD_COUNTRY_CODE = "880" // Bangladesh calling code without '+'
  const MAX_NATIONAL_DIGITS = 10

  const getNationalDigits = (value?: string) => {
    if (!value) return ""
    const digits = value.replace(/\D/g, "")
    if (digits.startsWith(BD_COUNTRY_CODE)) {
      let national = digits.slice(BD_COUNTRY_CODE.length)
      if (national.startsWith("0")) national = national.slice(1)
      return national
    }
    return digits
  }

  const buildE164FromNational = (national: string, countryCode?: string) => {
    if (!national) return ""
    if (countryCode === BD_COUNTRY_CODE || !countryCode) {
      const trimmed = national.slice(0, MAX_NATIONAL_DIGITS)
      return `+${BD_COUNTRY_CODE}${trimmed}`
    }
    return `+${countryCode}${national}`
  }

  const handlePhoneChange = (value: string | undefined) => {
    if (!value) {
      updateFormData({ phone: "" })
      setError("")
      return
    }

    const digits = value.replace(/\D/g, "")

    if (digits.startsWith(BD_COUNTRY_CODE)) {
      let national = digits.slice(BD_COUNTRY_CODE.length)
      if (national.startsWith("0")) national = national.slice(1)

      if (national.length === 0) {
        updateFormData({ phone: value })
        setError("")
        return
      }

      // ✅ Show error ONLY if user types more than 10 digits
      if (national.length > MAX_NATIONAL_DIGITS) {
        setError(`Phone number must be exactly ${MAX_NATIONAL_DIGITS} digits`)
        const trimmed = national.slice(0, MAX_NATIONAL_DIGITS)
        const e164Trimmed = buildE164FromNational(trimmed, BD_COUNTRY_CODE)
        updateFormData({ phone: e164Trimmed })
        return
      }

      // No error if digits ≤ 10
      const e164 = buildE164FromNational(national, BD_COUNTRY_CODE)
      updateFormData({ phone: e164 })
      setError("")
      return
    }

    // Non-BD numbers
    updateFormData({ phone: value })
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setNameError("")
    setEmailError("")
    setReferralError("")

    const national = getNationalDigits(formData.phone)

    if (!formData.fullName || formData.fullName.trim().length === 0) {
      setNameError("Full name is required")
    }

    const emailValue = formData.email || ""
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailValue || !emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address")
    }

    if (!formData.referralSource) {
      setReferralError("Please select how you heard about us")
    }

    if (!national) {
      setError("Phone number is required")
      return
    }
    if (national.length !== MAX_NATIONAL_DIGITS) {
      setError(`Phone number must be exactly ${MAX_NATIONAL_DIGITS} digits`)
      return
    }

    if (nameError || emailError || referralError) {
      return
    }

    setError("")
    onNext()
  }

  const isPhoneInvalid = !!error

  return (
    <div className="max-w-[768px] mx-auto bg-white rounded-lg border border-border p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className="w-full sm:h-12 h-9"
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="w-full sm:h-12 h-9"
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        {/* Mobile/WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Mobile/WhatsApp <span className="text-red-500">*</span>
          </Label>

          <div
            className={`rounded-md border ${
              isPhoneInvalid ? "border-red-500" : "border-input"
            } focus-within:border-primary`}
          >
            <PhoneInput
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Enter your phone number"
              defaultCountry="BD"
              className="phone-input-custom sm:!h-12 !h-9 w-full px-3 py-2 rounded-md"
              international
              countryCallingCodeEditable={false}
              displayInitialValueAsLocalNumber={false}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Enter exactly {MAX_NATIONAL_DIGITS} digits (without country code).
          </p>
        </div>

        {/* Where did you hear about us? */}
        <div className="space-y-2 w-full">
          <Label htmlFor="referralSource" className="text-sm font-medium">
            Where did you hear about us? <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.referralSource}
            onValueChange={(value) => {
              updateFormData({ referralSource: value })
              setReferralError("")
            }}
          >
            <SelectTrigger id="referralSource" className="w-full h-12">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Search</SelectItem>
              <SelectItem value="ai">AI (ChatGPT, Gemini) Search</SelectItem>
              <SelectItem value="social">Facebook / Social Media</SelectItem>
              <SelectItem value="youtube">YouTube / Video</SelectItem>
              <SelectItem value="friend">Friend or Customer Referral</SelectItem>
              <SelectItem value="news">News / Media</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
              <SelectItem value="other">Others</SelectItem>
            </SelectContent>
          </Select>
          {referralError && <p className="text-red-500 text-sm">{referralError}</p>}
        </div>

        {/* Continue Button */}
        <Button
          type="submit"
          className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white h-10 sm:h-12 text-sm sm:text-base font-medium"
        >
          Continue to Next Step
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </form>
    </div>
  )
}
