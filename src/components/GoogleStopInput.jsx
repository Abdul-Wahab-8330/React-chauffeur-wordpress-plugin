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

                /*
                 * Free-typed text and post-select modifications.
                 *
                 * The composed "input" event fires on every keystroke
                 * from the element's internal input in every modern
                 * browser, with none of "gmp-change"'s
                 * prediction-session semantics, so state always holds
                 * exactly what is visible in the field.
                 */
                autocomplete.addEventListener(
                    "input",
                    () => {
                        const live = clamp(
                            autocomplete.value
                        )

                        if (live !== valueRef.current) {
                            onChangeRef.current(live)
                        }
                    }
                )

                /*
                 * Final-commit safety net: whatever the user left in
                 * the field is committed when they leave it (click
                 * away, Tab, or Add Stop). "change" fires on commit
                 * for the custom element in Chrome/Edge/Safari/Firefox;
                 * "focusout" catches any missed blur path because it
                 * bubbles from the internal input to the host.
                 */
                autocomplete.addEventListener(
                    "change",
                    () => {
                        const live = clamp(
                            autocomplete.value
                        )

                        if (live !== valueRef.current) {
                            onChangeRef.current(live)
                        }
                    }
                )

                autocomplete.addEventListener(
                    "focusout",
                    () => {
                        const live = clamp(
                            autocomplete.value
                        )

                        if (live !== valueRef.current) {
                            onChangeRef.current(live)
                        }
                    }
                )

                /* Enter commits the typed value immediately. */
                autocomplete.addEventListener(
                    "keydown",
                    (event) => {
                        if (event.key === "Enter") {
                            const live = clamp(
                                autocomplete.value
                            )

                            if (
                                live !== valueRef.current
                            ) {
                                onChangeRef.current(live)
                            }
                        }
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

    /*
     * Sync external value changes (draft restore, resets) — but
     * never clobber an in-progress edit: only write when the
     * external value actually differs from what the element shows.
     */
    useEffect(() => {
        if (autocompleteRef.current) {
            const shown = autocompleteRef.current.value || ""

            if (shown !== (value || "")) {
                autocompleteRef.current.value = value || ""
            }
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
