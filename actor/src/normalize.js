export function normalizeFlights(flights = []) {
    const normalized = flights.map((flight) => ({
        type: 'flight',
        airline: flight.airline || null,
        airlineCode: flight.airlineCode || null,
        origin: flight.departureAirport || null,
        destination: flight.arrivalAirport || null,
        departureDate: flight.outboundDate || null,
        departureTime: flight.departureTime || null,
        arrivalTime: flight.arrivalTime || null,
        durationMinutes: flight.durationMinutes ?? null,
        stops: flight.stops ?? null,
        price: flight.price ?? null,
        currency: flight.currency || null,
        cabin: flight.cabin || null,
        source: 'Google Flights',
        scrapedAt: flight.scrapedAt || null,
    }));

    // Remove duplicate flight results.
    const seen = new Set();

    return normalized.filter((flight) => {
        const key = [
            flight.airline,
            flight.origin,
            flight.destination,
            flight.departureDate,
            flight.departureTime,
            flight.arrivalTime,
            flight.durationMinutes,
            flight.stops,
            flight.price,
        ].join('|');

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export function normalizeHotels(hotels = []) {
    return hotels.map((hotel) => ({
        type: 'hotel',
        hotelId: hotel.hotelId || null,
        name: hotel.name || null,
        address: hotel.address || null,
        city: hotel.city || null,
        reviewScore: hotel.reviewScore ?? null,
        reviewCount: hotel.reviewCount ?? null,
        price: hotel.price || null,
        currency: hotel.currency || null,
        checkIn: hotel.searchCheckIn || null,
        checkOut: hotel.searchCheckOut || null,
        adults: hotel.searchAdults ?? null,
        children: hotel.searchChildren ?? null,
        url: hotel.url || null,
        source: 'Booking.com',
    }));
}