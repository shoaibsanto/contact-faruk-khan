'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ThankYouModal } from '@/components/consultation/thank-you-modal'

export default function ContactForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    services: [] as string[],
    primaryGoal: '',
    otherGoal: '',
    websiteUrl: '',
    budgetRange: '',
    howHeard: '',
    privacyAgreement: false,
  })

  const [showThankYou, setShowThankYou] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false)

  const BD_COUNTRY_CODE = '880'
  const MAX_NATIONAL_DIGITS = 10

  const buildE164FromNational = (national: string, countryCode?: string) => {
    if (!national) return ''
    if (countryCode === BD_COUNTRY_CODE || !countryCode) {
      const trimmed = national.slice(0, MAX_NATIONAL_DIGITS)
      return `+${BD_COUNTRY_CODE}${trimmed}`
    }
    return `+${countryCode}${national}`
  }

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  const handlePhoneChange = (value: string | undefined) => {
    if (!value) {
      updateFormData({ phone: '' })
      setErrors((prev) => ({ ...prev, phone: '' }))
      setIsPhoneInvalid(false)
      return
    }

    const digits = value.replace(/\D/g, '')

    if (digits.startsWith(BD_COUNTRY_CODE)) {
      let national = digits.slice(BD_COUNTRY_CODE.length)
      if (national.startsWith('0')) national = national.slice(1)

      if (national.length === 0) {
        updateFormData({ phone: value })
        setErrors((prev) => ({ ...prev, phone: '' }))
        setIsPhoneInvalid(false)
        return
      }

      if (national.length > MAX_NATIONAL_DIGITS) {
        setErrors((prev) => ({
          ...prev,
          phone: `Phone number must be exactly ${MAX_NATIONAL_DIGITS} digits`,
        }))
        setIsPhoneInvalid(true)
        const trimmed = national.slice(0, MAX_NATIONAL_DIGITS)
        const e164Trimmed = buildE164FromNational(trimmed, BD_COUNTRY_CODE)
        updateFormData({ phone: e164Trimmed })
        return
      }

      const e164 = buildE164FromNational(national, BD_COUNTRY_CODE)
      updateFormData({ phone: e164 })
      setErrors((prev) => ({ ...prev, phone: '' }))
      setIsPhoneInvalid(false)
      return
    }

    updateFormData({ phone: value })
    setErrors((prev) => ({ ...prev, phone: '' }))
    setIsPhoneInvalid(false)
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.'
    } else if (isPhoneInvalid) {
      newErrors.phone = `Phone number must be exactly ${MAX_NATIONAL_DIGITS} digits`
    }

    if (formData.services.length === 0) {
      newErrors.services = 'Please select at least one service.'
    }

    if (!formData.primaryGoal) {
      newErrors.primaryGoal = 'Primary Goal is required.'
    } else if (formData.primaryGoal === 'other' && !formData.otherGoal.trim()) {
      newErrors.otherGoal = 'Please specify your goal.'
    }

    if (!formData.budgetRange) {
      newErrors.budgetRange = 'Monthly Budget Range is required.'
    }

    if (!formData.privacyAgreement) {
      newErrors.privacyAgreement = 'You must agree to the Privacy Policy.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {

      const budgetLabelMap: Record<string, string> = {
        '200': ' $200 (20,000 BDT)',
        '300-500': '$300 - $500 (30k-50k BDT)',
        '500-1000': '$500 - $1,000 (60k-1L BDT)',
        '1000-2000': '$1,000 - $2,000 (1L-2L BDT)',
        'not-sure': 'Not sure yet',
      }


      const goalLabelMap: Record<string, string> = {
        'rank-higher-on-google': 'Rank higher on Google',
        'get-more-local-customers-google-maps': 'Get more local customers (Google Maps)',
        'increase-organic-traffic': 'Increase organic traffic',
        'build-brand-authority': 'Build brand authority',
        'improve-conversion-rates': 'Improve conversion rates',
        'build-seo-friendly-website': 'Build a SEO Friendly Website',
        'fix-technical-seo-issues': 'Fix technical SEO issues',
        other: 'Other',
      }

      const displayGoal =
        formData.primaryGoal === 'other'
          ? formData.otherGoal
          : goalLabelMap[formData.primaryGoal] || formData.primaryGoal

      const displayBudget = budgetLabelMap[formData.budgetRange] || formData.budgetRange

      const payload = {
        name: formData.fullName,
        email: formData.email,
        message: `Full Name: ${formData.fullName}\nEmail Address: ${formData.email}\nMobile/WhatsApp: ${formData.phone}\nWhat Services are you Interested In: ${formData.services.join(', ')}\nWhat is your Primary Goal: ${displayGoal}\nWebsite: ${formData.websiteUrl || 'Not provided'}\nMonthly Budget Range: ${displayBudget}\nHow did you hear about us?: ${formData.howHeard || 'Not specified'}`,
      }

      const response = await fetch('https://contact-faruk-khan.vercel.app/api/sendContactEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }


      setShowThankYou(true)

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        services: [],
        primaryGoal: '',
        otherGoal: '',
        websiteUrl: '',
        budgetRange: '',
        howHeard: '',
        privacyAgreement: false,
      })

      setErrors({})
    } catch (error) {
      console.error('Submission error:', error)

      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your consultation request. Please try again.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const images = ['/Img1.png', '/Img (2).png', '/Img (3).png', '/Img (4).png']

  return (
    <section className="w-full py-10 px-4">
      <div className="mx-auto max-w-[1280px] bg-white overflow-hidden">
        <div className="pt-6 w-[141px] h-[91.65px] flex items-center mx-auto justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex items-center gap-2 inter-font mx-auto justify-center text-sm font-medium leading-[20px] text-[#061237] py-2 px-5 mt-7 md:mt-14 md:mb-6 mb-4 bg-[#EDF1FD] w-fit border border-[#BBCAFA] rounded-full">
          <Image
            src="/roket.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-[20px] h-[20px] object-contain"
          />
          Free SEO Consultation
        </div>

        {/* HERO */}
        <div className="pt-6 sm:px-4 px-2 mx-auto">
          <h1 className="text-[22px] text-center sm:text-[26px] md:text-[46px] lg:text-[56px] xl:text-[72px] font-bold text-[#0B1220]">
            Grow Your Online Presence <br />
            with Ethical, <span className="text-colourful"> AI-Powered SEO</span>
          </h1>

          <p className="mt-3 text-base sm:text-xl text-center max-w-[957px] mx-auto text-[#555555] leading-relaxed">
            Whether you need to dominate local searches, rank globally, or appear in AI platforms like
            ChatGPT – I'll create a tailored strategy that gets you there. No outsourcing. No shortcuts.
            Just proven results.
          </p>

          <div className="mt-4 flex md:flex-row flex-col items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {images.map((i) => (
                <img key={i} src={i} className="size-10 rounded-full border-2 border-white" />
              ))}
            </div>
            <p className="text-sm font-medium inter-font text-[#0C1115]">
              <span className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(() => (
                  <svg
                    key={Math.random()}
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="14"
                    viewBox="0 0 15 14"
                    fill="none"
                  >
                    <path
                      d="M7.29448 11.025L3.17615 13.335L4.09781 8.70336L0.632812 5.50669L5.32281 4.94669L7.29448 0.665022L9.26615 4.94669L13.9561 5.50669L10.4911 8.70336L11.4128 13.335L7.29448 11.025Z"
                      fill="#FF8E53"
                    />
                  </svg>
                ))}
              </span>
              Rated 5.0 on Clutch | 10+ Years of SEO Excellence
            </p>
          </div>
        </div>

        <div className="max-w-[894px] mx-auto">
          <div className="mt-6 mx-2 sm:mx-6 rounded-[14px] border border-[#E5EAF1]">
            <div className="bg-colourful rounded-t-[14px] px-1.5 sm:px-0 py-4 sm:py-6 md:py-8">
              <h2 className="text-center inter-font sm:text-2xl text-lg md:text-[30px] font-bold text-white">
                Tell Me About Your Business
              </h2>
              <p className="text-center text-sm inter-font sm:text-base text-white mt-1">
                I’ll create your custom SEO roadmap in 2 hours
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="md:py-8 py-4 inter-font space-y-4 sm:px-5 px-2 md:px-[48px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full sm:h-12 h-9 bg-[#F9FAFB]"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                </div>

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
                    className="w-full sm:h-12 h-9 bg-[#F9FAFB]"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Mobile/WhatsApp <span className="text-red-500">*</span>
                </Label>

                <div
                  className={`rounded-md border ${isPhoneInvalid ? 'border-red-500' : 'border-input'
                    } focus-within:border-primary`}
                >
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter your phone number"
                    defaultCountry="BD"
                    className="phone-input-custom1 sm:!h-12 !h-9 w-full px-3 py-2 rounded-md"
                    international
                    countryCallingCodeEditable={false}
                    displayInitialValueAsLocalNumber={false}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
              </div>

              {/* SERVICES */}
              <div className="space-y-2">
                <Label htmlFor="services" className="text-sm font-medium">
                  What service are you interested in? <span className="text-red-500">*</span>
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'AI-First SEO',
                    'Local SEO (Google Maps Ranking)',
                    'WordPress / Shopify / Wix / Webflow SEO',
                    'Digital PR & Brand Building',
                    'E-commerce SEO',
                    'SEO Training / Consultation',
                    'Website Design + SEO',
                    'Not Sure / Need Recommendation',
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 border sm:h-12 h-9 border-[#E5EAF1] rounded-[10px] px-3 py-2 bg-[#F9FAFB] text-sm cursor-pointer ${errors.services && formData.services.length === 0
                        ? 'border-red-500'
                        : ''
                        }`}
                    >
                      <Checkbox
                        className="border border-[#D1D5DB]"
                        checked={formData.services.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData({
                              services: [...formData.services, item],
                            })
                          } else {
                            updateFormData({
                              services: formData.services.filter((s) => s !== item),
                            })
                          }
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                {errors.services && <p className="text-red-500 text-xs">{errors.services}</p>}
              </div>

              {/* PRIMARY GOAL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  What is your primary goal? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.primaryGoal}
                  onValueChange={(value) => {
                    updateFormData({
                      primaryGoal: value,
                      ...(value !== 'other' ? { otherGoal: '' } : {}),
                    })
                  }}
                >
                  <SelectTrigger
                    className={`input w-full bg-[#F9FAFB] ${errors.primaryGoal ? 'border-red-500' : ''
                      }`}
                  >
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank-higher-on-google">Rank higher on Google</SelectItem>
                    <SelectItem value="get-more-local-customers-google-maps">
                      Get more local customers (Google Maps)
                    </SelectItem>
                    <SelectItem value="increase-organic-traffic">Increase organic traffic</SelectItem>
                    <SelectItem value="build-brand-authority">Build brand authority</SelectItem>
                    <SelectItem value="improve-conversion-rates">Improve conversion rates</SelectItem>
                    <SelectItem value="build-seo-friendly-website">
                      Build a SEO Friendly Website
                    </SelectItem>
                    <SelectItem value="fix-technical-seo-issues">Fix technical SEO issues</SelectItem>
                    <SelectItem value="other">Other </SelectItem>
                  </SelectContent>
                </Select>
                {errors.primaryGoal && <p className="text-red-500 text-xs">{errors.primaryGoal}</p>}
              </div>

              {/* CONDITIONAL INPUT FOR "OTHER" */}
              {formData.primaryGoal === 'other' && (
                <div className="space-y-1">
                  <Label htmlFor="otherGoal" className="text-sm font-medium">
                    Please specify your goal
                  </Label>
                  <Input
                    id="otherGoal"
                    type="text"
                    placeholder="Describe your primary goal..."
                    value={formData.otherGoal}
                    onChange={(e) => updateFormData({ otherGoal: e.target.value })}
                    className="w-full sm:h-12 h-9 bg-[#F9FAFB]"
                  />
                  {errors.otherGoal && <p className="text-red-500 text-xs">{errors.otherGoal}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Website URL (If have)</Label>
                <Input
                  placeholder="https://yourwebsite.com"
                  value={formData.websiteUrl}
                  onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
                  className="w-full sm:h-12 h-9 bg-[#F9FAFB]"
                />
                <p className="text-xs text-[#5B6475] mt-1">Leave blank if you don’t have one yet</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Monthly Budget Range <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={(value) => updateFormData({ budgetRange: value })}
                >
                  <SelectTrigger
                    className={`input bg-[#F9FAFB] w-full ${errors.budgetRange ? 'border-red-500' : ''
                      }`}
                  >
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200"> $200 (20,000 BDT)</SelectItem>
                    <SelectItem value="300-500">$300 - $500 (30k-50k BDT)</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000 (60k-1L BDT)</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000 (1L-2L BDT)</SelectItem>
                    <SelectItem value="not-sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.budgetRange && <p className="text-red-500 text-xs">{errors.budgetRange}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">How did you hear about us? (Optional)</Label>
                <Select
                  value={formData.howHeard}
                  onValueChange={(value) => updateFormData({ howHeard: value })}
                >
                  <SelectTrigger className="input w-full bg-[#F9FAFB]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>

                    <SelectItem value="google-search">Google Search</SelectItem>
                    <SelectItem value="ai-(chatgpt-gemini)">AI (ChatGPT, Gemini) Search</SelectItem>
                    <SelectItem value="social-media(facebook)">Facebook / Social Media</SelectItem>
                    <SelectItem value="youtube-video">YouTube / Video</SelectItem>
                    <SelectItem value="friend-customer-referral">Friend or Customer Referral</SelectItem>
                    <SelectItem value="news-media">News / Media</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="other">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PRIVACY */}
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start text-sm my-auto gap-2 p-5 rounded-[12px] bg-[#F9FAFB] text-[#5B6475]">
                  <Checkbox
                    checked={formData.privacyAgreement}
                    onCheckedChange={(checked) =>
                      updateFormData({ privacyAgreement: checked as boolean })
                    }
                    className="border border-[#D1D5DB]"
                  />
                  <span>
                    I agree to the <b>Privacy Policy</b> and consent to be contacted by Md Faruk Khan
                    regarding my inquiry. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.privacyAgreement && (
                  <p className="text-red-500 text-xs">{errors.privacyAgreement}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer h-[44px] rounded-[10px] bg-[#061237] text-white text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Get My Free Consultation'}
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </div>

        <ThankYouModal isOpen={showThankYou} onOpenChange={setShowThankYou} />

        <div className="py-6  text-center max-w-[807.27px] mx-auto">
          <p className="md:text-2xl text-lg font-semibold text-[#061237] mb-3">Trusted by Brands</p>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 ">

            <div className="flex flex-col h-fit max-w-[145px] items-start p-4 rounded-lg bg-[#F8FAFC]  text-center">
              <Image
                src="/Walton_Group_Logo 1.png"
                alt="Walton Logo"
                width={1000}
                height={1000}
                className="w-[37.66px] h-[19px] object-fill mb-3"
              />
              <p className="text-[#21409A] flex items-center  font-semibold text-[10px]"><span className='flex items-center text-[#00A66F]'>104 % <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2.47266 3.98755L5.00182 1.45838L7.53099 3.98755" stroke="#00A66F" stroke-width="0.9996" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 8.54199V1.52949" stroke="#00A66F" stroke-width="0.9996" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
              </svg></span> Organic Traffic</p>
            </div>

            {/* Card 2: Furniture Rankings */}
            <div className="flex flex-col items-start p-4 h-fit max-w-[145px] rounded-lg bg-[#F8FAFC]  text-center">
              <Image
                src="/855854571c0c65588cdb4d6573073aacc3a12227.png"
                alt="HATIL Logo"
                width={1000}
                height={1000}
                className="w-[44.15px] h-[13.03px] object-fill mb-4"
              />
              <p className="text-[#ED1C24] font-semibold text-[10px]">#1 Furniture Rankings</p>
            </div>

            {/* Card 3: YouTube SEO Success */}
            <div className="flex flex-col items-start h-fit max-w-[145px] p-4 rounded-lg bg-[#F8FAFC]  ">
              <Image
                src="/x9OQKixv9r9WlsdxKXmo3uVWGoZn9GGjrJt0lhf6 1.png"
                alt="Klant Bank Logo"
                width={4000}
                height={4000}
                className="w-[52.64px] h-[21px] object-fill mb-3"
              />
              <p className="text-[#046C37] font-semibold text-[10px]">YouTube SEO Success</p>
            </div>

            {/* Card 4: Complete Digital SEO */}
            <div className="flex flex-col items-start p-4 h-fit max-w-[145px] rounded-lg bg-[#F8FAFC]  text-center">
              <Image
                src="/logo.64e0b262 1.png"
                alt="FAD Logo"
                width={4000}
                height={4000}
                className="w-[48.95px] h-[21px] object-fill mb-3"
              />
              <p className="text-[#F5821F] font-semibold text-[10px]">Complete Digital SEO</p>
            </div>

            {/* Card 5: Brand Authority Building */}
            <div className="flex flex-col items-start max-w-[145px] p-4 rounded-lg bg-[#F8FAFC]  text-start">
              <Image
                src="/logo-mir 1.png"
                alt="MIR Logo"
                width={4000}
                height={4000}
                className="w-[29.44px] h-[21px] object-contain mb-3"
              />
              <p className="text-[#088C46] font-semibold text-[10px]">Brand Authority Building</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}