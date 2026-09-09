/*
 * Oasis Booking Engine
 * Vehicle suitability & recommendation logic
 */

export function calculateLuggageUnits(
    suitcases,
    smallBags,
    rules
) {
    const suitcaseUnits =
        Number(
            rules.luggage?.checkInBagUnits || 2
        )

    const smallBagUnits =
        Number(
            rules.luggage?.smallBagUnits || 1
        )

    return (
        Number(suitcases || 0) * suitcaseUnits
    ) + (
        Number(smallBags || 0) * smallBagUnits
    )
}


export function calculateBabySeats(
    rearFacing,
    forwardFacing
) {
    return (
        Number(rearFacing || 0) +
        Number(forwardFacing || 0)
    )
}


export function getVehicleSuitability(
    vehicle,
    {
        passengers = 0,
        luggageUnits = 0,
        babySeats = 0,
        babyRequired = false,
    },
    rules
) {
    const reasons = []

    /*
     * Baby seats occupy passenger seating.
     */
    if (
        Number(passengers) +
        Number(babySeats) >
        Number(vehicle.capacity.passengers)
    ) {
        reasons.push(
            rules.messages?.babySeatCapacityExceeded ||
            "Passenger and baby-seat capacity exceeded."
        )
    }

    /*
     * Luggage capacity.
     */
    if (
        Number(luggageUnits) >
        Number(vehicle.capacity.luggageUnits)
    ) {
        reasons.push(
            rules.messages?.luggageExceeded ||
            "Luggage capacity exceeded."
        )
    }

    /*
     * Vehicle supports baby seats.
     */
    if (
        babyRequired &&
        !vehicle.capacity.babySeatsAllowed
    ) {
        reasons.push(
            rules.messages?.babySeatNotAllowed ||
            "Baby seats are not available in this vehicle."
        )
    }

    return {
        suitable: reasons.length === 0,
        reasons,
    }
}


export function getVehicleRecommendations(
    vehicles,
    bookingData,
    rules
) {
    const {
        passengers = 0,
        luggageUnits = 0,
        babySeats = 0,
        babyRequired = false,
    } = bookingData

    if (Number(passengers) < 1) {
        return []
    }

    return Object.entries(vehicles).map(
        ([key, vehicle]) => {
            const suitability =
                getVehicleSuitability(
                    vehicle,
                    {
                        passengers,
                        luggageUnits,
                        babySeats,
                        babyRequired,
                    },
                    rules
                )

            return {
                key,
                vehicle,
                ...suitability,
            }
        }
    )
}


export function isVehicleSuitable(
    vehicle,
    bookingData,
    rules
) {
    return getVehicleSuitability(
        vehicle,
        bookingData,
        rules
    ).suitable
}