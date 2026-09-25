# TripPilot

**AI-powered, constraint-aware travel research from one natural-language
request.**

TripPilot turns the way people actually describe a trip into structured,
live travel research. A traveller can say where they are going, who is
travelling, their dates, budget, stop preferences, and hotel needs in
one message. TripPilot interprets those requirements, researches current
flight and accommodation options through Apify, filters unsuitable
results, ranks the remaining choices, and explains the trade-offs.

**Live product:** https://trip-pilot-two-coral.vercel.app/

**Apify Actor:** https://apify.com/jilaniyyah_kazeem/trippilot-actor

**Product repository:** https://github.com/Jilaniyyah/TripPilot

Built for the **Apify x She Code Africa BuildHer Hackathon**.

------------------------------------------------------------------------

## The problem

Travel search is easy. Travel decision-making is not.

A traveller planning one trip may have to move between flight search
engines, hotel platforms, maps, travel agents, messages, and separate
booking tools. They still have to reconcile prices, stops, journey time,
traveller needs, hotel quality, location, and budget themselves.

This becomes harder for real-world requests such as:

> "I am travelling from Lagos to London with my wife, an elderly parent
> and an infant. We want something reasonably priced with minimal
> stops."

Most search interfaces break that request into forms. General-purpose AI
can understand it, but cannot safely rely on its own knowledge for
current travel options.

TripPilot connects the two.

It combines **AI understanding with live Apify-powered web research and
deterministic constraint logic** so that a traveller can move from an
unstructured goal to a small set of explainable options.

The product principle is:

**One conversation, one trip, one source of truth.**

------------------------------------------------------------------------

## What TripPilot does

Give TripPilot a travel request in plain language. The agent:

1.  **Understands the trip** --- extracts origin, destination, dates,
    traveller composition, budget, stop limits, hotel needs, and other
    stated preferences.
2.  **Detects missing information** --- if an essential field is missing
    or ambiguous, it asks for clarification instead of inventing a
    value.
3.  **Researches live options** --- orchestrates Apify Actors for flight
    and accommodation discovery.
4.  **Normalizes fragmented data** --- converts different source formats
    into comparable flight and hotel structures.
5.  **Enforces hard constraints** --- for example, an explicit
    `maximum of 0 stops` removes connecting flights before ranking.
6.  **Ranks viable options** --- considers relevant trade-offs such as
    price, stops, duration, hotel price, and review score.
7.  **Explains the result** --- uses Groq to produce concise, grounded
    reasons based only on the researched data.
8.  **Returns structured output** --- suitable for the TripPilot web
    app, APIs, automations, or another AI agent.

The result is not just a list of scraped travel data. It is **travel
research shaped around the traveller's actual constraints**.

------------------------------------------------------------------------

## Try it

### Live web app

Open:

https://trip-pilot-two-coral.vercel.app/

Try a request such as:

``` text
I am travelling from Lagos to London from October 15 to October 20, 2026.
I want a maximum of 0 stops and a reasonably priced hotel in London.
```

Or test the clarification flow:

``` text
I want to travel from Lagos to London with my wife and an infant.
We want minimal stops.
```

Because the second request has no travel date, TripPilot asks for the
missing date instead of fabricating one.

### Run the Actor directly

Open the TripPilot Actor on Apify:

https://apify.com/jilaniyyah_kazeem/trippilot-actor

Enter a natural-language request in the `request` field and start the
Actor.

------------------------------------------------------------------------

## Why this is an Apify Actor, not just an AI wrapper

TripPilot uses a **new purpose-built Apify Actor as the orchestration
and decision layer**.

Existing travel Actors are research tools. TripPilot is the agent that
decides how their data should be used.

``` text
Traveller
   |
   v
Natural-language request
   |
   v
TripPilot Actor
   |
   +---- Groq: understand intent
   |
   +---- Google Flights Actor
   |
   +---- Booking.com Actor
   |
   v
Normalize source data
   |
   v
Apply hard constraints
   |
   v
Rank viable options
   |
   v
Generate grounded explanations
   |
   v
Structured travel research
```

This separation matters.

**Groq understands and explains.**

**Apify retrieves fresh web information.**

**TripPilot applies the travel-specific orchestration, validation,
filtering, and ranking logic.**

An LLM is never treated as the source of live flight or hotel
availability.

------------------------------------------------------------------------

