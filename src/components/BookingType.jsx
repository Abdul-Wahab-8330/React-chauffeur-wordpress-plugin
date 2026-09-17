function BookingType({ bookingType, onChange }) {
    const options = [
        {
            value: "point-to-point",
            title: "Point-to-Point",
            description: "A private transfer between two locations.",
        },
        {
            value: "hourly",
            title: "Hourly / As Directed",
            description: "Keep your chauffeur available for multiple stops.",
        },
    ]

    return (
        <section className="oasis-service-section mb-8">
            <div className="mb-5">
                <p className="oasis-eyebrow">
                    Service
                </p>

                <h2 className="oasis-section-title">
                    How can we help?
                </h2>
            </div>

            <div className="oasis-service-toggle grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {options.map((option) => {
                    const selected = bookingType === option.value

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            aria-pressed={selected}
                            className={`oasis-service-option ${
                                selected ? "is-selected" : ""
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <span
                                    className={`
                                        mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center
                                        justify-center rounded-full border-2
                                        transition-all duration-200
                                        ${
                                            selected
                                                ? "border-[#332a0c] bg-[#332a0c]"
                                                : "border-[#b9b9b3] bg-white/85"
                                        }
                                    `}
                                >
                                    {selected && (
                                        <span className="h-[8px] w-[8px] rounded-full bg-[#f7e8bd]" />
                                    )}
                                </span>

                                <span className="min-w-0">
                                    <span
                                        className={`block text-[15px] font-semibold transition-colors duration-200 ${
                                            selected
                                                ? "text-[#221c08]"
                                                : "text-[#222]"
                                        }`}
                                    >
                                        {option.title}
                                    </span>

                                    <span
                                        className={`mt-1 block text-[13px] leading-[1.5] transition-colors duration-200 ${
                                            selected
                                                ? "text-[#4a3d14]"
                                                : "text-[#6f6f6b]"
                                        }`}
                                    >
                                        {option.description}
                                    </span>
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

export default BookingType
