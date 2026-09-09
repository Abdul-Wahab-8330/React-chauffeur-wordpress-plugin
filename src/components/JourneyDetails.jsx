import GoogleAddressInput from "./GoogleAddressInput"

function getSuburb(place) {
    const components =
        place.address_components || []

    const suburb =
        components.find((component) =>
            component.types.includes(
                "locality"
            )
        )

    if (suburb) {
        return suburb.long_name
    }

    const postalTown =
        components.find((component) =>
            component.types.includes(
                "postal_town"
            )
        )

    return postalTown?.long_name || ""
}


function JourneyDetails({
    form,
    onChange,
    locationTypes,
    showFlightSection,
    flightNumber,
    noFlight,
    onFlightChange,
    showAdditionalDetails = false,
}) {


    const update = (field, value) => {
        onChange(field, value)
    }

    const inputClass =
        "oasis-field w-full min-h-[46px] rounded-[5px] border bg-white px-3 py-[10px] text-[15px] text-[#222] outline-none"

    const addressInputClass =
        "oasis-google-address w-full !min-h-[54px] !rounded-[10px] !px-4 !text-[15px]"

    const labelClass =
        "mb-[7px] block text-[13px] font-semibold text-[#222]"

    const fieldClass =
        "min-w-0"

    const journeyCardClass = showAdditionalDetails
        ? "mb-6 rounded-[14px] border-none bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.025)] sm:p-5"
        : "oasis-journey-card--essential mb-7 rounded-[16px] border-none bg-white p-5 shadow-[0_8px_28px_rgba(24,24,20,0.045)] sm:p-7"

    const sectionHeadingClass = showAdditionalDetails
        ? "m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a07c18]"
        : "m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a6a24]"

    const titleClass = showAdditionalDetails
        ? "m-0 mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#222]"
        : "m-0 mt-1 text-[23px] font-semibold tracking-[-0.025em] text-[#222]"

    const descriptionClass = showAdditionalDetails
        ? "m-0 mt-1 text-[12px] leading-[1.5] text-[#777]"
        : "m-0 mt-2 text-[13px] leading-[1.55] text-[#777]"

    const essentialFieldsClass = showAdditionalDetails
        ? "space-y-4"
        : "space-y-5"

    return (
        <section className={`oasis-card  ${journeyCardClass}`}>

            {/* Heading */}
            <div className="mb-5">
                <p className={sectionHeadingClass}>
                    Journey
                </p>

                <h3 className={titleClass}>
                    Where are you travelling?
                </h3>

                <p className={descriptionClass}>
                    Enter your pickup and destination to get started.
                </p>
            </div>

            {/* Essential journey fields */}
            <div className={essentialFieldsClass}>

                {/* Pickup Address */}
                <div className="min-w-0">
                    <label
                        htmlFor="oasis-pickup"
                        className={labelClass}
                    >
                        Pickup Address
                    </label>

                    <GoogleAddressInput
                        id="oasis-pickup"
                        value={form.pickup}
                        onChange={(value) =>
                            update("pickup", value)
                        }
                        onPlaceSelect={(place) => {
                            update(
                                "pickupLocation",
                                place.location
                                    ? {
                                        lat: place.location.lat(),
                                        lng: place.location.lng(),
                                    }
                                    : null
                            )

                            const suburb =
                                place.addressComponents?.find(
                                    (component) =>
                                        component.types?.includes(
                                            "locality"
                                        )
                                )

                            if (suburb) {
                                update(
                                    "pickupSuburb",
                                    suburb.longText ||
                                    suburb.shortText ||
                                    ""
                                )
                            }
                        }}
                        placeholder="Enter pickup address"
                        className={addressInputClass}
                    />
                </div>

                {/* Drop-off Address */}
                <div className="min-w-0">
                    <label
                        htmlFor="oasis-dropoff"
                        className={labelClass}
                    >
                        Drop-off Address
                    </label>

                    <GoogleAddressInput
                        id="oasis-dropoff"
                        value={form.dropoff}
                        onChange={(value) =>
                            update("dropoff", value)
                        }
                        onPlaceSelect={(place) => {
                            update(
                                "dropoffLocation",
                                place.location
                                    ? {
                                        lat: place.location.lat(),
                                        lng: place.location.lng(),
                                    }
                                    : null
                            )

                            const suburb =
                                place.addressComponents?.find(
                                    (component) =>
                                        component.types?.includes(
                                            "locality"
                                        )
                                )

                            if (suburb) {
                                update(
                                    "dropoffSuburb",
                                    suburb.longText ||
                                    suburb.shortText ||
                                    ""
                                )
                            }
                        }}
                        placeholder="Enter drop-off address"
                        className={addressInputClass}
                    />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* Pickup Date */}
                    <div className={fieldClass}>
                        <label
                            htmlFor="oasis-pickup-date"
                            className={labelClass}
                        >
                            Pickup Date
                        </label>

                        <input
                            type="date"
                            id="oasis-pickup-date"
                            value={form.pickupDate}
                            onChange={(e) =>
                                update(
                                    "pickupDate",
                                    e.target.value
                                )
                            }
                            required
                            className="
                    oasis-field w-full min-h-[54px]
                    rounded-[10px]
                    border border-[#d8d8d8]
                    bg-white
                    px-3
                    py-[10px]
                    text-[15px]
                    text-[#222]
                    outline-none
                "
                        />
                    </div>

                    {/* Pickup Time */}
                    <div className={fieldClass}>
                        <label
                            htmlFor="oasis-pickup-time"
                            className={labelClass}
                        >
                            Pickup Time
                        </label>

                        <input
                            type="time"
                            id="oasis-pickup-time"
                            value={form.pickupTime}
                            onChange={(e) =>
                                update(
                                    "pickupTime",
                                    e.target.value
                                )
                            }
                            required
                            className="
                    oasis-field w-full min-h-[54px]
                    rounded-[10px]
                    border border-[#d8d8d8]
                    bg-white
                    px-3
                    py-[10px]
                    text-[15px]
                    text-[#222]
                    outline-none
                "
                        />
                    </div>

                </div>

            </div>

            {/* Additional journey details */}
            {showAdditionalDetails && (
                <div className="oasis-additional-details mt-6 border-t border-[#eeeeec] pt-5">

                    <div className="mb-4">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a07c18]">
                            Additional details
                        </p>

                        <p className="m-0 mt-1 text-[12px] text-[#777]">
                            Help us prepare the right journey for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Pickup Suburb */}
                        <div className={fieldClass}>
                            <label
                                htmlFor="oasis-pickup-suburb"
                                className={labelClass}
                            >
                                Pickup Suburb
                            </label>

                            <input
                                type="text"
                                id="oasis-pickup-suburb"
                                value={form.pickupSuburb}
                                onChange={(e) =>
                                    update(
                                        "pickupSuburb",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter pickup suburb"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Pickup Location Type */}
                        <div className={fieldClass}>
                            <label
                                htmlFor="oasis-pickup-type"
                                className={labelClass}
                            >
                                Pickup Location Type
                            </label>

                            <div className="relative">
                                <select
                                    id="oasis-pickup-type"
                                    value={form.pickupType}
                                    onChange={(e) =>
                                        update(
                                            "pickupType",
                                            e.target.value
                                        )
                                    }
                                    className={`${inputClass} appearance-none pr-10`}
                                >
                                    {locationTypes.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>

                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m5 7 5 5 5-5" />
                                    </svg>
                                </span>
                            </div>

                            {form.pickupType === "domestic-airport" && (
                                <p className="mt-2 text-[12px] leading-[1.5] text-[#6d6d6d]">
                                    30 minutes complimentary waiting time is included for domestic airport pickups.
                                </p>
                            )}

                            {form.pickupType === "international-airport" && (
                                <p className="mt-2 text-[12px] leading-[1.5] text-[#6d6d6d]">
                                    60 minutes complimentary waiting time is included for international airport pickups.
                                </p>
                            )}
                        </div>

                        {/* Drop-off Suburb */}
                        <div className={fieldClass}>
                            <label
                                htmlFor="oasis-dropoff-suburb"
                                className={labelClass}
                            >
                                Drop-off Suburb
                            </label>

                            <input
                                type="text"
                                id="oasis-dropoff-suburb"
                                value={form.dropoffSuburb}
                                onChange={(e) =>
                                    update(
                                        "dropoffSuburb",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter drop-off suburb"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Drop-off Location Type */}
                        <div className={fieldClass}>
                            <label
                                htmlFor="oasis-dropoff-type"
                                className={labelClass}
                            >
                                Drop-off Location Type
                            </label>

                            <div className="relative">
                                <select
                                    id="oasis-dropoff-type"
                                    value={form.dropoffType}
                                    onChange={(e) =>
                                        update(
                                            "dropoffType",
                                            e.target.value
                                        )
                                    }
                                    className={`${inputClass} appearance-none pr-10`}
                                >
                                    {locationTypes.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>

                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m5 7 5 5 5-5" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Airport Flight Information */}
            {showAdditionalDetails && showFlightSection && (
                <div className="oasis-airport-flight mt-4">

                    <div className="rounded-[6px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-[14px]">
                        <strong className="text-[15px] text-[#222]">
                            Airport Flight Information
                        </strong>

                        <p className="mt-[5px] text-[12px] text-[#6d6d6d]">
                            If an airport is selected, enter a flight
                            number or select No Flight.
                        </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div className="min-w-0">
                            <label
                                htmlFor="oasis-flight-number"
                                className={labelClass}
                            >
                                Flight Number
                            </label>

                            <input
                                type="text"
                                id="oasis-flight-number"
                                value={flightNumber}
                                onChange={(e) =>
                                    onFlightChange(
                                        "flightNumber",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. QF123"
                                className={inputClass}
                            />
                        </div>

                        <label className="flex flex-col cursor-pointer items-center gap-2 font-medium text-[#222]">
                            <input
                                type="checkbox"
                                id="oasis-no-flight"
                                checked={noFlight}
                                onChange={(e) =>
                                    onFlightChange(
                                        "noFlight",
                                        e.target.checked
                                    )
                                }
                                className="oasis-checkbox h-4 w-4"
                            />

                            <span>No Flight</span>
                        </label>

                    </div>
                </div>
            )}

        </section>
    )
}

export default JourneyDetails
