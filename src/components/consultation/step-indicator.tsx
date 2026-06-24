import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  showThankYou?: boolean
}

export function StepIndicator({ steps, currentStep, showThankYou }: StepIndicatorProps) {
  return (
    <div className="w-full px-2 sm:px-0">
      <div className="flex items-center justify-center max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center mt-4">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors",
                  currentStep > step.number || (currentStep === step.number && showThankYou)
                    ? "bg-[#FF8C42] text-white"
                    : currentStep === step.number
                      ? "bg-[#FF8C42] text-white"
                      : "bg-gray-200 text-gray-500",
                )}
              >
                {currentStep > step.number || (currentStep === step.number && showThankYou) ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-center sm:whitespace-pre whitespace-normal leading-tight",
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-10 sm:w-16 mx-1 sm:mx-2 transition-colors",
                  currentStep > step.number ? "bg-[#FF8C42]" : "bg-gray-200",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

