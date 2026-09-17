function VehicleSelection({ vehicles, vehicleImages, recommendations, selectedVehicle, onSelect, labels }) {
    return (
        <section className="oasis-card oasis-vehicle-selection mb-7 p-6 sm:p-8">
            <div className="mb-7">
                <p className="oasis-eyebrow">Step 03</p>
                <h3 className="oasis-section-title">Choose your vehicle</h3>
                <p className="oasis-section-description">
                    {labels.recommended} based on your passenger, luggage and child-seat requirements.
                </p>
            </div>

            <div className="oasis-vehicle-grid">
                {recommendations.map((item) => {
                    const vehicle = vehicles[item.key]
                    const selected = selectedVehicle === item.key
                    const vehicleImage = vehicleImages[item.key]
                    const images = Array.isArray(vehicleImage)
                        ? vehicleImage.filter(Boolean)
                        : vehicleImage
                            ? [vehicleImage]
                            : []

                    return (
                        <article
                            key={item.key}
                            className={`oasis-vehicle-option ${selected ? "is-selected" : ""} ${!item.suitable ? "is-unavailable" : ""}`}
                        >
                            <div className="oasis-vehicle-head">
                                <p className="oasis-vehicle-name">
                                    {vehicle.name}
                                    <span className="oasis-vehicle-similar"> or similar</span>
                                </p>

                                <span className={`oasis-availability-badge shrink-0 ${item.suitable ? "is-suitable" : "is-unsuitable"}`}>
                                    {item.suitable ? "Suitable" : "Not suitable"}
                                </span>
                            </div>

                            {images.length > 0 && (
                                <div className="oasis-vehicle-images">
                                    {images.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={
                                                index === 0
                                                    ? vehicle.name
                                                    : `${vehicle.name} - view ${index + 1}`
                                            }
                                            className={`oasis-vehicle-image ${index === 0 ? "is-primary" : "is-secondary"}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <p className="oasis-vehicle-category">{vehicle.category}</p>

                            <div className="oasis-vehicle-capacity-row">
                                <div className="oasis-vehicle-capacity"><strong>{vehicle.capacity.passengers}</strong><span>Passengers</span></div>
                                <div className="oasis-vehicle-capacity"><strong>{vehicle.capacity.luggageUnits}</strong><span>Luggage</span></div>
                                <div className="oasis-vehicle-capacity"><strong>{vehicle.capacity.babySeatsAllowed ? "Yes" : "No"}</strong><span>Baby seats</span></div>
                            </div>

                            {!item.suitable && item.reasons?.length > 0 && (
                                <p className="oasis-vehicle-reason">{item.reasons.join(" ")}</p>
                            )}

                            <div className="oasis-vehicle-actions">
                                <button
                                    type="button"
                                    disabled={!item.suitable}
                                    onClick={() => onSelect(item.key)}
                                    className={`oasis-vehicle-select-button ${selected ? "is-selected" : ""}`}
                                >
                                    {selected ? "Selected" : "Select vehicle"}
                                </button>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

export default VehicleSelection
