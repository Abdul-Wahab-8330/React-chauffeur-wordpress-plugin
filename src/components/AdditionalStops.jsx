function AdditionalStops({
    stops,
    onAddStop,
    onRemoveStop,
    onStopChange,
}) {
    return (
        <section className="oasis-card oasis-additional-stops mb-[22px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.025)]">
            <div className="border-b border-[#eeeeee] px-5 py-5 sm:px-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a762d]">
                    Hourly / As Directed
                </p>

                <h3 className="m-0 text-[19px] font-semibold tracking-[-0.015em] text-[#222]">
                    Additional Stops
                </h3>

                <p className="mt-1 text-[12px] leading-[1.5] text-[#6d6d6d]">
                    Add any stops you would like to make during your
                    journey.
                </p>
            </div>

            <div className="p-5 sm:p-6">
                {stops.map((stop, index) => (
                    <div
                        key={index}
                        className="oasis-stop-row mb-2 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={stop}
                            maxLength={255}
                            onChange={(e) =>
                                onStopChange(index, e.target.value)
                            }
                            placeholder={`Stop ${index + 1}`}
                            className="oasis-stop-input min-h-[44px] w-full min-w-0 rounded-[8px] border border-[#d8d8d8] bg-white px-3 py-2 text-[14px] text-[#222] outline-none transition placeholder:text-[#999] focus:border-[#b58a32] focus:shadow-[0_0_0_2px_rgba(181,138,50,0.10)]"
                        />

                        <button
                            type="button"
                            onClick={() => onRemoveStop(index)}
                            aria-label={`Remove stop ${index + 1}`}
                            title={`Remove stop ${index + 1}`}
                            className="oasis-stop-remove flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] border border-[#efc9c9] bg-[#fff7f7] text-[16px] font-semibold leading-none text-[#a52626] transition hover:border-[#e5a5a5] hover:bg-[#ffecec] hover:text-[#8c1d1d]"
                        >
                            −
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={onAddStop}
                    className="oasis-stop-add mt-1 inline-flex min-h-[40px] items-center justify-center gap-1 rounded-[8px] border border-[#d9d9d9] bg-white px-4 text-[13px] font-semibold text-[#222] transition hover:border-[#c9a227] hover:bg-[#fffaf0]"
                >
                    <span aria-hidden="true" className="text-[15px] leading-none">
                        +
                    </span>{" "}
                    Add Stop
                </button>
            </div>
        </section>
    )
}

export default AdditionalStops
