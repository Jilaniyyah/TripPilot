import Groq from 'groq-sdk';
import 'dotenv/config';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `
You are the travel-requirement extraction engine for TripPilot.

Your job is to understand a traveller's natural-language request and convert it
into structured travel requirements.

Extract only information supported by the traveller's message.

IMPORTANT:
- Never invent missing information.
- Clearly distinguish explicit information from reasonable inferences.
- Identify missing information.
- Identify ambiguous information.
- Preserve the traveller's actual preferences.
- Do not make medical or safety assumptions about travellers.
- A traveller being elderly, an infant, a child, etc. is a traveller-composition
  fact, not permission to invent medical requirements.

Trip intake fields:
- origin
- destination
- dates or date window
- number of travellers
- adults
- children
- infants
- budget
- currency
- preferred mode: flight, road, or both
- cabin preference
- baggage requirements
- hotel requirements
- accessibility or mobility needs
- safety preferences
- trip purpose
- flexibility
- max stops
- layover preferences
- other travel preferences stated by the traveller

IMPORTANT:
- Preserve qualitative preferences exactly when the traveller gives them.
- For example, if the traveller says "minimal stops", preserve that as an
  explicit preference. Do not convert it into a specific number of stops
  unless the traveller actually provides a number.
- Do not discard preferences just because they cannot be represented as a
  precise numeric value.

For each extracted requirement, indicate whether it was:
- explicit
- inferred
- missing
- ambiguous

If a required piece of information is missing or ambiguous and it would
materially change the research result, include it in missing or ambiguous.

Return JSON only, using exactly this structure:

{
  "status": "ready|needs_clarification",
  "requirements": {
    "origin": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "destination": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "departure_date": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "return_date": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "date_window": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "number_of_travellers": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "adults": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "children": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "infants": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "elderly": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "budget": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "currency": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "preferred_mode": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "cabin_preference": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "baggage_requirements": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "hotel_requirements": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "accessibility_or_mobility_needs": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "safety_preferences": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "trip_purpose": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "flexibility": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "max_stops": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "layover_preferences": {
      "value": null,
      "status": "explicit|inferred|missing|ambiguous"
    },
    "other_preferences": {
      "value": [],
      "status": "explicit|inferred|missing|ambiguous"
    }
  },
  "missing": [],
  "ambiguous": [],
  "clarification_question": null
}

Rules for this structure:
- Use null for a value that is not provided.
- Use an empty array for no other preferences.
- Put the names of materially missing requirements in "missing".
- Put the names of materially ambiguous requirements in "ambiguous".
- Required information for initial travel research is:
  1. origin
  2. destination
  3. departure date or date window
- Treat other fields as optional unless the traveller explicitly provides them.
- Set "status" to "needs_clarification" only when one of the required fields
  is missing or materially ambiguous.
- Set "status" to "ready" when origin, destination, and departure date or date window are available.
- Do not ask the traveller for optional information before research unless it
  materially changes the specific research being requested.
- "clarification_question" should contain one natural question that asks only for the most important missing information.
- Preserve qualitative preferences. For example, "minimal stops" should be stored as an explicit layover preference, without inventing a numeric maximum.
- Never invent dates, prices, currencies, or other traveller requirements.
- Convert explicit travel dates to YYYY-MM-DD format.
- If the traveller gives a range such as "October 15 to October 20, 2026",
  set departure_date to "2026-10-15" and return_date to "2026-10-20".
- Do not combine departure and return dates into one string.
- If only one travel date is given, use it as departure_date and leave
  return_date null.
`;

export async function extractTripRequirements(request) {
    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: request,
            },
        ],
        response_format: {
            type: 'json_object',
        },
        temperature: 0,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
        throw new Error('Grok returned an empty response.');
    }

    return JSON.parse(content);
}

export async function explainRecommendations({
    requirements,
    rankedFlights = [],
    rankedHotels = [],
}) {
    const topFlights = rankedFlights.slice(0, 3);
    const topHotels = rankedHotels.slice(0, 3);

    const systemPrompt = `
You are the explanation layer of TripPilot, an AI travel research agent.

Your job is to explain why already-ranked travel options may fit the traveller's stated requirements.

STRICT RULES:
- Use ONLY the traveller requirements and option data provided.
- Never invent prices, currencies, amenities, baggage rules, accessibility features, safety claims, locations, schedules, or other facts.
- Never claim that an option has a feature unless it appears in the supplied data.
- Do not change the ranking.
When comparing an option's price, rating, duration, stops, or any other attribute, be explicit about the comparison set.

Never say an option is the highest, lowest, cheapest, most expensive, best, or worst "among the options" unless that statement is true across ALL supplied options. If the comparison is only against the other recommendations being explained, say "among the recommended options" or "among the top recommendations" instead.
- Do not calculate or convert currencies.
- Do not compare prices that use different currencies.
- Recommendation scores and scoring factors are internal ranking signals only.
- Never mention recommendation scores, scoring weights, scoring factors, ranking formulas, or other internal ranking mechanics in user-facing explanations.
- Explain recommendations using only concrete traveller preferences and supplied option facts such as price, stops, duration, review score, and review count.
- Keep explanations concise and practical.
- Mention meaningful trade-offs when supported by the data.
- Return valid JSON only.
- Never say an option "meets the traveller's requirements", "satisfies the traveller's requirements", or otherwise imply that all requirements are fulfilled unless every relevant requirement is directly supported by the supplied option data.
- When only some preferences are supported, name those specific matches instead. For example: "This flight matches the requested route, date, and minimal-stops preference."
- Never say a price is affordable, reasonable, within budget, or expensive unless the traveller provided a numeric budget in a matching currency.
- If the traveller only says "reasonably priced", describe price comparatively using the supplied options, such as "lower-priced" or "higher-priced".
- Never infer that an option is easier, safer, more accessible, or more suitable for an elderly traveller, infant, child, or disabled traveller unless the supplied option data directly supports that claim.
- You may connect an option directly to an explicit preference. For example, a 0-stop flight can be described as matching a "minimal stops" preference.
- When discussing price, use only prices in the same currency.
- Explain trade-offs using concrete supplied facts such as price, stops, duration, review score, and review count.
- If an option has "rankingStatus": "single_candidate", clearly state that it was the only unique candidate returned and was not comparatively scored against alternatives.
- Never call a single candidate the "best", "top-ranked", "highest-ranked", or imply that it beat other options.
- If "recommendationScore" is null, do not mention a recommendation score.
- Never expose internal field names, status codes, implementation details, or developer terminology such as "rankingStatus", "single_candidate", "recommendationScore", or "scoringFactors" in the explanation. Translate them into natural user-facing language.


Return this structure:

{
  "flights": [
    {
      "rank": 1,
      "reason": "..."
    }
  ],
  "hotels": [
    {
      "rank": 1,
      "reason": "..."
    }
  ]
}
`;

    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: JSON.stringify({
                    travellerRequirements: requirements,
                    rankedFlights: topFlights,
                    rankedHotels: topHotels,
                }),
            },
        ],
        response_format: {
            type: 'json_object',
        },
        temperature: 0,
    });

    return JSON.parse(
        response.choices[0].message.content,
    );
}