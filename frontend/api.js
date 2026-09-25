const API_BASE_URL = 'https://trippilot-backend-0xk1.onrender.com';

const tripForm = document.getElementById('trip-form');
const tripRequestInput = document.getElementById('trip-request');
const budgetInput = document.getElementById('budget');
const tripResult = document.getElementById('trip-result');

tripForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const tripRequest = tripRequestInput.value.trim();
    const budget = budgetInput.value.trim();

    if (!tripRequest) {
        tripResult.textContent = 'Please tell TripPilot about your trip.';
        return;
    }

    let message = tripRequest;

    if (budget) {
        message += `. My maximum budget is ${budget}.`;
    }

    tripResult.textContent = 'Planning your trip...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/trip-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Trip research could not be completed.');
        }

        console.log('TripPilot result:', result);

        if (result.status === 'needs_clarification') {
            const question =
                result.clarification_question ||
                result.question ||
                result.message ||
                'TripPilot needs a little more information about your trip.';

            tripResult.textContent = question;
            return;
        }

        if (result.status === 'research_completed') {
            tripResult.textContent = 'Trip research complete! Recommendations are ready.';
            return;
        }

        tripResult.textContent = result.message || 'TripPilot returned a result.';

    } catch (error) {
        console.error('TripPilot error:', error);
        tripResult.textContent = 'Something went wrong while planning your trip. Please try again.';
    }
});
