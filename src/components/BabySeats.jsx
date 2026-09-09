function BabySeats({
    form,
    onChange,
    babySeatInstruction,
}) {
    

    return (
        <section className="oasis-card oasis-baby-seats mb-[22px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.025)]">
            <div className="mb-2 border-[#eeeeee] px-5 py-5 sm:px-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a762d]">
                    Optional
                </p>

                <h3 className="m-0 text-[19px] font-semibold tracking-[-0.015em] text-[#222]">
                    Child / Baby Seat
                </h3>

                <p className="mt-1 text-[12px] leading-[1.5] text-[#6d6d6d]">
                    Select a seat only if required for your journey.
                </p>
            </div>

            <div className="px-5 pt-5 sm:px-6">
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#444]">
                    Do you require a child/baby seat?
                </label>

                <div className="oasis-choice-toggle grid grid-cols-2 gap-2 rounded-[10px] bg-[#f6f6f4] p-1">
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

            <div className="mx-5 mt-5 mb-3 rounded-[10px] border border-[#eeeeee] bg-[#fafaf8] px-4 py-3 sm:mx-6">
                <p className="m-0 text-[12px] leading-[1.5] text-[#6d6d6d]">
                    {babySeatInstruction}
                </p>
            </div>

            {form.babySeatRequired && (
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">

                    {/* Rear-facing */}
                    <div className="min-w-0 ">
                        <label
                            htmlFor="oasis-rear-facing"
                            className="mb-[7px] block text-[13px] font-semibold text-[#222]"
                        >
                            Baby seat
                            <span className="ml-1 text-[12px] font-normal text-[#777]">
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
                            className="w-full min-h-[50px] rounded-[9px] border border-[#d8d8d8] bg-white px-4 py-[12px] text-[15px] text-[#222] outline-none transition focus:border-[#b58a32] focus:shadow-[0_0_0_2px_rgba(181,138,50,0.10)]"
                        />
                    </div>

                    {/* Forward-facing */}
                    <div className="min-w-0">
                        <label
                            htmlFor="oasis-forward-facing"
                            className="mb-[7px] block text-[13px] font-semibold text-[#222]"
                        >
                            Booster seat
                            <span className="ml-1 text-[12px] font-normal text-[#777]">
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
                            className="w-full min-h-[50px] rounded-[9px] border border-[#d8d8d8] bg-white px-4 py-[12px] text-[15px] text-[#222] outline-none transition focus:border-[#b58a32] focus:shadow-[0_0_0_2px_rgba(181,138,50,0.10)]"
                        />
                    </div>

                </div>
            )}
        </section>
    )
}

export default BabySeats
