"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormData } from "../consultation-booking"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface BusinessInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function BusinessInfoStep({ formData, updateFormData, onNext, onBack }: BusinessInfoStepProps) {
  const [businessTypeError, setBusinessTypeError] = useState("")
  const [hasDoneSEOError, setHasDoneSEOError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusinessTypeError("")
    setHasDoneSEOError("")

    let hasError = false

    if (!formData.businessType) {
      setBusinessTypeError("Please select your business type/industry")
      hasError = true
    }

    if (!formData.hasDoneSEO) {
      setHasDoneSEOError("Please select an option")
      hasError = true
    }

    if (hasError) {
      return
    }

    onNext()
  }

  return (
    <div className="max-w-[768px] mx-auto bg-white rounded-lg  border border-border p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium">
            Company Name
          </Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Enter your company name"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            className="w-full sm:h-12 h-9"
          />
        </div>

        {/* Business Type/Industry */}
        <div className="space-y-2 w-full">
          <Label htmlFor="businessType" className="text-sm font-medium">
            Business Type/Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => {
              updateFormData({ businessType: value })
              setBusinessTypeError("")
            }}
          >
            <SelectTrigger id="businessType" className="w-full">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="local">Local Business</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {businessTypeError && <p className="text-red-500 text-sm">{businessTypeError}</p>}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            Website (if you have one)
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="example.com"
            value={formData.website}
            onChange={(e) => {
              let value = e.target.value
              // Auto-add https:// if user doesn't include protocol
              if (value && !value.match(/^https?:\/\//i)) {
                value = `https://${value}`
              }
              updateFormData({ website: value })
            }}
            onBlur={(e) => {
              let value = e.target.value
              // Auto-add https:// on blur if user doesn't include protocol
              if (value && !value.match(/^https?:\/\//i)) {
                value = `https://${value}`
                updateFormData({ website: value })
              }
            }}
            className="w-full sm:h-12 h-9"
          />
        </div>

        {/* Have you done SEO before? */}
        <div className="space-y-2 w-full">
          <Label htmlFor="hasDoneSEO" className="text-sm font-medium">
            Have you done SEO before? <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.hasDoneSEO} onValueChange={(value) => {
            updateFormData({ hasDoneSEO: value })
            setHasDoneSEOError("")
          }}>
            <SelectTrigger id="hasDoneSEO" className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="not-sure">Not Sure</SelectItem>
            </SelectContent>
          </Select>
          {hasDoneSEOError && <p className="text-red-500 text-sm">{hasDoneSEOError}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto px-4 sm:px-6 h-10 sm:h-12 text-sm sm:text-base font-medium bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Back
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto px-4 sm:px-6 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white h-10 sm:h-12 text-sm sm:text-base font-medium"
          >
            Continue to Next Step
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
