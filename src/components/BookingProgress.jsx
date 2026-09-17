function BookingProgress({ currentStep = 1 }) {
    const steps = [
        { number: 1, label: "Journey" },
        { number: 2, label: "Details" },
        { number: 3, label: "Vehicle" },
        { number: 4, label: "Review" },
    ]

    return (
        <div className="oasis-booking-progress mb-8 w-full">
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
                            <div className="flex items-center gap-3">
                                <div
                                    className={`
                                        flex h-10 w-10 shrink-0 items-center justify-center
                                        rounded-full border text-[11px] font-bold tracking-[0.04em]
                                        transition-all duration-300
                                        ${
                                            completed
                                                ? "border-[#1e1e1c] bg-[#1e1e1c] text-[#f3e5c0] shadow-[0_6px_16px_rgba(20,20,18,0.18)]"
                                                : active
                                                    ? "border-[#b8912e] bg-gradient-to-br from-[#e6c763] to-[#c9a227] text-[#221c08] shadow-[0_8px_20px_rgba(201,162,39,0.35)] ring-4 ring-[#c9a227]/15"
                                                    : "border-[#ddddd7] bg-white/80 text-[#9b9b93]"
                                        }
                                    `}
                                >
                                    {completed ? "✓" : `0${step.number}`}
                                </div>

                                <span
                                    className={`
                                        text-[13px] font-semibold tracking-[0.01em]
                                        ${
                                            active
                                                ? "text-[#222]"
                                                : completed
                                                    ? "text-[#55554f]"
                                                    : "text-[#9b9b93]"
                                        }
                                    `}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        mx-4 h-[2px] flex-1 rounded-full
                                        transition-colors duration-300
                                        ${
                                            step.number < currentStep
                                                ? "bg-gradient-to-r from-[#c9a227]/80 to-[#c9a227]/50"
                                                : "bg-[#e8e8e2]"
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
                <div className="rounded-[18px] border border-white/70 bg-white/60 px-4 py-3 shadow-[0_4px_18px_rgba(24,24,20,0.05)] backdrop-blur-md">
                    <div className="mb-2.5 flex items-center justify-between">
                        <div>
                            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a07c18]">
                                Booking
                            </p>

                            <p className="m-0 mt-0.5 text-[14px] font-semibold text-[#222]">
                                0{currentStep} / 04{" "}
                                <span className="font-normal text-[#77776f]">
                                    {steps[currentStep - 1]?.label}
                                </span>
                            </p>
                        </div>

                        <span className="text-[11px] font-semibold text-[#9b9b93]">
                            {Math.round((currentStep / steps.length) * 100)}%
                        </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e8e2]">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#e6c763] to-[#c9a227] shadow-[0_1px_6px_rgba(201,162,39,0.4)] transition-all duration-500"
                            style={{
                                width: `${(currentStep / steps.length) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingProgress
