import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const BOOKING_ACTOR = 'datascrapers/booking-com-scraper';

export async function searchHotels({
    destination,
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
}) {
    const input = {
        searchQueries: [destination],
        checkIn,
        checkOut,
        adults,
        children,
        rooms: 1,
        maxItems: 10,
        hotelDetails: false,
        scrapeAvailability: false,
        scrapeReviews: false,
        currency: 'USD',
    };

    console.log(
        `Searching hotels: ${destination}, ${checkIn} → ${checkOut}`,
    );

    const run = await client.actor(BOOKING_ACTOR).call(input);

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems();

    return items;
}