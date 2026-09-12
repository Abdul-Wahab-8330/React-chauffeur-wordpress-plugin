import { useEffect, useMemo, useState } from "react"
import toast, { Toaster } from "react-hot-toast"

import BookingType from "./components/BookingType"
import BookingProgress from "./components/BookingProgress"
import JourneyDetails from "./components/JourneyDetails"
import PassengerLuggage from "./components/PassengerLuggage"
import BabySeats from "./components/BabySeats"
import VehicleSelection from "./components/VehicleSelection"
import ReturnTrip from "./components/ReturnTrip"
import SpecialInstructions from "./components/SpecialInstructions"
import AdditionalStops from "./components/AdditionalStops"
import QuoteSummary from "./components/QuoteSummary"
import AuthCheckpoint from "./components/AuthCheckpoint"
import { createPortal } from "react-dom"

import { vehicles } from "./data/vehicles"
import { calculateRouteDistance } from "./google/routes"

import {
  calculateLuggageUnits,
  calculateBabySeats,
  getVehicleRecommendations,
} from "./logic/vehicle"

import {
  calculatePointToPointQuote,
  calculateHourlyQuote,
  calculateReturnPointToPointQuote,
  calculateReturnHourlyQuote,
  validatePointToPointDistance,
  validateHourly,
} from "./logic/pricing"

import { validateBooking } from "./logic/validation"








const bookingRules = {
  general: {
    currency: "$",
    testDistanceKm: 25,
    pointToPointMaxDistanceKm: 200,
  },

  charges: {
    levy: 1.32,

    parking: {
      internationalAirportPickup: 21,
      domesticAirportPickup: 14,
      airportDropoff: 0,
    },

  },

  luggage: {
    checkInBagUnits: 2,
    smallBagUnits: 1,

    instruction:
      "1 check-in suitcase = 2 luggage units. 1 small/carry-on bag = 1 luggage unit.",
  },

  babySeats: {
    enabled: true,

    seatOccupiesPassengerSpace: true,

    minimumWhenRequired: 1,

    instruction:
      "A baby/child seat occupies one passenger seat.",

    types: {
      "rear-facing": {
        label: "Rear-facing infant seat",
      },

      "forward-facing": {
        label: "Forward-facing child seat",
      },
    },
  },

  hourly: {
    minimumHours: 3,
    maximumHours: 12,
    maximumDistanceKm: 60,

    baseFareChangeAfterHours: 4,
    baseFareAfterThreshold: 10,

    limitMessage:
      "Hourly bookings are limited to 12 hours and 60 km. For bookings exceeding these limits, please select Point-to-Point / Return Trip or contact us.",
  },

  airport: {
    types: {
      normal: {
        label: "Normal Location",
      },

      "domestic-airport": {
        label: "Domestic Airport",
      },

      "international-airport": {
        label: "International Airport",
      },
    },
  },

  returnTrip: {
    enabled: true,
    label: "Return Trip",
    yesLabel: "Yes",
    noLabel: "No",

    instruction:
      "Return journeys are calculated as a separate journey using the return journey details.",
  },

  specialInstructions: {
    enabled: true,

    label: "Special Instructions",

    placeholder:
      "Add any special instructions...",

    maximumCharacters: 500,

    instruction:
      "Letters, numbers, spaces and normal punctuation are allowed.",
  },

  messages: {
    requiredField:
      "Please complete all required fields.",

    invalidNumber:
      "Please enter a valid number.",

    invalidPassengers:
      "Please enter at least one passenger.",

    luggageExceeded:
      "The selected vehicle does not have enough luggage capacity for your journey.",

    passengersExceeded:
      "The selected vehicle does not have enough passenger capacity for your journey.",

    babySeatRequired:
      "Please select at least one baby/child seat.",

    babySeatNotAllowed:
      "Baby/child seats are not available in the selected vehicle.",

    babySeatCapacityExceeded:
      "The number of passengers and baby seats exceeds the available seating capacity of this vehicle.",

    airportFlightRequired:
      "Please enter a flight number or select No Flight.",

    pointToPointDistanceExceeded:
      "Bookings above 200KM distance limit require contacting Oasis.",

    hourlyLimitExceeded:
      "Hourly bookings are limited to 12 hours and 60 km. For bookings exceeding these limits, please select Point-to-Point / Return Trip or contact us.",

    specialInstructionsExceeded:
      "Special instructions cannot exceed the maximum allowed length.",
  },

  labels: {
    title: "Book a Chauffeur",

    subtitle:
      "Complete your journey details to receive an estimated quote.",

    bookingType: "Booking Type",

    pointToPoint: "Point-to-Point",

    hourly: "Hourly / As Directed",

    pickupAddress: "Pickup Address",

    pickupSuburb: "Pickup Suburb",

    dropoffAddress: "Drop-off Address",

    dropoffSuburb: "Drop-off Suburb",

    pickupLocation: "Pickup Location Type",

    dropoffLocation: "Drop-off Location Type",

    pickupDate: "Pickup Date",

    pickupTime: "Pickup Time",

    returnDate: "Return Date",

    returnTime: "Return Time",

    passengers: "Passengers",

    suitcases: "Check-in Suitcases",

    smallBags: "Small / Carry-on Bags",

    vehicle: "Vehicle",

    babySeatRequired:
      "Do you require a child/baby seat?",

    rearFacing:
      "Rear-facing infant seat",

    forwardFacing:
      "Forward-facing child seat",

    specialInstructions:
      "Special Instructions",

    calculate: "Calculate Quote",

    summary: "Your Quote",

    distance: "Distance",

    baseFare: "Base Fare",

    distanceFare: "Distance Fare",

    levy: "Levy",

    parking: "Parking",

    tolls: "Tolls",

    total: "Total",

    recommended:
      "Recommended for Your Journey",

    suitable: "Suitable",

    notSuitable: "Not Suitable",

    passengerCapacity:
      "Passenger Capacity",

    luggageCapacity:
      "Luggage Capacity",

    babySeats: "Baby Seats",

    luggageGuide: "Luggage Guide",

    proceedCheckout:
      "Proceed to Checkout",
  },
}


