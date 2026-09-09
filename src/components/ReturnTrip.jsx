import GoogleAddressInput from "./GoogleAddressInput"

function ReturnTrip({
    enabled,
    onChange,
    form,
}) {
    const inputClass =
    "oasis-field w-full min-h-[50px] rounded-[9px] border border-[#d8d8d8] bg-white px-4 py-[12px] text-[15px] text-[#222] outline-none transition focus:border-[#b58a32] focus:shadow-[0_0_0_2px_rgba(181,138,50,0.10)]"

    const addressInputClass =
    "oasis-google-address w-full !min-h-[50px] !rounded-[9px] !px-4 !text-[15px]"

    const labelClass =
    "mb-[8px] block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#444]"

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
        <section className="oasis-card oasis-return-trip mb-[22px] mt-[12px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.025)]">
            <div className="border-none  px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a762d]">
                            Optional
                        </p>

                        <h3 className="m-0 text-[19px] font-semibold tracking-[-0.015em] text-[#222]">
                            Return Trip
                        </h3>

                        <p className="mt-1 text-[12px] leading-[1.5] text-[#6d6d6d]">
                            Add a separate return journey to your booking.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pt-5 sm:px-6">
                <div className="oasis-choice-toggle grid grid-cols-2 gap-2 rounded-[10px] bg-[#f6f6f4] p-1">
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
                <div className="mt-6 grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2 sm:px-6 sm:pb-6">

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
