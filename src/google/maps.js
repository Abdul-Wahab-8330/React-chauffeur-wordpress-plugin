import {
    setOptions,
    importLibrary,
} from "@googlemaps/js-api-loader"

let googleMapsPromise = null

export function loadGoogleMaps() {
    if (googleMapsPromise) {
        return googleMapsPromise
    }

    const apiKey =
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        return Promise.reject(
            new Error(
                "Google Maps API key is missing."
            )
        )
    }

    googleMapsPromise = (async () => {
        setOptions({
            key: apiKey,
            v: "weekly",
        })

        await importLibrary("maps")

        return window.google.maps
    })()

    return googleMapsPromise
}


export async function loadGooglePlaces() {
    await loadGoogleMaps()

    return importLibrary("places")
}


export async function loadGoogleRoutes() {
    await loadGoogleMaps()

    return importLibrary("routes")
}