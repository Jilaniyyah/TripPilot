import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApifyClient } from 'apify-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'TripPilot Backend API',
    });
});

app.post('/api/trip-search', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a trip request.',
            });
        }

        console.log('Received trip request:', message);

        const run = await apifyClient
            .actor(process.env.TRIPPILOT_ACTOR_ID)
            .call({
                request: message.trim(),
            });

        console.log(`TripPilot Actor run finished: ${run.status}`);

        const { items } = await apifyClient
            .dataset(run.defaultDatasetId)
            .listItems();

        if (!items.length) {
            return res.status(502).json({
                status: 'error',
                message: 'TripPilot completed without returning a result.',
            });
        }

        return res.status(200).json(items[0]);
    } catch (error) {
        console.error('Trip search failed:', error.message);

        return res.status(500).json({
            status: 'failed',
            message: 'Trip research could not be completed.',
        });
    }
});

app.listen(PORT, () => {
    console.log(`TripPilot Backend API running on port ${PORT}`);
});