## Key capabilities

  -----------------------------------------------------------------------
  Capability                          What TripPilot does
  ----------------------------------- -----------------------------------
  Natural-language intake             Accepts a complete trip request
                                      instead of requiring a long search
                                      form

  Structured intent extraction        Converts the request into explicit,
                                      inferred, missing, and ambiguous
                                      requirements

  Clarification                       Stops and asks when essential
                                      information is missing

  Live flight research                Uses an Apify Google Flights
                                      scraper Actor

  Live hotel research                 Uses an Apify Booking.com scraper
                                      Actor

  Data normalization                  Converts different source outputs
                                      into consistent internal structures

  Hard constraints                    Removes options that violate
                                      explicit supported limits such as
                                      maximum stops

  Preference-aware ranking            Balances price, stops, duration,
                                      and hotel quality instead of
                                      blindly choosing the cheapest

  Grounded explanations               Explains recommendations using
                                      researched facts only

  Structured output                   Produces machine-readable results
                                      for applications and agent
                                      workflows

  API integration                     Powers the TripPilot web
                                      application through a backend REST
                                      API

  PPE monetization                    Charges for successful
                                      `trip-research` events
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Architecture

``` text
                         +----------------------+
                         |     TripPilot Web    |
                         |       Vercel         |
                         +----------+-----------+
                                    |
                                    | HTTPS
                                    v
                         +----------------------+
                         |   Backend REST API   |
                         |       Render         |
                         +----------+-----------+
                                    |
                                    v
+------------------------------------------------------------------+
|                     TripPilot Apify Actor                         |
|                                                                  |
|   Natural language                                                |
|          |                                                        |
|          v                                                        |
|   +-------------+        +-----------------------------------+    |
|   |    Groq     |        |        Apify research tools       |    |
|   | extraction  |        |                                   |    |
|   +------+------+        | Google Flights | Booking.com       |    |
|          |               +----------------+------------------+    |
|          +------------------------+-------------------------------+
|                                   |
|                                   v
|                              Normalize
|                                   |
|                                   v
|                         Constraint filtering
|                                   |
|                                   v
|                                Ranking
|                                   |
|                                   v
|                         Grounded explanation
+-----------------------------------+------------------------------+
                                    |
                                    v
                         Default Apify Dataset
```

The browser never receives the Groq or Apify secret keys.

------------------------------------------------------------------------

## Input

TripPilot deliberately keeps the Actor input simple.

### Input schema

  ------------------------------------------------------------------------
  Field             Type              Required          Description
  ----------------- ----------------- ----------------- ------------------
  `request`         string            Yes               A natural-language
                                                        description of the
                                                        trip

  ------------------------------------------------------------------------

Example:

``` json
{
  "request": "I am travelling from Lagos to London from October 15 to October 20, 2026. I want a maximum of 0 stops and a reasonably priced hotel in London."
}
```

The Actor's input schema renders this as a simple text input in Apify
Console, while the agent handles the structured interpretation
internally.

------------------------------------------------------------------------

## What TripPilot understands

Depending on what the traveller provides, TripPilot can structure
requirements including:

``` text
origin
destination
departure_date
return_date
date_window
number_of_travellers
adults
children
infants
elderly
budget
currency
preferred_mode
cabin_preference
baggage_requirements
hotel_requirements
accessibility_or_mobility_needs
safety_preferences
trip_purpose
flexibility
max_stops
layover_preferences
other_preferences
```

TripPilot does not silently manufacture missing travel facts.

For the current research flow, origin, destination, and a departure date
or usable date window are required before live research begins.

------------------------------------------------------------------------

## Output

TripPilot stores its structured result in the run's default Apify
Dataset.

A successful result is organized around:

``` json
{
  "status": "research_completed",
  "requirements": {},
  "research": {
    "constraints": {
      "applied": [],
      "flightsRemoved": 0
    },
    "flights": [],
    "hotels": []
  },
  "explanations": {}
}
```

The exact flight and hotel fields depend on the data returned by the
research sources, but TripPilot normalizes the fields needed for
comparison before filtering and ranking.

### Clarification output

If essential information is missing, the Actor returns a structured
clarification result instead of running misleading research.

Conceptually:

``` json
{
  "status": "needs_clarification",
  "requirements": {},
  "questions": [
    "What date or date range would you like to travel?"
  ]
}
```

### Failed research

If the workflow cannot complete, TripPilot surfaces the failure. It does
not replace unavailable source data with invented travel options.

------------------------------------------------------------------------

## Output schema

The Actor exposes its run results through the default Apify Dataset.

A minimal output schema can point integrations directly to those
results:

``` json
{
  "actorOutputSchemaVersion": 1,
  "title": "TripPilot output",
  "properties": {
    "results": {
      "type": "string",
      "title": "Trip research results",
      "template": "{{links.apiDefaultDatasetUrl}}/items"
    }
  }
}
```

This makes TripPilot suitable for direct use from Apify Console as well
as API-driven applications and automations.

------------------------------------------------------------------------

## How ranking works

TripPilot separates **constraints** from **preferences**.

