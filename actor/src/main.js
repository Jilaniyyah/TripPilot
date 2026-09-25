import { Actor, log } from 'apify';
import { 
    extractTripRequirements,
    explainRecommendations, 
} from './groq.js';
import { searchFlights } from './flights.js';
import { searchHotels } from './hotels.js';
import { getAirportCode } from './airports.js';
import { normalizeFlights, normalizeHotels } from './normalize.js';
import { rankFlights, rankHotels } from './ranking.js';
import { filterFlightsByConstraints } from './constraints.js';

await Actor.init();

const input = await Actor.getInput();
const request = input?.request;

if (!request) {
    log.warning('No travel request was provided.');

    await Actor.pushData({
        status: 'needs_clarification',
        missing: ['request'],
        question: 'Please describe your travel requirements.',
    });

    await Actor.exit();
}

log.info(`TripPilot received: ${request}`);
log.info('Sending travel request to Groq for interpretation...');

try {
    const interpretation = await extractTripRequirements(request);

    log.info('Groq successfully extracted travel requirements.');

    // Stop here if TripPilot needs more information.
    if (interpretation.status === 'needs_clarification') {
        log.info('TripPilot needs clarification before research can begin.');

        await Actor.pushData({
            status: 'needs_clarification',
            request,
            requirements: interpretation,
            question: interpretation.clarification_question,
        });

        await Actor.exit();
    }

    const requirements = interpretation.requirements;

    const originAirport = getAirportCode(requirements.origin.value);
    const destinationAirport = getAirportCode(
        requirements.destination.value,
    );

    // Stop if our demo airport resolver does not know the route.
    if (!originAirport || !destinationAirport) {
        log.warning('Could not resolve one or more airport codes.');

        await Actor.pushData({
            status: 'needs_clarification',
            request,
            error: 'Unsupported airport or city for this demo.',
            origin: requirements.origin.value,
            destination: requirements.destination.value,
        });

        await Actor.exit();
    }

    log.info(
        `Resolved route: ${requirements.origin.value} (${originAirport}) → ` +
        `${requirements.destination.value} (${destinationAirport})`,
    );

    log.info('Starting Google Flights research...');

    const flights = await searchFlights({
        originAirport,
        destinationAirport,
        outboundDate: requirements.departure_date.value,
        adults:
            requirements.number_of_travellers.value -
            (requirements.children.value || 0) -
            (requirements.infants.value || 0),
        children: requirements.children.value || 0,
        infants: requirements.infants.value || 0,
    });

    log.info(`Google Flights research returned ${flights.length} results.`);

    log.info('Starting Booking.com hotel research...');

    const hotels = await searchHotels({
        destination: requirements.destination.value,
        checkIn: requirements.departure_date.value,
        checkOut: requirements.return_date.value,
        adults:
            requirements.number_of_travellers.value -
            (requirements.children.value || 0) -
            (requirements.infants.value || 0),
        children: requirements.children.value || 0,
    });

    log.info(`Booking.com research returned ${hotels.length} results.`);

    log.info('Normalizing research results...');

    const normalizedFlights = normalizeFlights(flights);
    const normalizedHotels = normalizeHotels(hotels);

    log.info(
        `Normalization complete: ${normalizedFlights.length} flights, ` +
        `${normalizedHotels.length} hotels.`,
    );

    log.info('Applying hard flight constraints...');

    const flightConstraintResult = filterFlightsByConstraints(
        normalizedFlights,
        requirements,
    );

    log.info(
        `Constraint filtering complete: ${flightConstraintResult.removedCount} flights removed.`,
    );

    log.info('Ranking flights against traveller preferences...');

    const rankedFlights = rankFlights(
        flightConstraintResult.flights,
        requirements,
    );
    log.info(`Flight ranking complete: ${rankedFlights.length} ranked flights.`);

    log.info('Ranking hotels against traveller preferences...');

    const rankedHotels = rankHotels(
        normalizedHotels,
        requirements,
    );

    log.info(`Hotel ranking complete: ${rankedHotels.length} ranked hotels.`);

    log.info('Generating explainable recommendations with Groq...');

    const explanations = await explainRecommendations({
        requirements,
        rankedFlights,
        rankedHotels,
    });

    log.info('Recommendation explanations generated successfully.');

    await Actor.pushData({
        status: 'research_completed',
        request,
        interpretation,
        research: {
            constraints: {
                applied: flightConstraintResult.appliedConstraints,
                flightsRemoved: flightConstraintResult.removedCount,
            },
            flights: rankedFlights,
            hotels: rankedHotels,
        },
        explanations,
    });

    const chargeResult = await Actor.charge({
        eventName: 'trip-research',
    });

    log.info(
        `Pay-per-event charge processed: ${chargeResult.chargedCount} trip-research event(s).`,
    );

    log.info('TripPilot travel research completed successfully.');
} catch (error) {
    log.error(`TripPilot failed: ${error.message}`);

    await Actor.pushData({
        status: 'failed',
        request,
        error: error.message,
    });
}

await Actor.exit();