/*
 * Oasis Booking Engine
 * Pricing & fare calculation logic
 */

export function isAirport(type) {
    return (
        type === "domestic-airport" ||
        type === "international-airport"
    )
}


export function calculateDistanceFare(vehicle, distance) {
    const km = Number(distance || 0)

    if (km <= 10) {
        return 0
    }

    if (km <= 100) {
        return (
            (km - 10) *
            Number(vehicle.pricing.distanceRate11to100)
        )
    }

    const firstBracket =
        90 *
        Number(vehicle.pricing.distanceRate11to100)

    const secondBracket =
        (km - 100) *
        Number(vehicle.pricing.distanceRate101plus)

    return firstBracket + secondBracket
}


export function calculateParking(
    pickupType,
    dropoffType,
    rules
) {
    /*
     * Airport drop-off.
     */
    if (isAirport(dropoffType)) {
        return Number(
            rules.charges?.parking?.airportDropoff || 0
        )
    }

    /*
     * Domestic airport pickup.
     */
    if (pickupType === "domestic-airport") {
        return Number(
            rules.charges?.parking?.domesticAirportPickup || 0
        )
    }

    /*
     * International airport pickup.
     */
    if (pickupType === "international-airport") {
        return Number(
            rules.charges?.parking?.internationalAirportPickup || 0
        )
    }

    return 0
}


export function calculateHourlyFare(
    vehicle,
    hours,
    rules
) {
    const totalHours = Number(hours || 0)


    console.log(
    "OASIS HOURLY DEBUG:",
    vehicle.name,
    vehicle.hourly
)

    let baseFare =
        Number(vehicle.hourly.baseFare)

    const threshold =
        Number(
            rules.hourly?.baseFareChangeAfterHours || 4
        )

    const changedBaseFare =
        Number(
            vehicle.hourly?.after4HoursBaseFare ??
            rules.hourly?.baseFareAfterThreshold ??
            10
        )

    if (totalHours > threshold) {
        baseFare = changedBaseFare
    }

    const hourlyRate =
        Number(vehicle.hourly.rate)

    return {
        baseFare,

        hourlyFare:
            hourlyRate * totalHours,
    }
}


export function calculatePointToPointQuote(
    vehicle,
    distance,
    pickupType,
    dropoffType,
    rules,
    tolls = 0,
    babySeats = 0,
    boosterSeats = 0
) {
    const baseFare =
        Number(vehicle.pricing.baseFare)

    const km = Number(distance || 0)

    const distanceFare =
        calculateDistanceFare(
            vehicle,
            distance
        )

    const levy =
        Number(rules.charges?.levy || 0)

    const parking =
        calculateParking(
            pickupType,
            dropoffType,
            rules
        )

    const babySeatCharge =
        Number(babySeats || 0) * 25

    const boosterSeatCharge =
        Number(boosterSeats || 0) * 11


    const total =
        baseFare +
        distanceFare +
        levy +
        parking +
        Number(tolls || 0) +
        babySeatCharge +
        boosterSeatCharge

    return {
        distance: km,
        baseFare,
        distanceFare,
        levy,
        parking,
        tolls,
        babySeatCharge,
        boosterSeatCharge,
        total,
    }
}


export function calculateHourlyQuote(
    vehicle,
    hours,
    pickupType,
    dropoffType,
    rules,
    tolls = 0,
    babySeats = 0,
    boosterSeats = 0
) {
    const fare =
        calculateHourlyFare(
            vehicle,
            hours,
            rules
        )

    const levy =
        Number(rules.charges?.levy || 0)

    const parking =
        calculateParking(
            pickupType,
            dropoffType,
            rules
        )


    const babySeatCharge =
        Number(babySeats || 0) * 25

    const boosterSeatCharge =
        Number(boosterSeats || 0) * 11


    const total =
        fare.baseFare +
        fare.hourlyFare +
        levy +
        parking +
        Number(tolls || 0) +
        babySeatCharge +
        boosterSeatCharge

    return {
        baseFare: fare.baseFare,
        hourlyFare: fare.hourlyFare,
        levy,
        parking,
        tolls: Number(tolls || 0),
        babySeatCharge,
        boosterSeatCharge,
        total,
    }
}


