import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const GOOGLE_FLIGHTS_ACTOR = 'crawlerbros/google-flights-scraper';

export async function searchFlights({
    originAirport,
    destinationAirport,
    outboundDate,
    adults = 1,
    children = 0,
    infants = 0,
}) {
    const input = {
        originAirport,
        destinationAirport,
        outboundDate,
        adults,
        children,
        infants,
        maxResults: 10,
    };

    console.log(
        `Searching flights: ${originAirport} → ${destinationAirport} on ${outboundDate}`,
    );

    const run = await client.actor(GOOGLE_FLIGHTS_ACTOR).call(input);

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems();

    return items;
}