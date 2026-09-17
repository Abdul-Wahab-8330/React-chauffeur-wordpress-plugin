function BabySeats({
    form,
    onChange,
    babySeatInstruction,
}) {
    

    return (
        <section className="oasis-card oasis-baby-seats mb-[28px] overflow-hidden p-6 sm:p-7">
            <div className="mb-6">
                <p className="oasis-eyebrow">
                    Optional
                </p>

                <h3 className="oasis-section-title">
                    Child / Baby Seat
                </h3>

                <p className="oasis-section-description">
                    Select a seat only if required for your journey.
                </p>
            </div>

            <div>
                <label className="oasis-label">
                    Do you require a child/baby seat?
                </label>

                <div className="oasis-choice-toggle grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                "babySeatRequired",
                                true
                            )
                        }
                        className={`min-h-[48px] rounded-[8px] text-[14px] font-semibold transition ${form.babySeatRequired
                            ? "bg-white text-[#222] shadow-[0_1px_5px_rgba(0,0,0,0.08)]"
                            : "text-[#666] hover:text-[#222]"
                            }`}
                    >
                        Yes
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                "babySeatRequired",
                                false
                            )
                        }
                        className={`min-h-[48px] rounded-[8px] text-[14px] font-semibold transition ${!form.babySeatRequired
                            ? "bg-white text-[#222] shadow-[0_1px_5px_rgba(0,0,0,0.08)]"
                            : "text-[#666] hover:text-[#222]"
                            }`}
                    >
                        No
                    </button>
                </div>
            </div>

            <div className="oasis-baby-instruction mx-7 mt-6 mb-4 rounded-[14px] border border-[#e9e6da] bg-white/60 px-5 py-3.5">
                <p className="m-0 text-[12px] leading-[1.55] text-[#77776f]">
                    {babySeatInstruction}
                </p>
            </div>

            {form.babySeatRequired && (
                <div className="grid grid-cols-1 gap-4 px-7 pb-7 sm:grid-cols-2">

                    {/* Rear-facing */}
                    <div className="min-w-0 ">
                        <label
                            htmlFor="oasis-rear-facing"
                            className="oasis-label"
                        >
                            Baby seat
                            <span className="ml-1 text-[12px] font-normal text-[#77776f]">
                                ($25 each)
                            </span>
                        </label>

                        <input
                            type="number"
                            id="oasis-rear-facing"
                            min="0"
                            value={form.rearFacing}
                            onChange={(e) =>
                                onChange(
                                    "rearFacing",
                                    e.target.value
                                )
                            }
                            className="oasis-field"
                        />
                    </div>

                    {/* Forward-facing */}
                    <div className="min-w-0">
                        <label
                            htmlFor="oasis-forward-facing"
                            className="oasis-label"
                        >
                            Booster seat
                            <span className="ml-1 text-[12px] font-normal text-[#77776f]">
                                ($11 each)
                            </span>
                        </label>

                        <input
                            type="number"
                            id="oasis-forward-facing"
                            min="0"
                            value={form.forwardFacing}
                            onChange={(e) =>
                                onChange(
                                    "forwardFacing",
                                    e.target.value
                                )
                            }
                            className="oasis-field"
                        />
                    </div>

                </div>
            )}
        </section>
    )
}

export default BabySeats
