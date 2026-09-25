import { searchHotels } from './hotels.js';

try {
    const hotels = await searchHotels({
        destination: 'London',
        checkIn: '2026-10-15',
        checkOut: '2026-10-20',
        adults: 3,
        children: 0,
    });

    console.log(`Found ${hotels.length} hotel results.`);
    console.log(JSON.stringify(hotels.slice(0, 3), null, 2));
} catch (error) {
    console.error('Hotel search failed.');
    console.error(error.message);
}