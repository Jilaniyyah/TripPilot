import { explainRecommendations } from './groq.js';

const requirements = {
    origin: {
        value: 'Lagos',
        status: 'explicit',
    },
    destination: {
        value: 'London',
        status: 'explicit',
    },
    budget: {
        value: 'reasonably priced',
        status: 'explicit',
    },
    layover_preferences: {
        value: 'minimal stops',
        status: 'explicit',
    },
    number_of_travellers: {
        value: 4,
        status: 'explicit',
    },
    elderly: {
        value: 1,
        status: 'explicit',
    },
    infants: {
        value: 1,
        status: 'explicit',
    },
};

const rankedFlights = [
    {
        type: 'flight',
        airline: 'British Airways',
        origin: 'LOS',
        destination: 'LHR',
        departureDate: '2026-10-15',
        durationMinutes: 390,
        stops: 0,
        price: 4941,
        currency: 'USD',
        recommendationScore: null,
        scoringFactors: {
            priceWeight: null,
            stopWeight: null,
            durationWeight: null,
        },
        rankingStatus: 'single_candidate',
        rankingNote:
            'Only one unique flight option was available, so comparative scoring was not applied.',
    },
];

const rankedHotels = [
    {
        type: 'hotel',
        name: 'City Prime Camden',
        reviewScore: 9.1,
        reviewCount: 3039,
        price: 'COP 2,924,300',
        currency: 'COP',
        recommendationScore: 75,
    },
    {
        type: 'hotel',
        name: 'Modern Spacious Rooms',
        reviewScore: 6.9,
        reviewCount: 500,
        price: 'COP 2,071,480',
        currency: 'COP',
        recommendationScore: 65,
    },
    {
        type: 'hotel',
        name: 'Moxy London Piccadilly Circus',
        reviewScore: 8.2,
        reviewCount: 1500,
        price: 'COP 4,297,140',
        currency: 'COP',
        recommendationScore: 21,
    },
];

try {
    console.log('Generating recommendation explanations...');

    const explanations = await explainRecommendations({
        requirements,
        rankedFlights,
        rankedHotels,
    });

    console.log('\nGroq explanations:');
    console.log(JSON.stringify(explanations, null, 2));
} catch (error) {
    console.error('Explanation test failed.');
    console.error(error.message);
}