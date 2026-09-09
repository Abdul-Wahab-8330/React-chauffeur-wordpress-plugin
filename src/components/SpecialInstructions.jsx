function SpecialInstructions({
    value,
    onChange,
    maximumCharacters = 500,
}) {
    return (
        <section className="oasis-card oasis-special-instructions mb-[22px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.025)]">
            <div className="border-b border-[#eeeeee] px-5 py-5 sm:px-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a762d]">
                    Optional
                </p>

                <h3 className="m-0 text-[19px] font-semibold tracking-[-0.015em] text-[#222]">
                    Special Instructions
                </h3>

                <p className="mt-1 text-[12px] leading-[1.5] text-[#6d6d6d]">
                    Anything our chauffeur should know before the journey.
                </p>
            </div>

            <div className="p-5 sm:p-6">
                <textarea
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    maxLength={maximumCharacters}
                    placeholder="Add any special instructions..."
                    rows={4}
                    className="
            min-h-[120px]
            w-full
            resize-y
            rounded-[10px]
            border border-[#d8d8d8]
            bg-white
            px-4 py-3
            text-[15px]
            leading-[1.6]
            text-[#222]
            outline-none
            transition
            placeholder:text-[#999]
            focus:border-[#b58a32]
            focus:shadow-[0_0_0_2px_rgba(181,138,50,0.10)]
        "
                />

                <div className="mt-2 flex justify-end text-[12px] text-[#777]">
                    {value.length} / {maximumCharacters}
                </div>
            </div>
        </section>
    )
}

export default SpecialInstructions
