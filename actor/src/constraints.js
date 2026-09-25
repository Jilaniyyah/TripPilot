export function filterFlightsByConstraints(flights = [], requirements = {}) {
    const maxStops = requirements?.max_stops?.value;

    // No hard max-stops constraint was provided.
    if (maxStops === null || maxStops === undefined) {
        return {
            flights,
            appliedConstraints: [],
            removedCount: 0,
        };
    }

    // Only apply the constraint when Groq extracted a numeric value.
    if (typeof maxStops !== 'number' || !Number.isFinite(maxStops)) {
        return {
            flights,
            appliedConstraints: [],
            removedCount: 0,
        };
    }

    const filteredFlights = flights.filter((flight) => {
        if (typeof flight.stops !== 'number') {
            return true;
        }

        return flight.stops <= maxStops;
    });

    return {
        flights: filteredFlights,
        appliedConstraints: [
            {
                constraint: 'max_stops',
                value: maxStops,
            },
        ],
        removedCount: flights.length - filteredFlights.length,
    };
}