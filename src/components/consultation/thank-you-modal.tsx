"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface ThankYouModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ThankYouModal({ isOpen, onOpenChange }: ThankYouModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[768px] p-0 overflow-hidden border-none bg-transparent shadow-none" showCloseButton={false}>
        <div className="bg-white rounded-[16px] border border-gray-200 p-4 sm:p-6 shadow-2xl">
          {/* Thank You Content */}
          <div className="text-center rounded-[24px] bg-[#f4f3fe] pb-6 ">
            <div className="flex justify-center p-6 md:p-10">
              <div className="w-20 h-20 sm:w-24 sm:h-20 bg-orange-100 p-4 rounded-[40px] flex items-center justify-center">
                <Image
                  src={'/calendar.png'}
                  alt="calendar"
                  height={80}
                  width={80}
                  className="w-16 object-fill sm:w-20 h-16 sm:h-16 "
                />
              </div>
            </div>
            <h2 className="text-3xl sm:text-[40px] font-bold  text-[#061237]">Thank You!</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-4 px-4 md:px-0">
              Your information has been submitted successfully.
              <br />
              Your meeting is confirmed! Check your email for the invitation.
            </p>

            {/* Buttons */}
            <div className="flex sm:flex-row flex-col px-4 md:px-0 justify-center gap-4 mb-4 mt-4 ">
              <a href="https://www.mdfarukkhan.com/" target="_self" rel="noopener">
                <Button className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md">
                  Go to Home
                </Button>
              </a>
              <a href="https://www.mdfarukkhan.com/services/" target="_self" rel="noopener">
                <Button className="px-6 py-2 bg-white border border-gray-900 hover:bg-gray-50 text-gray-900 rounded-md">
                  Explore our Services
                </Button>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ThankYouScreen() {
  return (
    <div className="max-w-[768px] mx-auto bg-white rounded-[16px] border border-gray-200 p-4 sm:p-6">
      {/* Thank You Content */}
      <div className="text-center rounded-[24px] bg-[#f4f3fe] pb-6 ">
        <div className="flex justify-center p-6 md:p-10">
          <div className="w-20 h-20 sm:w-24 sm:h-20 bg-orange-100 p-4 rounded-[40px] flex items-center justify-center">
            <Image
              src={'/calendar.png'}
              alt="calendar"
              height={4000}
              width={4000}
              className="w-16 object-fill sm:w-20 h-16 sm:h-16 "
            />
          </div>
        </div>
        <h2 className="text-3xl sm:text-[40px] font-bold  text-[#061237]">Thank You!</h2>
        <p className="text-sm text-gray-600 leading-relaxed mt-4 px-4 md:px-0">
          Your information has been submitted successfully.
          <br />
          Your meeting is confirmed! Check your email for the invitation.
        </p>

        {/* Buttons */}
        <div className="flex sm:flex-row flex-col px-4 md:px-0 justify-center gap-4 mb-4 mt-4 ">
          <a href="https://www.mdfarukkhan.com/" target="_self" rel="noopener">
            <Button className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md">
              Go to Home
            </Button>
          </a>
          <a href="https://www.mdfarukkhan.com/services/" target="_self" rel="noopener">
            <Button className="px-6 py-2 bg-white border border-gray-900 hover:bg-gray-50 text-gray-900 rounded-md">
              Explore our Services
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
