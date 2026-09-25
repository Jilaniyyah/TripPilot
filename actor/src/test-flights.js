import { searchFlights } from './flights.js';

try {
    const flights = await searchFlights({
        originAirport: 'LOS',
        destinationAirport: 'LHR',
        outboundDate: '2026-10-15',
        adults: 3,
        children: 0,
        infants: 1,
    });

    console.log(`Found ${flights.length} flight results.`);
    console.log(JSON.stringify(flights.slice(0, 3), null, 2));
} catch (error) {
    console.error('Flight search failed.');
    console.error(error.message);
}