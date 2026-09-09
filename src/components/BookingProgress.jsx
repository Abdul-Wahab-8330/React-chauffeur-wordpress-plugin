function BookingProgress({ currentStep = 1 }) {
    const steps = [
        { number: 1, label: "Journey" },
        { number: 2, label: "Details" },
        { number: 3, label: "Vehicle" },
        { number: 4, label: "Review" },
    ]

    return (
        <div className="oasis-booking-progress mb-7 w-full">
            {/* Desktop */}
            <div className="oasis-progress-desktop hidden items-center sm:flex">
                {steps.map((step, index) => {
                    const completed = step.number < currentStep
                    const active = step.number === currentStep

                    return (
                        <div
                            key={step.number}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`
                                        flex h-8 w-8 shrink-0 items-center justify-center
                                        rounded-full border text-[11px] font-bold
                                        transition-all duration-300
                                        ${
                                            completed
                                                ? "border-[#222] bg-[#222] text-white"
                                                : active
                                                    ? "border-[#c9a227] bg-[#c9a227] text-[#111] shadow-[0_0_0_4px_rgba(201,162,39,0.12)]"
                                                    : "border-[#d8d8d8] bg-white text-[#999]"
                                        }
                                    `}
                                >
                                    {completed ? "✓" : `0${step.number}`}
                                </div>

                                <span
                                    className={`
                                        text-[12px] font-semibold tracking-[0.01em]
                                        ${
                                            active
                                                ? "text-[#222]"
                                                : completed
                                                    ? "text-[#555]"
                                                    : "text-[#999]"
                                        }
                                    `}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        mx-4 h-px flex-1
                                        transition-colors duration-300
                                        ${
                                            step.number < currentStep
                                                ? "bg-[#222]"
                                                : "bg-[#e5e5e5]"
                                        }
                                    `}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Mobile */}
            <div className="oasis-progress-mobile sm:hidden">
                <div className="mb-2.5 flex items-center justify-between">
                    <div>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999]">
                            Booking
                        </p>

                        <p className="m-0 mt-0.5 text-[14px] font-semibold text-[#222]">
                            0{currentStep} / 04{" "}
                            <span className="font-normal text-[#777]">
                                {steps[currentStep - 1]?.label}
                            </span>
                        </p>
                    </div>

                    <span className="text-[11px] text-[#999]">
                        {Math.round((currentStep / steps.length) * 100)}%
                    </span>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-[#ededed]">
                    <div
                        className="h-full rounded-full bg-[#c9a227] transition-all duration-500"
                        style={{
                            width: `${(currentStep / steps.length) * 100}%`,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default BookingProgress
