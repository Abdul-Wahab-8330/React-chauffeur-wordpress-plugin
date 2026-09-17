function SpecialInstructions({
    value,
    onChange,
    maximumCharacters = 500,
}) {
    return (
        <section className="oasis-card oasis-special-instructions mb-[28px] overflow-hidden p-6 sm:p-7">
            <div className="mb-6">
                <p className="oasis-eyebrow">
                    Optional
                </p>

                <h3 className="oasis-section-title">
                    Special Instructions
                </h3>

                <p className="oasis-section-description">
                    Anything our chauffeur should know before the journey.
                </p>
            </div>

            <div>
                <textarea
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    maxLength={maximumCharacters}
                    placeholder="Add any special instructions..."
                    rows={5}
                    className="oasis-field resize-y"
                />

                <div className="mt-2.5 flex justify-end text-[12px] font-medium text-[#9b9b93]">
                    {value.length} / {maximumCharacters}
                </div>
            </div>
        </section>
    )
}

export default SpecialInstructions
