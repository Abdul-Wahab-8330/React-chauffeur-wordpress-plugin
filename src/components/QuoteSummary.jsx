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
        <section className="oasis-card oasis-quote-summary mt-7 p-7 sm:p-8">
            <div>
                <p className="oasis-eyebrow">Step 04</p>

                <h3 className="oasis-section-title mb-1">
                    {labels.summary}
                </h3>

                <p className="oasis-section-description">
                    Your estimated booking quote.
                </p>
            </div>

            {/* Outbound */}
            {quote.outbound && (
                <div className="mt-5 border-t border-[rgba(34,34,30,0.07)] pt-5 pb-6">
                    <h4 className="m-0 mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#55554f]">
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
                <div className="mt-5 border-t border-[rgba(34,34,30,0.07)] pt-5">
                    <h4 className="m-0 mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#55554f]">
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
                <div className="mt-5 border-t border-[rgba(34,34,30,0.07)] pt-5">
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
                        <div className="mt-5 flex justify-between gap-5 border-t border-[rgba(34,34,30,0.07)] pt-4">
                            <span className="text-[#55554f]">
                                Baby Seats{" "}
                                <span className="text-[12px] font-normal text-[#77776f]">
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
                            <span className="text-[#55554f]">
                                Booster Seats{" "}
                                <span className="text-[12px] font-normal text-[#77776f]">
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
            <div className="mt-6 flex items-center justify-between gap-5 rounded-[18px] border border-[rgba(201,162,39,0.3)] bg-gradient-to-br from-[#fffaf0] to-[#fdf6e3] px-6 py-5 shadow-[0_6px_20px_rgba(201,162,39,0.1)]">
                <span className="text-[16px] font-semibold text-[#222]">
                    {labels.total}
                </span>

                <strong className="text-[26px] font-bold tracking-[-0.02em] text-[#1e1a0d]">
                    {money(quote.total)}
                </strong>
            </div>

            <button
                type="button"
                onClick={onProceedToCheckout}
                disabled={isCreatingBooking}
                className="oasis-checkout-button mt-6 disabled:cursor-wait disabled:opacity-70"
            >
                {isCreatingBooking
                    ? "Preparing checkout..."
                    : labels.proceedCheckout}
                {!isCreatingBooking && (
                    <span aria-hidden="true">→</span>
                )}
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
            <div className="flex justify-between gap-5 py-[10px]">
                <span className="text-[#55554f]">
                    {labels.distance}
                </span>

                <strong>
                    {Number(quote.distance || 0).toFixed(1)} km
                </strong>
            </div>

            <div className="flex justify-between gap-5 py-[10px]">
                <span className="text-[#55554f]">
                    {labels.baseFare}
                </span>

                <strong>
                    {money(quote.baseFare)}
                </strong>
            </div>

            {quote.distanceFare !== undefined && (
                <div className="flex justify-between gap-5 py-[10px]">
                    <span className="text-[#55554f]">
                        {labels.distanceFare}
                    </span>

                    <strong>
                        {money(quote.distanceFare)}
                    </strong>
                </div>
            )}

            {quote.hourlyFare !== undefined && (
                <div className="flex justify-between gap-5 py-[10px]">
                    <span className="text-[#55554f]">
                        Hourly Fare
                    </span>

                    <strong>
                        {money(quote.hourlyFare)}
                    </strong>
                </div>
            )}

            <div className="flex justify-between gap-5 py-[10px]">
                <span className="text-[#55554f]">
                    {labels.levy}
                </span>

                <strong>
                    {money(quote.levy)}
                </strong>
            </div>

            {Number(quote.parking || 0) > 0 && (
                <div className="flex justify-between gap-5 py-[10px]">
                    <span className="text-[#55554f]">
                        {labels.parking}
                    </span>

                    <strong>
                        {money(quote.parking)}
                    </strong>
                </div>
            )}

            <div className="flex justify-between gap-5 py-[10px]">
                <span className="text-[#55554f]">
                    {labels.tolls}
                </span>

                <strong>
                    {money(quote.tolls)}
                </strong>
            </div>

            {Number(quote.babySeats || 0) > 0 && (
                <div className="flex justify-between gap-5 py-[10px]">
                    <span className="text-[#55554f]">
                        Baby Seats{" "}
                        <span className="text-[12px] font-normal text-[#77776f]">
                            {quote.babySeats} ($25 each)
                        </span>
                    </span>

                    <strong>
                        {money(quote.babySeatCharge)}
                    </strong>
                </div>
            )}

            {Number(quote.boosterSeats || 0) > 0 && (
                <div className="flex justify-between gap-5 py-[10px]">
                    <span className="text-[#55554f]">
                        Booster Seats{" "}
                        <span className="text-[12px] font-normal text-[#77776f]">
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
