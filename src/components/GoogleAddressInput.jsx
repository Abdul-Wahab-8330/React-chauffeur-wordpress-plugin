import { useEffect, useRef } from "react"
import { loadGooglePlaces } from "../google/maps"

function GoogleAddressInput({
    id,
    value,
    onChange,
    onPlaceSelect,
    placeholder,
    className,
}) {
    const containerRef = useRef(null)
    const autocompleteRef = useRef(null)
    const valueRef = useRef(value)

    valueRef.current = value

    useEffect(() => {
        let cancelled = false

        loadGooglePlaces()
            .then(({ PlaceAutocompleteElement }) => {
                if (
                    cancelled ||
                    !containerRef.current
                ) {
                    return
                }


                if (
                    cancelled ||
                    !containerRef.current
                ) {
                    return
                }

                const autocomplete =
                    new PlaceAutocompleteElement({
                        includedRegionCodes: ["au"],
                        placeholder,
                    })
                autocomplete.style.colorScheme = "light"
                autocomplete.id = id
                autocomplete.className = className
                autocomplete.value = valueRef.current || ""


                autocomplete.addEventListener(
                    "gmp-select",
                    async (event) => {
                        const place =
                            event.placePrediction.toPlace()



                        await place.fetchFields({
                            fields: [
                                "displayName",
                                "types",
                                "formattedAddress",
                                "addressComponents",
                                "location",
                                "id",
                            ],
                        })

                        console.log("Oasis Selected Place:", {
                            name: place.displayName,
                            types: place.types,
                            formattedAddress: place.formattedAddress,
                            addressComponents: place.addressComponents,
                        })

                        const address =
                            event.placePrediction.text?.text ||
                            place.formattedAddress ||
                            ""

                        autocomplete.value = address

                        onChange(address)

                        if (onPlaceSelect) {
                            onPlaceSelect(place)
                        }
                    }
                )

                containerRef.current.innerHTML = ""

                containerRef.current.appendChild(
                    autocomplete
                )

                autocompleteRef.current =
                    autocomplete
            })
            .catch((error) => {
                console.error(
                    "Google Places failed to load:",
                    error
                )
            })

        return () => {
            cancelled = true

            if (autocompleteRef.current) {
                autocompleteRef.current.remove()
                autocompleteRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (autocompleteRef.current) {
            autocompleteRef.current.value = value || ""
        }
    }, [value])


    return (
        <div
            ref={containerRef}
            className="w-full"
        />
    )
}

export default GoogleAddressInput
