import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

try {
    const user = await client.user().get();

    console.log('Apify connection successful');
    console.log(`Logged in as: ${user.username}`);
} catch (error) {
    console.error('Apify connection failed');
    console.error(error.message);
}