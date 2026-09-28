import { useEffect, useRef, useState } from "react"
import { loadGooglePlaces } from "../google/maps"

/*
 * GoogleStopInput — Additional Stops only.
 *
 * A self-contained Places Autocomplete element for stop rows. It is
 * deliberately separate from GoogleAddressInput so pickup/dropoff
 * behavior can never regress.
 *
 * Contract (identical to the native input it replaces):
 *   - value:    plain string from form.stops[index]
 *   - onChange: plain string back out, in every path
 *
 * Two update paths:
 *   1. gmp-select — the user picks a suggestion. String is taken
 *      from the prediction text. No toPlace()/fetchFields() here:
 *      stops need a string only, so no Place Details session.
 *   2. gmp-change — free-typed text (e.g. "My apartment gate").
 *      Without this, manual typing would be silently lost.
 *
 * Fallback: if the Places library fails to load, a plain native
 * input renders so Hourly / As Directed bookings keep working.
 */
function GoogleStopInput({
    value,
    onChange,
    placeholder,
    className = "oasis-stop-input",
    wrapperClassName = "oasis-stop-field",
    regionCodes = ["au"],
    maxLength = 255,
}) {
    const containerRef = useRef(null)
    const autocompleteRef = useRef(null)
    const valueRef = useRef(value)
    const onChangeRef = useRef(onChange)
    const [failed, setFailed] = useState(false)

    valueRef.current = value
    onChangeRef.current = onChange

    /* Every path yields a plain string, capped like the native input. */
    const clamp = (text) =>
        String(text ?? "").slice(0, maxLength)

    useEffect(() => {
        let cancelled = false

        loadGooglePlaces()
            .then(({ PlaceAutocompleteElement }) => {
                if (cancelled || !containerRef.current) {
                    return
                }

                const autocomplete =
                    new PlaceAutocompleteElement({
                        includedRegionCodes: regionCodes,
                        placeholder,
                    })

                autocomplete.style.colorScheme = "light"
                autocomplete.className = className
                autocomplete.value = valueRef.current || ""

                /* User picked a suggestion. */
                autocomplete.addEventListener(
                    "gmp-select",
                    (event) => {
                        const address = clamp(
                            event.placePrediction.text?.text || ""
                        )

                        autocomplete.value = address

                        onChangeRef.current(address)
                    }
                )

                /* Free-typed text (no suggestion picked). */
                autocomplete.addEventListener(
                    "gmp-change",
                    () => {
                        onChangeRef.current(
                            clamp(autocomplete.value)
                        )
                    }
                )

                containerRef.current.innerHTML = ""

                containerRef.current.appendChild(
                    autocomplete
                )

                autocompleteRef.current = autocomplete
            })
            .catch((error) => {
                console.error(
                    "Google Places failed to load (stops):",
                    error
                )

                if (!cancelled) {
                    setFailed(true)
                }
            })

        return () => {
            cancelled = true

            if (autocompleteRef.current) {
                autocompleteRef.current.remove()
                autocompleteRef.current = null
            }
        }
    }, [])

    /* Sync external value changes (draft restore, resets). */
    useEffect(() => {
        if (autocompleteRef.current) {
            autocompleteRef.current.value = value || ""
        }
    }, [value])

    /* Fallback: native input, same contract and class. */
    if (failed) {
        return (
            <input
                type="text"
                value={value || ""}
                maxLength={maxLength}
                onChange={(e) =>
                    onChangeRef.current(
                        clamp(e.target.value)
                    )
                }
                placeholder={placeholder}
                className={className}
            />
        )
    }

    return (
        <div
            ref={containerRef}
            className={wrapperClassName}
        />
    )
}

export default GoogleStopInput