That distinction is important.

### Hard constraint

``` text
I want a maximum of 0 stops.
```

`max_stops = 0` is explicit. Connecting flights are removed before
ranking.

### Preference

``` text
I prefer minimal stops.
```

TripPilot does not invent a numeric maximum. Instead, the preference can
influence how viable options are compared.

For flights, the current demo can consider:

-   price;
-   number of stops;
-   total duration.

For hotels, it can consider:

-   price;
-   review score;
-   review count and other normalized context where available.

TripPilot intentionally does not expose its internal scoring formula as
though it were an objective measure of travel quality. User-facing
explanations focus on concrete facts and the traveller's stated
priorities.

If only one unique candidate remains after filtering, TripPilot treats
it as a single candidate rather than pretending it defeated alternatives
in a comparative ranking.

------------------------------------------------------------------------

## Grounded AI

AI is useful in TripPilot where language and reasoning are required, but
deterministic code remains responsible for enforceable rules.

Groq is used for:

-   interpreting natural-language travel requests;
-   identifying missing or ambiguous information;
-   generating concise explanations of researched recommendations.

Groq is **not** used as the source of live flight or hotel data.

The explanation layer is instructed not to invent:

-   prices;
-   currencies;
-   flight schedules;
-   baggage allowances;
-   hotel amenities;
-   accessibility support;
-   safety claims;
-   availability;
-   other unsupported travel facts.

This creates a clearer trust boundary between **AI reasoning** and
**researched evidence**.

------------------------------------------------------------------------

## Technologies and tools

  -----------------------------------------------------------------------
  Technology                          Role
  ----------------------------------- -----------------------------------
  Apify                               Actor runtime, Actor orchestration,
                                      travel web research, datasets,
                                      Store distribution and monetization

  Apify SDK                           Actor lifecycle, storage,
                                      Actor-to-Actor execution and PPE
                                      charging

  Groq                                Natural-language requirement
                                      extraction and grounded
                                      explanations

  Google Flights scraper Actor        Flight discovery

  Booking.com scraper Actor           Accommodation discovery

  Node.js                             TripPilot Actor and backend runtime

  JavaScript                          Core orchestration and decision
                                      logic

  Express                             REST API used by the web
                                      application

  Render                              Backend deployment

  Vercel                              Live TripPilot web application

  GitHub                              Source control and collaboration

  cron-job.org                        Demo backend health checks
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## How to run the Actor

### Option 1: Run on Apify Store

This is the fastest way to test TripPilot.

1.  Open the Actor:

    https://apify.com/jilaniyyah_kazeem/trippilot-actor

2.  Enter a complete travel request in the `request` field.

3.  Click **Start**.

4.  Watch the run logs to see TripPilot interpret the request and
    execute its research workflow.

5.  Open the run's **Dataset** or **Output** to inspect the structured
    result.

A good test input is:

``` text
I am travelling from Lagos to London from October 15 to October 20, 2026.
I want a maximum of 0 stops and a reasonably priced hotel in London.
```

### Option 2: Run locally

Requirements:

-   Node.js;
-   Apify CLI;
-   Apify account/API token;
-   Groq API key.

Create a `.env` file:

``` env
GROQ_API_KEY=your_groq_api_key
APIFY_API_TOKEN=your_apify_api_token
```

Install dependencies:

``` bash
npm install
```

Run with the Apify CLI:

``` bash
apify run
```

Provide input when prompted or through the Actor input mechanism.

Never commit `.env` or real API keys to source control.

------------------------------------------------------------------------

## API use

Because TripPilot is an Apify Actor, it can also be integrated into
applications through the Apify API.

The production demo uses a lightweight backend that calls the Actor and
returns its default Dataset result to the browser.

### TripPilot backend

**Backend API:** https://trippilot-backend-0xk1.onrender.com

Health:

``` http
GET /api/health
```

Trip research:

``` http
POST /api/trip-search
Content-Type: application/json
```

Body:

``` json
{
  "message": "I am travelling from Lagos to London from October 15 to October 20, 2026. I want minimal stops."
}
```

This architecture keeps credentials server-side and lets the web
interface remain a thin client.

------------------------------------------------------------------------

## Pay Per Event

TripPilot uses **Apify Pay Per Event (PPE)**.

The primary custom event is:

``` text
trip-research
```

A `trip-research` event represents a successfully completed
travel-research workflow.

Current event price:

``` text
$0.05 per successful trip-research event
```

The event is triggered only after a successful research result has been
written.

A request that needs clarification does **not** charge the successful
research event.

A failed research workflow does **not** charge the successful research
event.

This makes pricing correspond to the core value the Actor delivers
rather than simply charging because a run was started.

------------------------------------------------------------------------

## Demo scope

