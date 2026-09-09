function QuoteSummary({
    quote,
    currency = "$",
    labels,
    onProceedToCheckout,
    isCreatingBooking = false,
}) {
    if (!quote) {
        return null
    }

    const money = (value) =>
        `${currency}${Number(value || 0).toFixed(2)}`

    return (
        <section className="oasis-card oasis-quote-summary mt-6 rounded-[16px] border border-[#dedede] bg-white p-[26px]">
            <div>
                <h3 className="mt-1 mb-1 text-[21px] font-semibold text-[#222]">
                    {labels.summary}
                </h3>

                <p className="m-0 text-[13px] text-[#666]">
                    Your estimated booking quote.
                </p>
            </div>

            {/* Outbound */}
            {quote.outbound && (
                <div className="mt-[18px] border-t border-[#eee] pt-3 pb-5">
                    <h4 className="m-0 mb-1 font-semibold text-[#222]">
                        Outbound Journey
                    </h4>

                    <QuoteRows
                        quote={quote.outbound}
                        currency={currency}
                        labels={labels}
                    />
                </div>
            )}

            {/* Inbound / Return */}
            {quote.inbound && (
                <div className="mt-[18px] border-t border-[#eee] pt-3">
                    <h4 className="m-0 mb-1 font-semibold text-[#222]">
                        Return Journey
                    </h4>

                    <QuoteRows
                        quote={quote.inbound}
                        currency={currency}
                        labels={labels}
                    />
                </div>
            )}

            {/* Single journey */}
            {!quote.outbound && (
                <div className="mt-[18px] border-t border-[#eee] pt-3">
                    <QuoteRows
                        quote={quote}
                        currency={currency}
                        labels={labels}
                    />
                </div>
            )}

            {/* Booking-level child seat charges */}
            {quote.outbound && (
                <>
                    {Number(quote.babySeats || 0) > 0 && (
                        <div className="mt-[18px] flex justify-between gap-5 border-t border-[#eee] pt-3">
                            <span className="text-[#666]">
                                Baby Seats{" "}
                                <span className="text-[12px] font-normal text-[#777]">
                                    {quote.babySeats} ($25 each)
                                </span>
                            </span>

                            <strong>
                                {money(quote.babySeatCharge)}
                            </strong>
                        </div>
                    )}

                    {Number(quote.boosterSeats || 0) > 0 && (
                        <div className="flex justify-between gap-5 py-[9px]">
                            <span className="text-[#666]">
                                Booster Seats{" "}
                                <span className="text-[12px] font-normal text-[#777]">
                                    {quote.boosterSeats} ($11 each)
                                </span>
                            </span>

                            <strong>
                                {money(quote.boosterSeatCharge)}
                            </strong>
                        </div>
                    )}
                </>
            )}

            {/* Total */}
            <div className="mt-4 flex items-center justify-between gap-5 border-t-2 border-[#222] pt-5 text-[20px]">
                <span className="font-semibold">
                    {labels.total}
                </span>

                <strong>
                    {money(quote.total)}
                </strong>
            </div>

            <button
                type="button"
                onClick={onProceedToCheckout}
                disabled={isCreatingBooking}
                className="oasis-primary-button mt-5 w-full min-h-[52px] rounded-[10px] px-5 py-4 font-semibold transition disabled:cursor-wait disabled:opacity-70"
            >
                {isCreatingBooking
                    ? "Preparing checkout..."
                    : labels.proceedCheckout}
            </button>
        </section>
    )
}


function QuoteRows({
    quote,
    currency,
    labels,
}) {
    const money = (value) =>
        `${currency}${Number(value || 0).toFixed(2)}`

    return (
        <div>
            <div className="flex justify-between gap-5 py-[9px]">
                <span className="text-[#666]">
                    {labels.distance}
                </span>

                <strong>
                    {Number(quote.distance || 0).toFixed(1)} km
                </strong>
            </div>

            <div className="flex justify-between gap-5 py-[9px]">
                <span className="text-[#666]">
                    {labels.baseFare}
                </span>

                <strong>
                    {money(quote.baseFare)}
                </strong>
            </div>

            {quote.distanceFare !== undefined && (
                <div className="flex justify-between gap-5 py-[9px]">
                    <span className="text-[#666]">
                        {labels.distanceFare}
                    </span>

                    <strong>
                        {money(quote.distanceFare)}
                    </strong>
                </div>
            )}

            {quote.hourlyFare !== undefined && (
                <div className="flex justify-between gap-5 py-[9px]">
                    <span className="text-[#666]">
                        Hourly Fare
                    </span>

                    <strong>
                        {money(quote.hourlyFare)}
                    </strong>
                </div>
            )}

            <div className="flex justify-between gap-5 py-[9px]">
                <span className="text-[#666]">
                    {labels.levy}
                </span>

                <strong>
                    {money(quote.levy)}
                </strong>
            </div>

            {Number(quote.parking || 0) > 0 && (
                <div className="flex justify-between gap-5 py-[9px]">
                    <span className="text-[#666]">
                        {labels.parking}
                    </span>

                    <strong>
                        {money(quote.parking)}
                    </strong>
                </div>
            )}

            <div className="flex justify-between gap-5 py-[9px]">
                <span className="text-[#666]">
                    {labels.tolls}
                </span>

                <strong>
                    {money(quote.tolls)}
                </strong>
            </div>

            {Number(quote.babySeats || 0) > 0 && (
                <div className="flex justify-between gap-5 py-[9px]">
                    <span className="text-[#666]">
                        Baby Seats{" "}
                        <span className="text-[12px] font-normal text-[#777]">
                            {quote.babySeats} ($25 each)
                        </span>
                    </span>

                    <strong>
                        {money(quote.babySeatCharge)}
                    </strong>
                </div>
            )}

            {Number(quote.boosterSeats || 0) > 0 && (
                <div className="flex justify-between gap-5 py-[9px]">
                    <span className="text-[#666]">
                        Booster Seats{" "}
                        <span className="text-[12px] font-normal text-[#777]">
                            {quote.boosterSeats} ($11 each)
                        </span>
                    </span>

                    <strong>
                        {money(quote.boosterSeatCharge)}
                    </strong>
                </div>
            )}
        </div>
    )
}

export default QuoteSummary
