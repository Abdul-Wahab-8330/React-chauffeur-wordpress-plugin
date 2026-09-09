/*
 * Oasis Booking Engine
 * Booking validation logic
 */

export function validateBooking(form, rules) {

    /*
     * Pickup
     */
    if (!String(form.pickup || "").trim()) {
        return {
            valid: false,
            field: "pickup",
            message: "Please enter the pickup address.",
        }
    }

    if (!String(form.pickupSuburb || "").trim()) {
        return {
            valid: false,
            field: "pickupSuburb",
            message: "Please enter the pickup suburb.",
        }
    }


    /*
     * Drop-off
     */
    if (!String(form.dropoff || "").trim()) {
        return {
            valid: false,
            field: "dropoff",
            message: "Please enter the drop-off address.",
        }
    }

    if (!String(form.dropoffSuburb || "").trim()) {
        return {
            valid: false,
            field: "dropoffSuburb",
            message: "Please enter the drop-off suburb.",
        }
    }


    /*
     * Location types
     */
    if (!form.pickupType) {
        return {
            valid: false,
            field: "pickupType",
            message: "Please select the pickup location type.",
        }
    }

    if (!form.dropoffType) {
        return {
            valid: false,
            field: "dropoffType",
            message: "Please select the drop-off location type.",
        }
    }


    /*
     * Date / time
     */
    if (!form.pickupDate) {
        return {
            valid: false,
            field: "pickupDate",
            message: "Please select a pickup date.",
        }
    }

    if (!form.pickupTime) {
        return {
            valid: false,
            field: "pickupTime",
            message: "Please select a pickup time.",
        }
    }


    /*
     * Passengers
     */
    const passengers =
        Number(form.passengers)

    if (
        !Number.isFinite(passengers) ||
        passengers < 1
    ) {
        return {
            valid: false,
            field: "passengers",
            message: "Please enter at least one passenger.",
        }
    }


    /*
     * Luggage
     */
    const suitcases =
        Number(form.suitcases)

    const smallBags =
        Number(form.smallBags)

    if (
        !Number.isFinite(suitcases) ||
        suitcases < 0
    ) {
        return {
            valid: false,
            field: "suitcases",
            message: "Please enter a valid number of check-in suitcases.",
        }
    }

    if (
        !Number.isFinite(smallBags) ||
        smallBags < 0
    ) {
        return {
            valid: false,
            field: "smallBags",
            message: "Please enter a valid number of small / carry-on bags.",
        }
    }


    /*
     * Baby seats
     */
    if (form.babySeatRequired) {

        const rearFacing =
            Number(form.rearFacing || 0)

        const forwardFacing =
            Number(form.forwardFacing || 0)

        const totalBabySeats =
            rearFacing +
            forwardFacing

        if (
            totalBabySeats <
            Number(
                rules.babySeats?.minimumWhenRequired || 1
            )
        ) {
            return {
                valid: false,
                field: "babySeats",
                message:
                    rules.messages?.babySeatRequired ||
                    "Please select at least one baby/child seat.",
            }
        }
    }


    /*
     * Airport flight information
     */
    const pickupIsAirport =
        form.pickupType === "domestic-airport" ||
        form.pickupType === "international-airport"

    const dropoffIsAirport =
        form.dropoffType === "domestic-airport" ||
        form.dropoffType === "international-airport"


    if (pickupIsAirport) {

        const hasFlight =
            String(
                form.pickupFlightNumber || ""
            ).trim().length > 0

        if (
            !hasFlight &&
            !form.pickupNoFlight
        ) {
            return {
                valid: false,
                field: "pickupFlight",
                message:
                    "Please enter a pickup flight number or select No Flight.",
            }
        }
    }


    if (dropoffIsAirport) {

        const hasFlight =
            String(
                form.dropoffFlightNumber || ""
            ).trim().length > 0

        if (
            !hasFlight &&
            !form.dropoffNoFlight
        ) {
            return {
                valid: false,
                field: "dropoffFlight",
                message:
                    "Please enter a drop-off flight number or select No Flight.",
            }
        }
    }


    /*
 * Return trip
 */
if (form.returnTrip) {

    /*
     * Return pickup date
     */
    if (!form.returnDate) {
        return {
            valid: false,
            field: "returnDate",
            message: "Please select the return pickup date.",
        }
    }

    /*
     * Return date cannot be before the outbound pickup date.
     */
    if (
        form.pickupDate &&
        form.returnDate < form.pickupDate
    ) {
        return {
            valid: false,
            field: "returnDate",
            message:
                "Return pickup date cannot be before the pickup date.",
        }
    }

    /*
     * Return pickup time
     */
    if (!form.returnTime) {
        return {
            valid: false,
            field: "returnTime",
            message: "Please select the return pickup time.",
        }
    }

    /*
     * Return pickup address
     */
    if (!String(form.returnPickup || "").trim()) {
        return {
            valid: false,
            field: "returnPickup",
            message:
                "Please enter the return pickup address.",
        }
    }

    /*
     * Return pickup suburb
     */
    if (!String(form.returnPickupSuburb || "").trim()) {
        return {
            valid: false,
            field: "returnPickupSuburb",
            message:
                "Please enter the return pickup suburb.",
        }
    }

    /*
     * Return drop-off address
     */
    if (!String(form.returnDropoff || "").trim()) {
        return {
            valid: false,
            field: "returnDropoff",
            message:
                "Please enter the return drop-off address.",
        }
    }

    /*
     * Return drop-off suburb
     */
    if (!String(form.returnDropoffSuburb || "").trim()) {
        return {
            valid: false,
            field: "returnDropoffSuburb",
            message:
                "Please enter the return drop-off suburb.",
        }
    }
}


    /*
     * Special instructions
     */
    const instructions =
        String(
            form.specialInstructions || ""
        )

    const maximumCharacters =
        Number(
            rules.specialInstructions
                ?.maximumCharacters || 500
        )

    if (
        instructions.length >
        maximumCharacters
    ) {
        return {
            valid: false,
            field: "specialInstructions",
            message:
                rules.messages?.specialInstructionsExceeded ||
                `Special instructions cannot exceed ${maximumCharacters} characters.`,
        }
    }


    /*
     * Everything passed.
     */
    return {
        valid: true,
        field: null,
        message: "",
    }
}