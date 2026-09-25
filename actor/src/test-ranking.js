import { rankFlights } from './ranking.js';

const flights = [
    {
        type: 'flight',
        airline: 'Turkish Airlines',
        airlineCode: 'TK',
        origin: 'LOS',
        destination: 'LHR',
        departureDate: '2026-10-15',
        departureTime: '8:55 PM',
        arrivalTime: '9:50 AM',
        durationMinutes: 775,
        stops: 1,
        price: 2562,
        currency: 'USD',
        cabin: 'economy',
        source: 'Google Flights',
    },
    {
        type: 'flight',
        airline: 'British Airways',
        airlineCode: 'BA',
        origin: 'LOS',
        destination: 'LHR',
        departureDate: '2026-10-15',
        departureTime: '10:50 PM',
        arrivalTime: '5:20 AM',
        durationMinutes: 390,
        stops: 0,
        price: 4948,
        currency: 'USD',
        cabin: 'economy',
        source: 'Google Flights',
    },
];

const requirements = {
    budget: {
        value: 'reasonably priced',
        status: 'explicit',
    },
    layover_preferences: {
        value: 'minimal stops',
        status: 'explicit',
    },
};

const rankedFlights = rankFlights(flights, requirements);

console.log('Ranked flights:');

rankedFlights.forEach((flight, index) => {
    console.log(
        `${index + 1}. ${flight.airline} | ` +
        `$${flight.price} | ` +
        `${flight.stops} stop(s) | ` +
        `${flight.durationMinutes} mins | ` +
        `Score: ${flight.recommendationScore}`,
    );

    console.log('Weights:', flight.scoringFactors);
});