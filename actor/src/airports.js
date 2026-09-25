const airportMap = {
    lagos: 'LOS',
    london: 'LHR',
    abuja: 'ABV',
    accra: 'ACC',
    dubai: 'DXB',
    paris: 'CDG',
    'new york': 'JFK',
};

export function getAirportCode(location) {
    if (!location) {
        return null;
    }

    const normalizedLocation = location.trim().toLowerCase();

    return airportMap[normalizedLocation] || null;
}