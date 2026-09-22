export const vehicles = {
    'bmw-7-series': {
        name: 'BMW 7 Series',
        category: 'Premium Euro Sedans',

        capacity: {
            passengers: 2,
            luggageUnits: 4,
            babySeatsAllowed: false,
        },

        pricing: {
            baseFare: 95,
            distanceRate11to100: 4.50,
            distanceRate101plus: 3.25,
        },

        hourly: {
            rate: 120,
            baseFare: 75,
            after4HoursBaseFare: 35,
        },
    },

    'lexus-es300h': {
        name: 'Lexus ES300h',
        category: 'Executive Sedan',

        capacity: {
            passengers: 2,
            luggageUnits: 4,
            babySeatsAllowed: false,
        },

        pricing: {
            baseFare: 85,
            distanceRate11to100: 3.50,
            distanceRate101plus: 3,
        },

        hourly: {
            rate: 85,
            baseFare: 50,
            after4HoursBaseFare: 25,
        },
    },

    'mercedes-glc': {
        name: 'Mercedes GLC',
        category: 'Premium Euro SUV',

        capacity: {
            passengers: 3,
            luggageUnits: 8,
            babySeatsAllowed: true,
        },

        pricing: {
            baseFare: 85,
            distanceRate11to100: 4.50,
            distanceRate101plus: 3.50,
        },

        hourly: {
            rate: 110,
            baseFare: 75,
            after4HoursBaseFare: 35,
        },
    },

    'mercedes-v-class': {
        name: 'Mercedes V-Class',
        category: 'People Movers',

        capacity: {
            passengers: 6,
            luggageUnits: 12,
            babySeatsAllowed: true,
        },

        pricing: {
            baseFare: 95,
            distanceRate11to100: 5.75,
            distanceRate101plus: 4.75,
        },

        hourly: {
            rate: 150,
            baseFare: 75,
            after4HoursBaseFare: 35,
        },
    },

    'kia-carnival': {
        name: 'Kia Carnival',
        category: 'People Movers',

        capacity: {
            passengers: 5,
            luggageUnits: 12,
            babySeatsAllowed: true,
        },

        pricing: {
            baseFare: 85,
            distanceRate11to100: 5.25,
            distanceRate101plus: 4.25,
        },

        hourly: {
            rate: 110,
            baseFare: 50,
            after4HoursBaseFare: 25,
        },
    },
};

export default vehicles;