function App() {






  useEffect(() => {
    if (!window.OasisWP?.restUrl) {
      console.log(
        "OasisWP is not available. Running outside WordPress."
      )

      setAuthChecked(true)
      return
    }

    fetch(`${window.OasisWP.restUrl}me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "X-WP-Nonce": window.OasisWP.nonce,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoggedIn(Boolean(data?.logged_in))
        setAuthChecked(true)

        console.log("Oasis current user:", data)
      })
      .catch((error) => {
        console.error("Oasis /me error:", error)
        setAuthChecked(true)
      })
  }, [])






  const rules = bookingRules
  const vehicleData = vehicles

  /*
   * --------------------------------------------------
   * FORM STATE
   * --------------------------------------------------
   */

  const [bookingType, setBookingType] =
    useState("point-to-point")

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [showAuthChoice, setShowAuthChoice] = useState(false)

  const [form, setForm] = useState({
    pickup: "",
    pickupSuburb: "",
    pickupLocation: null,

    dropoff: "",
    dropoffSuburb: "",
    dropoffLocation: null,

    pickupType: "normal",
    dropoffType: "normal",

    pickupDate: "",
    pickupTime: "",

    returnTrip: false,
    returnDate: "",
    returnTime: "",
    returnPickup: "",
    returnPickupSuburb: "",
    returnPickupLocation: null,
    returnDropoff: "",
    returnDropoffSuburb: "",
    returnDropoffLocation: null,

    passengers: 1,

    suitcases: 0,
    smallBags: 0,

    babySeatRequired: false,
    rearFacing: 0,
    forwardFacing: 0,

    vehicle: "",

    specialInstructions: "",

    stops: [],
  })

  /*
   * Temporary distance until Google Maps is connected.
   */
  const [distance, setDistance] =
    useState(
      rules.general?.testDistanceKm || 25
    )

  const [routeDurationMinutes, setRouteDurationMinutes] =
    useState(0)

  const [returnRouteDurationMinutes, setReturnRouteDurationMinutes] =
    useState(0)

  /*
   * Hourly booking duration.
   */
  const [hours, setHours] =
    useState(
      rules.hourly?.minimumHours || 3
    )

  const [message, setMessage] =
    useState("")

  const [messageType, setMessageType] =
    useState("")

  const [quote, setQuote] =
    useState(null)

  const [isCalculating, setIsCalculating] =
    useState(false)

  const [isCreatingBooking, setIsCreatingBooking] =
    useState(false)


  /*
   * --------------------------------------------------
   * FORM HELPERS
   * --------------------------------------------------
   */

  const updateForm = (field, value) => {
    clearFeedback()

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const clearFeedback = () => {
    setMessage("")
    setMessageType("")
    setQuote(null)
    toast.dismiss("oasis-feedback")
  }

  const handleBookingTypeChange = (value) => {
    clearFeedback()

    if (value !== "hourly") {
      /*
       * Stops exist only for Hourly / As Directed: switching to
       * Point-to-Point clears them so stale stops can never be
       * submitted or stored as Point-to-Point booking data.
       */
      setForm((current) => ({
        ...current,
        stops: [],
      }))
    }

    setBookingType(value)
  }

  useEffect(() => {
    if (message || quote) {
      setIsCalculating(false)
    }
  }, [message, quote])

  /*
   * Prevent background page scrolling while the auth-choice dialog
   * is open; the previous body overflow is restored on close.
   */
  useEffect(() => {
    if (!showAuthChoice) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showAuthChoice])

  useEffect(() => {
    if (!message) {
      return
    }

    const notify = messageType === "error"
      ? toast.error
      : toast.success

    notify(message, {
      id: "oasis-feedback",
      duration: messageType === "error" ? 5000 : 3500,
    })
  }, [message, messageType])

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: currentStep === 1 ? "auto" : "smooth",
    })
  }, [currentStep])


  const saveBookingDraft = () => {
    try {
      sessionStorage.setItem(
        "oasisBookingDraft",
        JSON.stringify({
          resumeAfterAuth: true,
          bookingType,
          form,
          hours,
          pickupFlightNumber,
          pickupNoFlight,
          dropoffFlightNumber,
          dropoffNoFlight,
        })
      )
    } catch (error) {
      console.error(
        "Oasis booking draft could not be saved:",
        error
      )
    }
  }

  const showValidationMessage = (text) => {
    setMessage(text)
    setMessageType("error")
  }

  const handleFirstStepContinue = () => {
    if (!String(form.pickup || "").trim() || !form.pickupLocation) {
      showValidationMessage(
        "Please select a pickup address from the Google suggestions."
      )
      return
    }

    if (!String(form.dropoff || "").trim() || !form.dropoffLocation) {
      showValidationMessage(
        "Please select a drop-off address from the Google suggestions."
      )
      return
    }

    if (!form.pickupDate || !form.pickupTime) {
      showValidationMessage(
        "Please select both the pickup date and pickup time."
      )
      return
    }

    if (isLoggedIn) {
      setCurrentStep(2)
      return
    }

    /*
     * Login is optional: logged-out users choose between the
     * existing My Account login/registration flow and continuing
     * as a guest without an account.
     */
    setShowAuthChoice(true)
  }

  const handleDetailsContinue = () => {
    const validation = validateBooking(
      {
        ...form,
        pickupFlightNumber,
        pickupNoFlight,
        dropoffFlightNumber,
        dropoffNoFlight,
      },
      rules
    )

    if (!validation.valid) {
      showValidationMessage(validation.message)
      return
    }

    setCurrentStep(3)
  }


  useEffect(() => {
    if (!authChecked || !isLoggedIn) {
      return
    }

    try {
      const savedDraft =
        sessionStorage.getItem("oasisBookingDraft")

      if (!savedDraft) {
        return
      }

      const draft = JSON.parse(savedDraft)

      if (draft.bookingType) {
        setBookingType(draft.bookingType)
      }

      if (draft.form) {
        setForm((current) => ({
          ...current,
          ...draft.form,
        }))
      }

      if (typeof draft.hours !== "undefined") {
        setHours(draft.hours)
      }

      if (typeof draft.pickupFlightNumber !== "undefined") {
        setPickupFlightNumber(
          draft.pickupFlightNumber
        )
      }

      if (typeof draft.pickupNoFlight !== "undefined") {
        setPickupNoFlight(
          draft.pickupNoFlight
        )
      }

      if (typeof draft.dropoffFlightNumber !== "undefined") {
        setDropoffFlightNumber(
          draft.dropoffFlightNumber
        )
      }

      if (typeof draft.dropoffNoFlight !== "undefined") {
        setDropoffNoFlight(
          draft.dropoffNoFlight
        )
      }

      if (draft.resumeAfterAuth) {
        setCurrentStep(2)
      }

      sessionStorage.removeItem(
        "oasisBookingDraft"
      )
    } catch (error) {
      console.error(
        "Oasis booking draft could not be restored:",
        error
      )
    }
  }, [authChecked, isLoggedIn])



  const redirectToMyAccount = () => {
    saveBookingDraft()

    const myAccountUrl =
      window.OasisWP?.myAccountUrl

    if (!myAccountUrl) {
      setMessage(
        "Unable to open the My Account page."
      )
      setMessageType("error")
      return
    }

    const accountUrl = new URL(
      myAccountUrl,
      window.location.origin
    )

    accountUrl.searchParams.set(
      "oasis_return_to",
      window.location.href
    )

    window.location.assign(accountUrl.toString())
  }

  const buildBookingPayload = () => {
    return {
      bookingType,

      pickup: form.pickup,
      pickupSuburb: form.pickupSuburb,
      pickupType: form.pickupType,

      dropoff: form.dropoff,
      dropoffSuburb: form.dropoffSuburb,
      dropoffType: form.dropoffType,

      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,

      pickupLocation: form.pickupLocation,

      pickupFlightNumber,
      pickupNoFlight,

      dropoffFlightNumber,
      dropoffNoFlight,

      returnTrip: form.returnTrip,

      returnDate: form.returnDate,
      returnTime: form.returnTime,

      returnPickup: form.returnPickup,
      returnPickupSuburb: form.returnPickupSuburb,
      returnPickupLocation: form.returnPickupLocation,
      returnPickupType: form.pickupType,

      returnDropoff: form.returnDropoff,
      returnDropoffSuburb: form.returnDropoffSuburb,
      returnDropoffLocation: form.returnDropoffLocation,
      returnDropoffType: form.dropoffType,

      passengers: Number(form.passengers || 0),

      suitcases: Number(form.suitcases || 0),
      smallBags: Number(form.smallBags || 0),

      babySeats: Number(form.rearFacing || 0),
      boosterSeats: Number(form.forwardFacing || 0),

      rearFacing: Number(form.rearFacing || 0),
      forwardFacing: Number(form.forwardFacing || 0),

      vehicle: form.vehicle,

      specialInstructions:
        form.specialInstructions,

      stops:
        bookingType === "hourly"
          ? (form.stops || [])
          : [],

      hours: Number(hours || 0),

      distance: Number(distance || 0),

      returnDistance:
        Number(quote?.returnDistance || 0),

      routeDurationMinutes:
        Number(routeDurationMinutes || 0),

      returnRouteDurationMinutes:
        Number(returnRouteDurationMinutes || 0),

      quote: quote || null,
    }
  }



  const createBookingAndProceedToCheckout = async () => {
    setIsCreatingBooking(true)

    try {
      const payload = buildBookingPayload()

      console.log(
        "OASIS DURATION STATE BEFORE POST:",
        routeDurationMinutes,
        returnRouteDurationMinutes
      )

      console.log(
        "OASIS BOOKING PAYLOAD:",
        payload
      )

      const response = await fetch(
        `${window.OasisWP.restUrl}bookings`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce":
              window.OasisWP.nonce,
          },

          body: JSON.stringify(payload),
        }
      )

      const data =
        await response.json()

      console.log(
        "OASIS BOOKING RESPONSE:",
        data
      )

      if (data.success && data.cart_url) {
        window.location.href = data.cart_url
        return
      }

      if (!response.ok) {
        setMessage(
          data?.message ||
          "Unable to create booking. Please try again."
        )

        setMessageType("error")

        console.log(
          "OASIS UI ERROR MESSAGE:",
          data?.message
        )
        return
      }

      setMessage(
        `Booking created successfully. Reference: ${data?.booking?.reference || ""
        }`
      )

      setMessageType("success")

    } catch (error) {
      console.error(
        "OASIS BOOKING ERROR:",
        error
      )
    } finally {
      setIsCreatingBooking(false)
    }
  }


  /*
   * --------------------------------------------------
   * CALCULATED VALUES
   * --------------------------------------------------
   */

  const luggageUnits = useMemo(
    () =>
      calculateLuggageUnits(
        form.suitcases,
        form.smallBags,
        rules
      ),
    [
      form.suitcases,
      form.smallBags,
      rules,
    ]
  )

  const babySeats = useMemo(
    () =>
      calculateBabySeats(
        form.rearFacing,
        form.forwardFacing
      ),
    [
      form.rearFacing,
      form.forwardFacing,
    ]
  )


  /*
   * --------------------------------------------------
   * VEHICLE RECOMMENDATIONS
   * --------------------------------------------------
   */

  const recommendations = useMemo(
    () =>
      getVehicleRecommendations(
        vehicleData,
        {
          passengers:
            form.passengers,

          luggageUnits,

          babySeats,

          babyRequired:
            form.babySeatRequired,
        },
        rules
      ),
    [
      vehicleData,
      form.passengers,
      luggageUnits,
      babySeats,
      form.babySeatRequired,
      rules,
    ]
  )


  /*
   * Automatically choose the first suitable vehicle
   * if the current selection is no longer suitable.
   */

  useMemo(() => {
    if (
      !recommendations.length
    ) {
      return
    }

    const current =
      recommendations.find(
        (item) =>
          item.key === form.vehicle
      )

    if (
      current?.suitable
    ) {
      return
    }

    const firstSuitable =
      recommendations.find(
        (item) =>
          item.suitable
      )

    if (firstSuitable) {
      setForm((currentForm) => ({
        ...currentForm,
        vehicle:
          firstSuitable.key,
      }))
    }
  }, [
    recommendations,
    form.vehicle,
  ])


  /*
   * --------------------------------------------------
   * LOCATION TYPES
   * --------------------------------------------------
   */

  const locationTypes =
    Object.entries(
      rules.airport?.types || {}
    ).map(
      ([value, data]) => ({
        value,
        label: data.label,
      })
    )


  /*
   * --------------------------------------------------
   * AIRPORT FLIGHT STATE
   * --------------------------------------------------
   *
   * We keep this separate for now because the current
   * working engine treats airport flight information
   * as conditional UI.
   */

  const [pickupFlightNumber, setPickupFlightNumber] =
    useState("")

  const [pickupNoFlight, setPickupNoFlight] =
    useState(false)

  const [dropoffFlightNumber, setDropoffFlightNumber] =
    useState("")

  const [dropoffNoFlight, setDropoffNoFlight] =
    useState(false)


  const pickupIsAirport =
    form.pickupType === "domestic-airport" ||
    form.pickupType === "international-airport"

  const dropoffIsAirport =
    form.dropoffType === "domestic-airport" ||
    form.dropoffType === "international-airport"


  /*
   * --------------------------------------------------
   * FLIGHT HANDLERS
   * --------------------------------------------------
   */

  const handlePickupFlightChange =
    (field, value) => {
      clearFeedback()

      if (field === "flightNumber") {
        setPickupFlightNumber(value)
      }

      if (field === "noFlight") {
        setPickupNoFlight(value)

        if (value) {
          setPickupFlightNumber("")
        }
      }
    }


  const handleDropoffFlightChange =
    (field, value) => {
      clearFeedback()

      if (field === "flightNumber") {
        setDropoffFlightNumber(value)
      }

      if (field === "noFlight") {
        setDropoffNoFlight(value)

        if (value) {
          setDropoffFlightNumber("")
        }
      }
    }


  /*
   * --------------------------------------------------
   * RETURN TRIP
   * --------------------------------------------------
   */

  const handleReturnTripChange =
    (enabled) => {
      clearFeedback()

      setForm((current) => ({
        ...current,

        returnTrip: enabled,

        ...(enabled
          ? {}
          : {
            returnDate: "",
            returnTime: "",
            returnPickup: "",
            returnPickupSuburb: "",
            returnPickupLocation: null,
            returnDropoff: "",
            returnDropoffSuburb: "",
            returnDropoffLocation: null,
          }),
      }))
    }


  /*
   * --------------------------------------------------
   * CALCULATE QUOTE
   * --------------------------------------------------
   */

  const calculateQuote = async () => {
    setIsCalculating(true)
    setMessage("")
    setMessageType("")
    setQuote(null)

    /*
     * Basic validation.
     */

    const validation =
      validateBooking(
        {
          ...form,

          pickupFlightNumber,
          pickupNoFlight,

          dropoffFlightNumber,
          dropoffNoFlight,

          specialInstructions:
            form.specialInstructions,
        },
        rules
      )

    if (!validation.valid) {
      setMessage(
        validation.message
      )

      setMessageType("error")

      return
    }


    /*
     * Vehicle must exist.
     */

    const selectedVehicle =
      vehicleData[form.vehicle]

    if (!selectedVehicle) {
      setMessage(
        "Please select a suitable vehicle."
      )

      setMessageType("error")

      return
    }


    /*
 * Calculate real driving distance using Google Routes.
 */

    if (
      !form.pickupLocation ||
      !form.dropoffLocation
    ) {
      setMessage(
        "Please select both pickup and drop-off addresses from the Google suggestions."
      )

      setMessageType("error")

      return
    }

    const route =
      await calculateRouteDistance(
        form.pickupLocation,
        form.dropoffLocation
      )

    if (!route) {
      setMessage(
        "Unable to calculate the driving distance. Please check the pickup and drop-off addresses and try again."
      )

      setMessageType("error")

      return
    }

    const realDistance =
      route.distanceKm

    setDistance(realDistance)

    setRouteDurationMinutes(
      Number(route.durationMinutes || 0)
    )


    let returnRoute = null
    let returnDistance = null

    if (form.returnTrip) {
      if (
        !form.returnPickupLocation ||
        !form.returnDropoffLocation
      ) {
        setMessage(
          "Please select both return pickup and return drop-off addresses from the Google suggestions."
        )

        setMessageType("error")

        return
      }

      returnRoute =
        await calculateRouteDistance(
          form.returnPickupLocation,
          form.returnDropoffLocation
        )

      if (!returnRoute) {
        setMessage(
          "Unable to calculate the return journey distance. Please check the return addresses and try again."
        )

        setMessageType("error")

        return
      }

      returnDistance =
        returnRoute.distanceKm

      setReturnRouteDurationMinutes(
        Number(returnRoute.durationMinutes || 0)
      )
    }


    if (!form.returnTrip) {
      setReturnRouteDurationMinutes(0)
    }



    if (
      form.returnTrip &&
      bookingType === "point-to-point"
    ) {
      const returnDistanceValidation =
        validatePointToPointDistance(
          returnDistance,
          rules
        )

      if (!returnDistanceValidation.valid) {
        setMessage(
          rules.messages
            ?.pointToPointDistanceExceeded
        )

        setMessageType("error")

        return
      }
    }



    /*
     * Temporary distance validation.
     */

    if (
      bookingType ===
      "point-to-point"
    ) {
      const distanceValidation =
        validatePointToPointDistance(
          realDistance,
          rules
        )

      if (
        !distanceValidation.valid
      ) {
        setMessage(
          rules.messages
            ?.pointToPointDistanceExceeded
        )

        setMessageType("error")

        return
      }
    }


    /*
     * Hourly validation.
     */

    if (
      bookingType === "hourly"
    ) {
      const hourlyValidation =
        validateHourly(
          hours,
          realDistance,
          rules
        )

      if (
        !hourlyValidation.valid
      ) {
        setMessage(
          rules.messages
            ?.hourlyLimitExceeded
        )

        setMessageType("error")

        return
      }
    }

    const suitableVehicle = recommendations.find(
      (item) => item.suitable
    )

    if (!suitableVehicle) {
      setMessage(
        "No suitable vehicle is available for the selected passenger, luggage and child-seat requirements."
      )
      setMessageType("error")
      setQuote(null)
      return
    }




    let calculatedQuote


    /*
     * POINT-TO-POINT
     */

    if (
      bookingType ===
      "point-to-point"
    ) {
      if (form.returnTrip) {

        console.log("OASIS OUTBOUND TOLL:", route.tolls)
        console.log("OASIS RETURN TOLL:", returnRoute.tolls)

        calculatedQuote =
          calculateReturnPointToPointQuote(
            selectedVehicle,

            distance,
            returnDistance,

            form.pickupType,
            form.dropoffType,

            "normal",
            "normal",

            rules,

            route.tolls,
            returnRoute.tolls,

            form.rearFacing,
            form.forwardFacing
          )
      } else {
        calculatedQuote =
          calculatePointToPointQuote(
            selectedVehicle,

            realDistance,

            form.pickupType,
            form.dropoffType,

            rules,

            route.tolls,

            form.rearFacing,
            form.forwardFacing
          )
      }
    }


    /*
     * HOURLY
     */

    if (
      bookingType === "hourly"
    ) {
      if (form.returnTrip) {
        calculatedQuote =
          calculateReturnHourlyQuote(
            selectedVehicle,

            hours,
            hours,

            form.pickupType,
            form.dropoffType,

            "normal",
            "normal",

            rules,

            route.tolls,
            returnRoute.tolls,

            form.rearFacing,
            form.forwardFacing
          )
      } else {
        calculatedQuote =
          calculateHourlyQuote(
            selectedVehicle,

            hours,

            form.pickupType,
            form.dropoffType,

            rules,

            route.tolls,

            form.rearFacing,
            form.forwardFacing
          )
      }
    }


    /*
     * Final quote.
     */
    console.log(
      "OASIS DURATION CHECK:",
      route.durationMinutes,
      returnRoute?.durationMinutes
    )


    setQuote({
      ...calculatedQuote,

      ...(calculatedQuote.outbound
        ? {
          outbound: {
            ...calculatedQuote.outbound,
            distance: realDistance,
          },

          inbound: {
            ...calculatedQuote.inbound,
            distance: returnDistance,
          },
        }
        : {}),

      distance: realDistance,
      returnDistance,

      routeDurationMinutes:
        Number(route.durationMinutes || 0),

      returnRouteDurationMinutes:
        Number(returnRoute?.durationMinutes || 0),

      hours,
      vehicle: selectedVehicle.name,
      bookingType,
      returnTrip: form.returnTrip,

      babySeats: Number(form.rearFacing || 0),
      boosterSeats: Number(form.forwardFacing || 0),
    })

    setMessage("Quote calculated successfully.")
    setMessageType("success")

    setTimeout(() => {
      document
        .getElementById("oasis-quote-summary")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
    }, 100)
  }


  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <>
      <Toaster
        position="bottom-center"
        containerStyle={{
          bottom: 24,
          zIndex: 2147483647,
        }}
        toastOptions={{
          duration: 4500,
          style: {
            padding: "14px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
          },
          success: {
            style: {
              background: "#edf8ef",
              color: "#226b33",
              border: "1px solid #b9ddbf",
            },
          },
          error: {
            style: {
              background: "#fff1f1",
              color: "#a52626",
              border: "1px solid #efc2c2",
            },
          },
        }}
      />

      <main key={currentStep} className="oasis-booking-shell oasis-step-transition mx-auto w-full max-w-[980px] px-4 py-5 text-[15px] leading-[1.5] text-[#222] sm:px-6 sm:py-8">

      {/* Header */}

      <header className="mb-7">
        <h2 className="m-0 mb-[6px] text-[30px] font-semibold tracking-[-0.025em] text-[#222]">
          {rules.labels.title}
        </h2>

        <p className="m-0 text-[13px] text-[#666]">
          {rules.labels.subtitle}
        </p>
      </header>

      <BookingProgress currentStep={currentStep} />

      {/* Booking Type */}

      {currentStep === 1 && (
        <>
          <BookingType
            bookingType={bookingType}
            onChange={handleBookingTypeChange}
          />

          <JourneyDetails
            form={form}
            onChange={updateForm}
            locationTypes={locationTypes}
            showAdditionalDetails={false}
            showFlightSection={pickupIsAirport || dropoffIsAirport}
            flightNumber={pickupIsAirport ? pickupFlightNumber : dropoffFlightNumber}
            noFlight={pickupIsAirport ? pickupNoFlight : dropoffNoFlight}
            onFlightChange={
              pickupIsAirport
                ? handlePickupFlightChange
                : handleDropoffFlightChange
            }
          />

          <button
            type="button"
            onClick={handleFirstStepContinue}
            disabled={!authChecked}
            className="oasis-primary-button mt-6 flex min-h-[56px] w-full items-center justify-center rounded-[12px] px-5 text-[15px] font-semibold transition"
          >
            Continue
            <span className="ml-2">→</span>
          </button>
        </>
      )}


      {/* Hourly */}

      {currentStep === 2 && (
        <>

          <JourneyDetails
            form={form}
            onChange={updateForm}
            locationTypes={locationTypes}
            showAdditionalDetails={true}
            showFlightSection={pickupIsAirport || dropoffIsAirport}
            flightNumber={
              pickupIsAirport
                ? pickupFlightNumber
                : dropoffFlightNumber
            }
            noFlight={
              pickupIsAirport
                ? pickupNoFlight
                : dropoffNoFlight
            }
            onFlightChange={
              pickupIsAirport
                ? handlePickupFlightChange
                : handleDropoffFlightChange
            }
          />


          {bookingType === "hourly" && (
            <section className="mb-[14px] rounded-[8px] bg-white px-8 py-6 border-none">

              <div className="mb-[18px]">
                <h3 className="m-0 mb-[5px] text-[19px] font-semibold">
                  Hourly / As Directed
                </h3>

                <p className="m-0 text-[12px] text-[#6d6d6d]">
                  Minimum {rules.hourly.minimumHours} hours,
                  maximum {rules.hourly.maximumHours} hours
                  and {rules.hourly.maximumDistanceKm} km.
                </p>
              </div>

              <select
                value={hours}
                onChange={(e) => {
                  clearFeedback()
                  setHours(e.target.value)
                }}
                className="w-full min-h-[46px] rounded-[5px] border border-[#d8d8d8] bg-white px-3 py-[10px] outline-none"
              >
                <option value="">
                  Select hours
                </option>

                {Array.from(
                  {
                    length:
                      rules.hourly.maximumHours -
                      rules.hourly.minimumHours +
                      1,
                  },
                  (_, index) => {
                    const value =
                      rules.hourly.minimumHours +
                      index

                    return (
                      <option
                        key={value}
                        value={value}
                      >
                        {value} {value === 1 ? "hour" : "hours"}
                      </option>
                    )
                  }
                )}
              </select>


            </section>
          )}

          <br />


          {/* Return Trip */}

          <ReturnTrip
            enabled={form.returnTrip}
            onChange={handleReturnTripChange}
            form={{
              ...form,
              onChange: updateForm,
            }}
          />


          {/* Passenger / luggage */}

          <PassengerLuggage
            form={form}
            onChange={updateForm}
            luggageUnits={luggageUnits}
            luggageInstruction={
              rules.luggage.instruction
            }
          />


          {/* Baby seats */}

          {rules.babySeats?.enabled && (
            <BabySeats
              form={form}
              onChange={updateForm}
              babySeatInstruction={
                rules.babySeats.instruction
              }
            />
          )}





          {/* Additional stops (Hourly / As Directed only) */}

          {bookingType === "hourly" && (
            <AdditionalStops
              stops={form.stops || []}
              onAddStop={() =>
                updateForm("stops", [
                  ...(form.stops || []),
                  "",
                ])
              }
              onRemoveStop={(index) =>
                updateForm(
                  "stops",
                  (form.stops || []).filter(
                    (_, i) => i !== index
                  )
                )
              }
              onStopChange={(index, value) =>
                updateForm(
                  "stops",
                  (form.stops || []).map((stop, i) =>
                    i === index ? value : stop
                  )
                )
              }
            />
          )}

          {/* Special instructions */}

          {rules.specialInstructions?.enabled && (
            <SpecialInstructions
              value={
                form.specialInstructions
              }
              onChange={(value) =>
                updateForm(
                  "specialInstructions",
                  value
                )
              }
              maximumCharacters={
                rules.specialInstructions
                  .maximumCharacters
              }
            />
          )}






          <div className="w-full mt-6 flex flex-col gap-3 border-[#eeeeee] pt-5">
            <button
              type="button"
              onClick={() => {
                clearFeedback()
                setCurrentStep(1)
              }}
              className="min-h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-5 text-[15px] font-semibold text-[#222] transition hover:bg-[#f7f7f5] sm:w-full"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleDetailsContinue}
              className="oasis-primary-button min-h-[52px] w-full rounded-[10px] px-5 text-[15px] font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition sm:w-full"
            >
              Continue
              <span className="ml-2">→</span>
            </button>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <VehicleSelection
            vehicles={vehicleData}
            vehicleImages={window.OasisWP?.vehicleImages || {}}
            recommendations={recommendations}
            selectedVehicle={form.vehicle}
            onSelect={(vehicle) =>
              updateForm(
                "vehicle",
                vehicle
              )
            }
            labels={rules.labels}
          />

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                clearFeedback()
                setCurrentStep(2)
              }}
              className="min-h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-5 text-[15px] font-semibold text-[#222] transition hover:bg-[#f7f7f5]"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => {
                clearFeedback()
                setCurrentStep(4)
              }}
              disabled={!form.vehicle}
              className="oasis-primary-button min-h-[52px] w-full rounded-[10px] px-5 text-[15px] font-semibold transition disabled:opacity-40"
            >
              Review
              <span className="ml-2">→</span>
            </button>
          </div>
        </>
      )}






      {currentStep === 4 && (
        <>
          {!quote && (
            <button
              type="button"
              onClick={() => {
                clearFeedback()
                setCurrentStep(3)
              }}
              className="mb-3 min-h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-5 text-[15px] font-semibold text-[#222] transition hover:bg-[#f7f7f5]"
            >
              ← Back to Vehicle
            </button>
          )}

          <button
            type="button"
            onClick={calculateQuote}
            disabled={isCalculating}
            className="
                w-full
                min-h-[52px]
                rounded-[10px]
                px-5 py-3
                font-semibold
                transition-colors
                oasis-primary-button
                disabled:cursor-wait
                disabled:opacity-70
                my-1
            "
          >
            {isCalculating
              ? "Calculating your quote..."
              : rules.labels.calculate}
          </button>
        </>
      )}



      {/* temporary button to test booking creation */}













      {/* Quote */}

      {quote && (
        <div id="oasis-quote-summary">
          {currentStep === 4 && (
            <>
              <QuoteSummary
                quote={quote}
                currency={rules.general.currency}
                labels={rules.labels}
                onProceedToCheckout={
                  createBookingAndProceedToCheckout
                }
                isCreatingBooking={isCreatingBooking}
              />

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    clearFeedback()
                    setCurrentStep(3)
                  }}
                  className="min-h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-5 text-[15px] font-semibold text-[#222] transition hover:bg-[#f7f7f5]"
                >
                  ← Back to Vehicle
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/*
       * Authentication choice modal (logged-out users).
       *
       * Rendered through createPortal into document.body: the step
       * transition animation on <main> makes it a containing block
       * for position:fixed, which anchored the old overlay to the
       * scroll position instead of the viewport. The portal also
       * keeps the dialog out of reach of theme CSS scoped to #root.
       */}

      {showAuthChoice &&
        createPortal(
          <div className="oasis-auth-overlay">
            <div
              role="dialog"
              aria-modal="true"
              className="oasis-auth-dialog"
            >
              <button
                type="button"
                onClick={() => setShowAuthChoice(false)}
                aria-label="Close"
                className="oasis-auth-close"
              >
                ✕
              </button>

              <AuthCheckpoint
                onLogin={redirectToMyAccount}
                onGuest={() => {
                  setShowAuthChoice(false)
                  setCurrentStep(2)
                }}
              />
            </div>
          </div>,
          document.body
        )}

      </main>
    </>
  )
}

export default App
