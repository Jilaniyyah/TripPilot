import { rankHotels } from './ranking.js';

const hotels = [
    {
        type: 'hotel',
        name: 'City Prime Camden',
        reviewScore: 9.1,
        reviewCount: 3039,
        price: 'COP 2,924,300',
        currency: 'COP',
        city: 'Greater London',
        source: 'Booking.com',
    },
    {
        type: 'hotel',
        name: 'Moxy London Piccadilly Circus',
        reviewScore: 8.2,
        reviewCount: 1500,
        price: 'COP 4,297,140',
        currency: 'COP',
        city: 'London',
        source: 'Booking.com',
    },
    {
        type: 'hotel',
        name: 'Modern Spacious Rooms',
        reviewScore: 6.9,
        reviewCount: 500,
        price: 'COP 2,071,480',
        currency: 'COP',
        city: 'London',
        source: 'Booking.com',
    },
];

const requirements = {
    budget: {
        value: 'reasonably priced',
        status: 'explicit',
    },
};

const rankedHotels = rankHotels(hotels, requirements);

console.log('Ranked hotels:');

rankedHotels.forEach((hotel, index) => {
    console.log(
        `${index + 1}. ${hotel.name} | ` +
        `${hotel.price} | ` +
        `Rating: ${hotel.reviewScore} | ` +
        `Score: ${hotel.recommendationScore}`,
    );

    console.log('Factors:', hotel.scoringFactors);
});