/*
 * Return Point-to-Point
 *
 * Each leg is calculated independently.
 */

export function calculateReturnPointToPointQuote(
    vehicle,
    outboundDistance,
    returnDistance,
    outboundPickupType,
    outboundDropoffType,
    returnPickupType,
    returnDropoffType,
    rules,
    outboundTolls = 0,
    returnTolls = 0,
    babySeats = 0,
    boosterSeats = 0
) {
    const outbound =
        calculatePointToPointQuote(
            vehicle,
            outboundDistance,
            outboundPickupType,
            outboundDropoffType,
            rules,
            outboundTolls
        )

    const inbound =
        calculatePointToPointQuote(
            vehicle,
            returnDistance,
            returnPickupType,
            returnDropoffType,
            rules,
            returnTolls
        )

    const babySeatCharge =
        Number(babySeats || 0) * 25

    const boosterSeatCharge =
        Number(boosterSeats || 0) * 11


    return {
        outbound,
        inbound,

        baseFare:
            outbound.baseFare +
            inbound.baseFare,

        distanceFare:
            outbound.distanceFare +
            inbound.distanceFare,

        levy:
            outbound.levy +
            inbound.levy,

        parking:
            outbound.parking +
            inbound.parking,

        tolls:
            outbound.tolls +
            inbound.tolls,

        babySeatCharge,
        boosterSeatCharge,

        total:
            outbound.total +
            inbound.total +
            babySeatCharge +
            boosterSeatCharge,
    }
}


/*
 * Return Hourly
 *
 * Each leg is calculated independently.
 */
export function calculateReturnHourlyQuote(
    vehicle,
    outboundHours,
    returnHours,
    outboundPickupType,
    outboundDropoffType,
    returnPickupType,
    returnDropoffType,
    rules,
    outboundTolls = 0,
    returnTolls = 0,
    babySeats = 0,
    boosterSeats = 0
) {
    const outbound =
        calculateHourlyQuote(
            vehicle,
            outboundHours,
            outboundPickupType,
            outboundDropoffType,
            rules,
            outboundTolls
        )

    const inbound =
        calculateHourlyQuote(
            vehicle,
            returnHours,
            returnPickupType,
            returnDropoffType,
            rules,
            returnTolls
        )

    const babySeatCharge =
        Number(babySeats || 0) * 25

    const boosterSeatCharge =
        Number(boosterSeats || 0) * 11

    return {
        outbound,
        inbound,

        baseFare:
            outbound.baseFare +
            inbound.baseFare,

        hourlyFare:
            outbound.hourlyFare +
            inbound.hourlyFare,

        levy:
            outbound.levy +
            inbound.levy,

        parking:
            outbound.parking +
            inbound.parking,

        tolls:
            outbound.tolls +
            inbound.tolls,

        total:
            outbound.total +
            inbound.total +
            babySeatCharge +
            boosterSeatCharge,

        babySeatCharge,
        boosterSeatCharge,
    }
}


export function validatePointToPointDistance(
    distance,
    rules
) {
    const maximum =
        Number(
            rules.general?.pointToPointMaxDistanceKm || 200
        )

    const value =
        Number(distance || 0)

    return {
        valid: value <= maximum,
        maximum,
    }
}


export function validateHourly(
    hours,
    distance,
    rules
) {
    const minimumHours =
        Number(
            rules.hourly?.minimumHours || 3
        )

    const maximumHours =
        Number(
            rules.hourly?.maximumHours || 12
        )

    const maximumDistance =
        Number(
            rules.hourly?.maximumDistanceKm || 60
        )

    const totalHours =
        Number(hours || 0)

    const totalDistance =
        Number(distance || 0)

    const valid =
        totalHours >= minimumHours &&
        totalHours <= maximumHours &&
        totalDistance <= maximumDistance

    return {
        valid,
        minimumHours,
        maximumHours,
        maximumDistance,
    }
}