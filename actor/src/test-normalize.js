import { normalizeFlights, normalizeHotels } from './normalize.js';

const flights = [
    {
        price: 2562,
        currency: 'USD',
        departureTime: '8:55 PM',
        arrivalTime: '9:50 AM',
        durationMinutes: 775,
        stops: 1,
        airline: 'Turkish Airlines',
        airlineCode: 'TK',
        departureAirport: 'LOS',
        arrivalAirport: 'LHR',
        cabin: 'economy',
        outboundDate: '2026-10-15',
    },
    {
        price: 2562,
        currency: 'USD',
        departureTime: '8:55 PM',
        arrivalTime: '9:50 AM',
        durationMinutes: 775,
        stops: 1,
        airline: 'Turkish Airlines',
        airlineCode: 'TK',
        departureAirport: 'LOS',
        arrivalAirport: 'LHR',
        cabin: 'economy',
        outboundDate: '2026-10-15',
    },
    {
        price: 4948,
        currency: 'USD',
        departureTime: '10:50 PM',
        arrivalTime: '5:20 AM',
        durationMinutes: 390,
        stops: 0,
        airline: 'British Airways',
        airlineCode: 'BA',
        departureAirport: 'LOS',
        arrivalAirport: 'LHR',
        cabin: 'economy',
        outboundDate: '2026-10-15',
    },
];

const hotels = [
    {
        hotelId: 6658285,
        name: 'City Prime Camden',
        address: '376-380 Camden Road',
        city: 'Greater London',
        reviewScore: 9.1,
        reviewCount: 3039,
        price: 'COP 2,924,300',
        currency: 'COP',
        searchCheckIn: '2026-10-15',
        searchCheckOut: '2026-10-20',
        searchAdults: 3,
        searchChildren: 0,
        url: 'https://www.booking.com/example',
    },
];

const normalizedFlights = normalizeFlights(flights);
const normalizedHotels = normalizeHotels(hotels);

console.log('Original flights:', flights.length);
console.log('Normalized flights:', normalizedFlights.length);
console.log('Normalized hotels:', normalizedHotels.length);

console.log('\nFlights:');
console.log(JSON.stringify(normalizedFlights, null, 2));

console.log('\nHotels:');
console.log(JSON.stringify(normalizedHotels, null, 2));