import GoogleAddressInput from "./GoogleAddressInput"

function ReturnTrip({
    enabled,
    onChange,
    form,
}) {
    const inputClass =
    "oasis-field"

    const addressInputClass =
    "oasis-google-address is-compact !px-4 !text-[15px]"

    const labelClass =
    "oasis-label"

    const update = (field, value) => {
        form.onChange(field, value)
    }

    const toCoordinates = (location) => {
        if (!location) {
            return null
        }

        return {
            lat: typeof location.lat === "function"
                ? location.lat()
                : Number(location.lat),
            lng: typeof location.lng === "function"
                ? location.lng()
                : Number(location.lng),
        }
    }

    const handleReturnPickupSelect = (place) => {
        console.log(
            "RETURN PICKUP LOCATION:",
            place.location
        )
        const suburb =
            place.addressComponents?.find(
                (component) =>
                    component.types?.includes(
                        "locality"
                    )
            )?.longText || ""

        update(
            "returnPickupSuburb",
            suburb
        )

        if (place.location) {
            update(
                "returnPickupLocation",
                toCoordinates(place.location)
            )
        }


    }

    const handleReturnDropoffSelect = (place) => {
        console.log(
            "RETURN DROPOFF LOCATION:",
            place.location
        )
        const suburb =
            place.addressComponents?.find(
                (component) =>
                    component.types?.includes(
                        "locality"
                    )
            )?.longText || ""

        update(
            "returnDropoffSuburb",
            suburb
        )

        if (place.location) {
            update(
                "returnDropoffLocation",
                toCoordinates(place.location)
            )
        }


    }

    return (
        <section className="oasis-card oasis-return-trip mb-[28px] mt-2 overflow-hidden p-6 sm:p-7">
            <div className="mb-6">
                        <p className="oasis-eyebrow">
                            Optional
                        </p>

                        <h3 className="oasis-section-title">
                            Return Trip
                        </h3>

                        <p className="oasis-section-description">
                            Add a separate return journey to your booking.
                        </p>
            </div>

            <div>
                <div className="oasis-choice-toggle grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onChange(true)}
                        className={`min-h-[48px] rounded-[8px] px-4 text-[14px] font-semibold transition ${enabled
                                ? "bg-white text-[#222] shadow-[0_1px_5px_rgba(0,0,0,0.08)]"
                                : "text-[#666] hover:text-[#222]"
                            }`}
                    >
                        Yes, return
                    </button>

                    <button
                        type="button"
                        onClick={() => onChange(false)}
                        className={`min-h-[48px] rounded-[8px] px-4 text-[14px] font-semibold transition ${!enabled
                                ? "bg-white text-[#222] shadow-[0_1px_5px_rgba(0,0,0,0.08)]"
                                : "text-[#666] hover:text-[#222]"
                            }`}
                    >
                        No return
                    </button>
                </div>
            </div>

            {enabled && (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* Return Pickup Date */}
                    <div>
                        <label
                            htmlFor="oasis-return-pickup-date"
                            className={labelClass}
                        >
                            Return Pickup Date
                        </label>

                        <input
                            type="date"
                            id="oasis-return-pickup-date"
                            value={form.returnDate}
                            min={
                                form.pickupDate ||
                                undefined
                            }
                            onChange={(e) =>
                                update(
                                    "returnDate",
                                    e.target.value
                                )
                            }
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Return Pickup Time */}
                    <div>
                        <label
                            htmlFor="oasis-return-pickup-time"
                            className={labelClass}
                        >
                            Return Pickup Time
                        </label>

                        <input
                            type="time"
                            id="oasis-return-pickup-time"
                            value={form.returnTime}
                            onChange={(e) =>
                                update(
                                    "returnTime",
                                    e.target.value
                                )
                            }
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Return Pickup Address */}
                    <div className="min-w-0 md:col-span-2">
                        <label
                            htmlFor="oasis-return-pickup"
                            className={labelClass}
                        >
                            Return Pickup Address
                        </label>

                        <GoogleAddressInput
                            id="oasis-return-pickup"
                            value={form.returnPickup}
                            onChange={(value) =>
                                update(
                                    "returnPickup",
                                    value
                                )
                            }
                            onPlaceSelect={
                                handleReturnPickupSelect
                            }
                            placeholder="Enter return pickup address"
                            className={addressInputClass}
                        />
                    </div>

                    {/* Return Pickup Suburb */}
                    <div>
                        <label
                            htmlFor="oasis-return-pickup-suburb"
                            className={labelClass}
                        >
                            Return Pickup Suburb
                        </label>

                        <input
                            type="text"
                            id="oasis-return-pickup-suburb"
                            value={
                                form.returnPickupSuburb
                            }
                            onChange={(e) =>
                                update(
                                    "returnPickupSuburb",
                                    e.target.value
                                )
                            }
                            placeholder="Enter return pickup suburb"
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Return Drop-off Address */}
                    <div>
                        <label
                            htmlFor="oasis-return-dropoff"
                            className={labelClass}
                        >
                            Return Drop-off Address
                        </label>

                        <GoogleAddressInput
                            id="oasis-return-dropoff"
                            value={form.returnDropoff}
                            onChange={(value) =>
                                update(
                                    "returnDropoff",
                                    value
                                )
                            }
                            onPlaceSelect={
                                handleReturnDropoffSelect
                            }
                            placeholder="Enter return drop-off address"
                            className={addressInputClass}
                        />
                    </div>

                    {/* Return Drop-off Suburb */}
                    <div>
                        <label
                            htmlFor="oasis-return-dropoff-suburb"
                            className={labelClass}
                        >
                            Return Drop-off Suburb
                        </label>

                        <input
                            type="text"
                            id="oasis-return-dropoff-suburb"
                            value={
                                form.returnDropoffSuburb
                            }
                            onChange={(e) =>
                                update(
                                    "returnDropoffSuburb",
                                    e.target.value
                                )
                            }
                            placeholder="Enter return drop-off suburb"
                            required
                            className={inputClass}
                        />
                    </div>

                </div>
            )}
        </section>
    )
}

export default ReturnTrip
