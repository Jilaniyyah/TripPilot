export function rankFlights(flights = [], requirements = {}) {
    if (flights.length === 0) {
        return [];
    }

    const validFlights = flights.filter(
        (flight) =>
            typeof flight.price === 'number' &&
            typeof flight.stops === 'number' &&
            typeof flight.durationMinutes === 'number',
    );

    if (validFlights.length === 0) {
        return [];
    }

    if (validFlights.length === 1) {
    return [
        {
            ...validFlights[0],
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
}

    // Only compare prices within the same currency.
    const currencies = [...new Set(validFlights.map((flight) => flight.currency))];

    const canComparePrices = currencies.length === 1;

    const prices = validFlights.map((flight) => flight.price);
    const durations = validFlights.map((flight) => flight.durationMinutes);
    const stops = validFlights.map((flight) => flight.stops);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    const minStops = Math.min(...stops);
    const maxStops = Math.max(...stops);

    const normalize = (value, min, max) => {
        if (max === min) {
            return 0;
        }

        return (value - min) / (max - min);
    };

    const wantsMinimalStops =
        requirements.layover_preferences?.value
            ?.toLowerCase()
            .includes('minimal stops') || false;

    const wantsReasonablePrice =
        requirements.budget?.value
            ?.toString()
            .toLowerCase()
            .includes('reasonably priced') || false;

    return validFlights
        .map((flight) => {
            const pricePenalty = canComparePrices
                ? normalize(flight.price, minPrice, maxPrice)
                : 0;

            const stopPenalty = normalize(
                flight.stops,
                minStops,
                maxStops,
            );

            const durationPenalty = normalize(
                flight.durationMinutes,
                minDuration,
                maxDuration,
            );

            let priceWeight = 0.4;
            let stopWeight = 0.35;
            let durationWeight = 0.25;

            if (wantsMinimalStops) {
                stopWeight += 0.15;
                priceWeight -= 0.1;
                durationWeight -= 0.05;
            }

            if (wantsReasonablePrice) {
                priceWeight += 0.15;
                stopWeight -= 0.1;
                durationWeight -= 0.05;
            }

            const penalty =
                pricePenalty * priceWeight +
                stopPenalty * stopWeight +
                durationPenalty * durationWeight;

            const score = Math.round((1 - penalty) * 100);

            return {
                ...flight,
                recommendationScore: score,
                scoringFactors: {
                    priceWeight: Number(priceWeight.toFixed(2)),
                    stopWeight: Number(stopWeight.toFixed(2)),
		    durationWeight: Number(durationWeight.toFixed(2)),
                },
             };
        })
        .sort(
            (a, b) =>
                b.recommendationScore - a.recommendationScore,
        );
}

export function rankHotels(hotels = [], requirements = {}) {
    if (hotels.length === 0) {
        return [];
    }

    const parsePrice = (price) => {
        if (!price || typeof price !== 'string') {
            return null;
        }

        const numericValue = Number(
            price.replace(/[^\d.]/g, ''),
        );

        return Number.isFinite(numericValue)
            ? numericValue
            : null;
    };

    const preparedHotels = hotels.map((hotel) => ({
        ...hotel,
        numericPrice: parsePrice(hotel.price),
    }));

    // Prices are only comparable when every hotel uses the same currency.
    const currencies = [
        ...new Set(
            preparedHotels
                .map((hotel) => hotel.currency)
                .filter(Boolean),
        ),
    ];

    const canComparePrices = currencies.length === 1;

    const validPrices = preparedHotels
        .map((hotel) => hotel.numericPrice)
        .filter((price) => price !== null);

    const validRatings = preparedHotels
        .map((hotel) => hotel.reviewScore)
        .filter((rating) => typeof rating === 'number');

    const minPrice =
        validPrices.length > 0
            ? Math.min(...validPrices)
            : null;

    const maxPrice =
        validPrices.length > 0
            ? Math.max(...validPrices)
            : null;

    const minRating =
        validRatings.length > 0
            ? Math.min(...validRatings)
            : null;

    const maxRating =
        validRatings.length > 0
            ? Math.max(...validRatings)
            : null;

    const normalize = (value, min, max) => {
        if (
            value === null ||
            min === null ||
            max === null ||
            max === min
        ) {
            return 0;
        }

        return (value - min) / (max - min);
    };

    const wantsReasonablePrice =
        requirements.budget?.value
            ?.toString()
            .toLowerCase()
            .includes('reasonably priced') || false;

    return preparedHotels
        .map((hotel) => {
            const pricePenalty = canComparePrices
                ? normalize(
                    hotel.numericPrice,
                    minPrice,
                    maxPrice,
                )
                : 0;

            const ratingReward = normalize(
                hotel.reviewScore,
                minRating,
                maxRating,
            );

            let priceWeight = 0.55;
            let ratingWeight = 0.45;

            if (wantsReasonablePrice) {
                priceWeight = 0.65;
                ratingWeight = 0.35;
            }

            const score =
                (1 - pricePenalty) * priceWeight +
                ratingReward * ratingWeight;

            return {
                ...hotel,
                recommendationScore: Math.round(score * 100),
                scoringFactors: {
                    priceWeight: Number(priceWeight.toFixed(2)),
                    ratingWeight: Number(ratingWeight.toFixed(2)),
                    priceCompared: canComparePrices,
                },
            };
        })
        .sort(
            (a, b) =>
                b.recommendationScore - a.recommendationScore,
        );
}