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
            <div className="oasis-quantity-card rounded-[10px] border border-[#e5e5e5] bg-white p-4">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#444]">
                    {label}
                </div>

                <div className="flex min-h-[50px] items-center justify-between rounded-[9px] border border-[#d8d8d8] bg-white px-2">
                    <button
                        type="button"
                        onClick={decrease}
                        disabled={numericValue <= min}
                        aria-label={`Decrease ${label}`}
                        className="oasis-quantity-button flex h-10 w-10 items-center justify-center rounded-[7px] text-[22px] text-[#333] transition disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        −
                    </button>

                    <span className="min-w-[40px] text-center text-[17px] font-semibold text-[#222]">
                        {numericValue}
                    </span>

                    <button
                        type="button"
                        onClick={increase}
                        aria-label={`Increase ${label}`}
                        className="oasis-quantity-button flex h-10 w-10 items-center justify-center rounded-[7px] text-[22px] text-[#333] transition"
                    >
                        +
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className="oasis-card oasis-passenger-luggage mb-[22px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.025)]">
            <div className="border-none px-5 py-5 sm:px-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a762d]">
                    Travellers
                </p>

                <h3 className="m-0 text-[19px] font-semibold tracking-[-0.015em] text-[#222]">
                    Passenger &amp; Luggage
                </h3>

                <p className="mt-1 text-[12px] leading-[1.5] text-[#6d6d6d]">
                    Tell us how many passengers and bags are travelling.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
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

                <div className="oasis-luggage-guide rounded-[10px] border border-[#e8e8e8] bg-[#fafaf8] px-6 py-5">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777]">
                        Luggage Guide
                    </p>

                    <p className="m-0  text-[12px] leading-[1.55] text-[#666]">
                        {luggageInstruction}
                    </p>
                </div>
            </div>

            <div className="oasis-luggage-total mx-6 mb-5 mt-2 flex items-center justify-between border-none bg-[#fafaf8] px-6 py-3 sm:mx-6 sm:mb-8">
                <span className="text-[12px] font-medium text-[#666]">
                    Total luggage units
                </span>

                <strong className="text-[15px] font-semibold text-[#222]">
                    {luggageUnits}
                </strong>
            </div>
        </section>
    )
}

export default PassengerLuggage
