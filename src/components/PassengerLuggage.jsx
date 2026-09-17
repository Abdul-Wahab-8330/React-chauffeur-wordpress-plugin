function PassengerLuggage({
    form,
    onChange,
    luggageUnits,
    luggageInstruction,
}) {
    
    const QuantityField = ({
        label,
        value,
        min,
        onChange,
    }) => {
        const numericValue =
            Number(value || min)

        const decrease = () => {
            onChange(
                Math.max(min, numericValue - 1)
            )
        }

        const increase = () => {
            onChange(numericValue + 1)
        }

        return (
            <div className="oasis-quantity-card p-5">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#55554f]">
                    {label}
                </div>

                <div className="flex min-h-[54px] items-center justify-between rounded-[16px] border border-[#e3e2da] bg-white/85 px-2.5">
                    <button
                        type="button"
                        onClick={decrease}
                        disabled={numericValue <= min}
                        aria-label={`Decrease ${label}`}
                        className="oasis-quantity-button h-11 w-11 text-[20px] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        −
                    </button>

                    <span className="min-w-[40px] text-center text-[18px] font-semibold text-[#222]">
                        {numericValue}
                    </span>

                    <button
                        type="button"
                        onClick={increase}
                        aria-label={`Increase ${label}`}
                        className="oasis-quantity-button h-11 w-11 text-[20px]"
                    >
                        +
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className="oasis-card oasis-passenger-luggage mb-[28px] overflow-hidden p-6 sm:p-7">
            <div className="mb-6">
                <p className="oasis-eyebrow">
                    Travellers
                </p>

                <h3 className="oasis-section-title">
                    Passenger &amp; Luggage
                </h3>

                <p className="oasis-section-description">
                    Tell us how many passengers and bags are travelling.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QuantityField
                    label="Passengers"
                    value={form.passengers}
                    min={1}
                    onChange={(value) =>
                        onChange("passengers", value)
                    }
                />

                <QuantityField
                    label="Check-in Suitcases"
                    value={form.suitcases}
                    min={0}
                    onChange={(value) =>
                        onChange("suitcases", value)
                    }
                />

                <QuantityField
                    label="Small / Carry-on Bags"
                    value={form.smallBags}
                    min={0}
                    onChange={(value) =>
                        onChange("smallBags", value)
                    }
                />

                <div className="oasis-luggage-guide px-6 py-5">
                    <p className="oasis-eyebrow mb-2 text-[10px] text-[#8a7a4a]">
                        Luggage Guide
                    </p>

                    <p className="m-0 text-[12px] leading-[1.6] text-[#77776f]">
                        {luggageInstruction}
                    </p>
                </div>
            </div>

            <div className="oasis-luggage-total mx-7 mb-7 mt-2 flex items-center justify-between px-6 py-3.5">
                <span className="text-[12px] font-medium text-[#77776f]">
                    Total luggage units
                </span>

                <strong className="text-[16px] font-semibold text-[#222]">
                    {luggageUnits}
                </strong>
            </div>
        </section>
    )
}

export default PassengerLuggage
