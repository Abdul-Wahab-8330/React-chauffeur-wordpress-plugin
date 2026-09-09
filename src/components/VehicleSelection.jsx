function VehicleSelection({ vehicles, vehicleImages, recommendations, selectedVehicle, onSelect, labels }) {
    return (
        <section className="oasis-card oasis-vehicle-selection mb-6 rounded-[16px] border border-[#e5e5e5] bg-white p-5 shadow-[0_8px_28px_rgba(24,24,20,0.045)] sm:p-7">
            <div className="mb-5">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6a24]">Step 03</p>
                <h3 className="m-0 mt-1 text-[23px] font-semibold tracking-[-0.025em] text-[#222]">Choose your vehicle</h3>
                <p className="m-0 mt-2 text-[13px] leading-[1.55] text-[#6d6d6d]">
                    {labels.recommended} based on your passenger, luggage and child-seat requirements.
                </p>
            </div>

            <div className="grid gap-3">
                {recommendations.map((item) => {
                    const vehicle = vehicles[item.key]
                    const selected = selectedVehicle === item.key
                    const vehicleImage = vehicleImages[item.key]

                    return (
                        <article
                            key={item.key}
                            className={`oasis-vehicle-option ${selected ? "is-selected" : ""} ${!item.suitable ? "is-unavailable" : ""}`}
                        >
                            <div className="oasis-vehicle-top flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-4">
                                    {vehicleImage && (
                                        <img
                                            src={vehicleImage}
                                            alt={vehicle.name}
                                            className="oasis-vehicle-image"
                                        />
                                    )}

                                    <div className="min-w-0">
                                        <p className="m-0 text-[16px] font-semibold text-[#222]">{vehicle.name}</p>
                                        <p className="m-0 mt-1 text-[13px] text-[#6d6d6d]">{vehicle.category}</p>
                                    </div>
                                </div>

                                <span className={`oasis-availability-badge ${item.suitable ? "is-suitable" : "is-unsuitable"}`}>
                                    {item.suitable ? "Suitable" : "Not suitable"}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="oasis-vehicle-capacity"><strong>{vehicle.capacity.passengers}</strong><span>Passengers</span></div>
                                <div className="oasis-vehicle-capacity"><strong>{vehicle.capacity.luggageUnits}</strong><span>Luggage units</span></div>
                                <div className="oasis-vehicle-capacity"><strong>{vehicle.capacity.babySeatsAllowed ? "Yes" : "No"}</strong><span>Baby seats</span></div>
                            </div>

                            {!item.suitable && item.reasons?.length > 0 && (
                                <p className="oasis-vehicle-reason">{item.reasons.join(" ")}</p>
                            )}

                            <button
                                type="button"
                                disabled={!item.suitable}
                                onClick={() => onSelect(item.key)}
                                className={`oasis-vehicle-select-button ${selected ? "is-selected" : ""}`}
                            >
                                {selected ? "Selected" : "Select vehicle"}
                            </button>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

export default VehicleSelection