TripPilot is a working hackathon MVP, not a claim that every part of the
future travel platform is already production-ready.

### Implemented

-   web-based natural-language trip intake;
-   Groq requirement extraction;
-   missing-information clarification;
-   new TripPilot Apify Actor;
-   Google Flights research through Apify;
-   Booking.com accommodation research through Apify;
-   normalized flight and hotel data;
-   explicit maximum-stop filtering;
-   preference-aware flight and hotel ranking;
-   grounded AI explanations;
-   structured Dataset output;
-   REST API;
-   deployed web application;
-   Pay Per Event monetization.

### Product roadmap

The full TripPilot vision extends the same trip state beyond research:

``` text
Intent -> Discover -> Compare -> Decide -> Pay -> Book -> Monitor -> Recover
```

Future production phases can add:

-   authoritative transactional flight booking;
-   accommodation booking partners;
-   secure payments;
-   persistent trip memory;
-   travel-readiness workflows;
-   price and disruption monitoring;
-   change and cancellation workflows;
-   road and multimodal transport;
-   group travel and split payments;
-   corporate travel;
-   multi-currency support;
-   disruption recovery.

The architecture deliberately separates **Apify discovery** from
**transactional booking**. Search results are research data; production
purchases should be executed through authoritative booking providers.

------------------------------------------------------------------------

## Who TripPilot is for

TripPilot is designed for travellers whose real challenge is
coordination, not access to another search box.

**Busy professionals** want useful options without manually comparing
many tabs.

**Family trip organizers** need passenger composition, stops, timing,
hotel needs, and budget considered together.

**Budget-conscious travellers** need realistic trade-offs, because the
lowest headline price may come with a worse journey.

**Frequent African travellers and businesses** repeatedly coordinate
routes, accommodation, timing, and changing travel requirements.

The initial product vision is especially relevant to Nigerian and
regional African travel, while the underlying Actor architecture is
reusable for broader travel-research applications.

------------------------------------------------------------------------

## Why TripPilot can grow beyond the demo

TripPilot's most important asset is not a chat interface. It is the
structured travel state created from the conversation and grounded
research.

That makes possible workflows such as:

``` text
"I have 600k. Where can two people realistically go for four days from Lagos?"
```

``` text
"This trip is too expensive. Find me a cheaper way without adding several stops."
```

``` text
"Watch this trip and tell me when the total falls below my budget."
```

``` text
"My flight was cancelled. Find realistic alternatives."
```

The same agent can evolve from one-time research into a persistent
travel coordination layer.

------------------------------------------------------------------------

## Product principles

TripPilot is built around six rules:

1.  **Start with the traveller's intent.**
2.  **Ask only for missing information that materially affects the
    result.**
3.  **Use live tools for facts that require live data.**
4.  **Never turn a preference into a hard constraint without evidence.**
5.  **Explain important trade-offs instead of hiding them behind an AI
    answer.**
6.  **Keep the traveller in control of consequential decisions.**

------------------------------------------------------------------------

## Why this product matters

The travel industry has many tools for finding flights and hotels.

The gap TripPilot targets is the work between **wanting to make a trip**
and **knowing which realistic option fits the traveller**.

A traveller should not have to become a search expert, data reconciler,
and trip coordinator just to answer:

> What actually works for my trip?

TripPilot turns that question into an agentic workflow:

``` text
Understand the person
        |
Research the web
        |
Structure the options
        |
Enforce the constraints
        |
Compare the trade-offs
        |
Explain the result
```

For developers and businesses, the same capability is available as an
Apify Actor rather than being locked inside the TripPilot interface.

**TripPilot is not another travel search page. It is a constraint-aware
travel research agent that turns human intent into researched,
explainable options.**

------------------------------------------------------------------------

## Links

-   **Live TripPilot:** https://trip-pilot-two-coral.vercel.app/
-   **TripPilot Apify Actor:**
    https://apify.com/jilaniyyah_kazeem/trippilot-actor
-   **Backend API:** https://trippilot-backend-0xk1.onrender.com
-   **Product Repository:**  https://github.com/Jilaniyyah/TripPilot
------------------------------------------------------------------------

## Hackathon submission

**Project:** TripPilot\
**Category:** AI Agent / Travel Research\
**Hackathon:** Apify x She Code Africa BuildHer Hackathon\
**Core Apify submission:** TripPilot --- AI Travel Research Agent\
**Actor monetization:** Pay Per Event\
**Primary event:** `trip-research`

TripPilot demonstrates an Apify Actor that does more than collect data.
It accepts a human goal, decides what information is required,
orchestrates other Actors as tools, applies domain-specific constraints
and ranking, and returns an explainable result that another person,
application, or AI agent can immediately use.
