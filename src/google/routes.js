import { loadGoogleRoutes } from "./maps"

export async function calculateRouteDistance(
    origin,
    destination
) {
    if (!origin || !destination) {
        return null
    }

    const { Route } =
        await loadGoogleRoutes()

    const originLat =
        typeof origin.lat === "function"
            ? origin.lat()
            : Number(origin.lat)

    const originLng =
        typeof origin.lng === "function"
            ? origin.lng()
            : Number(origin.lng)

    const destinationLat =
        typeof destination.lat === "function"
            ? destination.lat()
            : Number(destination.lat)

    const destinationLng =
        typeof destination.lng === "function"
            ? destination.lng()
            : Number(destination.lng)

    if (
        !Number.isFinite(originLat) ||
        !Number.isFinite(originLng) ||
        !Number.isFinite(destinationLat) ||
        !Number.isFinite(destinationLng)
    ) {
        throw new Error(
            "Invalid pickup or drop-off coordinates."
        )
    }

    const request = {
        origin: {
            lat: originLat,
            lng: originLng,
        },

        destination: {
            lat: destinationLat,
            lng: destinationLng,
        },

        travelMode: "DRIVING",

        extraComputations: ["TOLLS"],

        fields: [
            "distanceMeters",
            "durationMillis",
            "travelAdvisory",
        ],
    }

    const { routes } =
        await Route.computeRoutes(request)

    if (!routes?.length) {
        return null
    }

    const route = routes[0]

    const tollPrice =
        route.travelAdvisory?.tollInfo?.estimatedPrices?.[0]

    let tolls = 0

    if (tollPrice) {
        tolls =
            Number(tollPrice.units || 0) +
            Number(tollPrice.nanos || 0) / 1_000_000_000
    }

    console.log("Oasis Google Route:", {
        distanceMeters: route.distanceMeters,
        distanceKm: route.distanceMeters / 1000,
        durationMinutes:
            route.durationMillis / 60000,
        tolls,
    })

    return {
        distanceKm:
            route.distanceMeters / 1000,

        durationMinutes:
            route.durationMillis / 60000,

        tolls,
    }
}

