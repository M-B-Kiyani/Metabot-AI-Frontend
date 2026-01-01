import React, { useState } from "react";
import { BookingDetails, TimeSlot } from "../types";
import TimeSlotPicker from "./TimeSlotPicker";
import { createBooking, ApiError } from "../services/bookingApiService";

interface WidgetBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: BookingDetails) => void;
}

const WidgetBookingModal: React.FC<WidgetBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [details, setDetails] = useState<Omit<BookingDetails, "timeSlot">>({
    name: "",
    company: "",
    email: "",
    phone: "",
    inquiry: "",
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimeSlot) {
      setError("Please select a time slot.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData: BookingDetails = {
        ...details,
        timeSlot: selectedTimeSlot,
      };

      // Call the backend API to create the booking
      const createdBooking = await createBooking(bookingData);

      console.log("Booking created successfully:", createdBooking);

      // Call the parent onSubmit handler to update the chat
      onSubmit(bookingData);

      // Reset form
      setDetails({ name: "", company: "", email: "", phone: "", inquiry: "" });
      setSelectedTimeSlot(null);
      setError(null);
    } catch (err) {
      console.error("Error creating booking:", err);

      if (err instanceof ApiError) {
        // Handle specific API errors
        if (err.errorCode === "VALIDATION_ERROR") {
          setError(`Validation error: ${err.message}`);
        } else if (err.errorCode === "CONFLICT") {
          setError(
            "This time slot is no longer available. Please select another time."
          );
        } else if (err.errorCode === "NETWORK_ERROR") {
          setError(
            "Unable to connect to the booking service. Please check your internet connection."
          );
        } else {
          setError(`Booking failed: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-2 overflow-y-auto">
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full max-w-md my-4 flex flex-col border border-white/20 animate-slide-up">
        {/* Header */}
        <div className="flex-shrink-0 p-4 bg-gradient-to-r from-white/5 to-transparent border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Book Consultation
              </h2>
              <p className="text-white/70 text-xs mt-1">
                Schedule your meeting
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
              disabled={isSubmitting}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-grow">
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Personal Info
              </h3>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-white/80 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={details.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-xs font-medium text-white/80 mb-1"
                  >
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={details.company}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    placeholder="Company name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-white/80 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={details.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-medium text-white/80 mb-1"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={details.phone}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-2 h-2 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                Project Details
              </h3>

              <div>
                <label
                  htmlFor="inquiry"
                  className="block text-xs font-medium text-white/80 mb-1"
                >
                  Tell us about your project
                </label>
                <textarea
                  id="inquiry"
                  name="inquiry"
                  value={details.inquiry}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Describe your project..."
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-2 h-2 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                Select Time
              </h3>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <TimeSlotPicker
                  onSelectSlot={setSelectedTimeSlot}
                  selectedSlot={selectedTimeSlot}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-3 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-red-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/20 bg-gradient-to-r from-transparent to-white/5 flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 font-medium border border-white/20 text-xs"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl transition-all duration-200 font-medium disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg text-xs"
            disabled={
              !selectedTimeSlot ||
              !details.name ||
              !details.email ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Booking...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Book Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WidgetBookingModal;
