// function BookingType({ value, onChange, labels }) {
//     return (
//         <section className="mb-[22px] rounded-[8px] border border-[#e5e5e5] bg-white p-6">
//             <div className="mb-[18px]">
//                 <h3 className="m-0 mb-[5px] text-[19px] font-semibold text-[#222]">
//                     {labels.bookingType}
//                 </h3>
//             </div>

//             <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

//                 {/* Point-to-Point */}
//                 <label className="block cursor-pointer">
//                     <input
//                         type="radio"
//                         name="booking_type"
//                         value="point-to-point"
//                         checked={value === "point-to-point"}
//                         onChange={(event) =>
//                             onChange(event.target.value)
//                         }
//                         className="sr-only"
//                     />

//                     <span
//                         className={`
//                             block min-h-[70px] rounded-[6px]
//                             border bg-white p-[15px]
//                             ${
//                                 value === "point-to-point"
//                                     ? "border-[#b58a32] shadow-[0_0_0_1px_#b58a32]"
//                                     : "border-[#ddd]"
//                             }
//                         `}
//                     >
//                         <span className="block">
//                             <strong className="block text-[15px] font-semibold text-[#222]">
//                                 {labels.pointToPoint}
//                             </strong>

//                             <small className="mt-1 block text-[12px] text-[#777]">
//                                 Direct journey from pickup to destination.
//                             </small>
//                         </span>
//                     </span>
//                 </label>

//                 {/* Hourly */}
//                 <label className="block cursor-pointer">
//                     <input
//                         type="radio"
//                         name="booking_type"
//                         value="hourly"
//                         checked={value === "hourly"}
//                         onChange={(event) =>
//                             onChange(event.target.value)
//                         }
//                         className="sr-only"
//                     />

//                     <span
//                         className={`
//                             block min-h-[70px] rounded-[6px]
//                             border bg-white p-[15px]
//                             ${
//                                 value === "hourly"
//                                     ? "border-[#b58a32] shadow-[0_0_0_1px_#b58a32]"
//                                     : "border-[#ddd]"
//                             }
//                         `}
//                     >
//                         <span className="block">
//                             <strong className="block text-[15px] font-semibold text-[#222]">
//                                 {labels.hourly}
//                             </strong>

//                             <small className="mt-1 block text-[12px] text-[#777]">
//                                 Chauffeur available for your selected hours.
//                             </small>
//                         </span>
//                     </span>
//                 </label>

//             </div>
//         </section>
//     )
// }

// export default BookingType













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
        <section className="oasis-service-section mb-7">
            <div className="mb-4">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a6a24]">
                    Service
                </p>

                <h2 className="m-0 mt-1 text-[23px] font-semibold tracking-[-0.025em] text-[#222]">
                    How can we help?
                </h2>
            </div>

            <div className="oasis-service-toggle">
                {options.map((option) => {
                    const selected = bookingType === option.value

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`oasis-service-option ${
                                selected ? "is-selected" : ""
                            }`}
                        >
                            <div className="flex items-start gap-3.5">
                                <span
                                    className={`
                                        mt-0.5 flex h-[21px] w-[21px] shrink-0 items-center
                                        justify-center rounded-full border-2
                                        transition-all duration-200
                                        ${
                                            selected
                                                ? "border-[#222] bg-[#222]"
                                                : "border-[#c8c8c5] bg-white"
                                        }
                                    `}
                                >
                                    {selected && (
                                        <span className="h-[7px] w-[7px] rounded-full bg-white" />
                                    )}
                                </span>

                                    <span className="min-w-0">
                                    <span className="block text-[15px] font-semibold text-[#222]">
                                        {option.title}
                                    </span>

                                    <span className="mt-1 block text-[13px] leading-[1.5] text-[#6f6f6b]">
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
