document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('votingForm');
    const message = document.getElementById('message');
    const voteCountsDiv = document.getElementById('voteCounts');
    const chartCanvas = document.getElementById('chart');

    // Fetch initial vote counts from the server
    const fetchVoteCounts = async () => {
        const response = await fetch('/api/getVotes');
        const data = await response.json();
        updateVoteCounts(data.votes);
    };

    // Update vote counts in the UI
    const updateVoteCounts = (votes) => {
        voteCountsDiv.textContent = `Current vote counts: Option 1: ${votes['Option 1']} | Option 2: ${votes['Option 2']}`;
        updateChart(votes);
    };

    // Update the chart
    const updateChart = (votes) => {
        const ctx = chartCanvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Option 1', 'Option 2'],
                datasets: [{
                    label: 'Votes',
                    data: [votes['Option 1'], votes['Option 2']],
                    backgroundColor: ['#FF6384', '#36A2EB']
                }]
            }
        });
    };

    // Display initial vote counts
    fetchVoteCounts();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedOption = document.querySelector('input[name="vote"]:checked');
        if (!selectedOption) {
            message.textContent = 'Please select an option!';
            return;
        }

        const voteValue = selectedOption.value;

        const response = await fetch('/api/vote', {
            method: 'POST',
            body: JSON.stringify({ candidate: voteValue }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success) {
            message.textContent = 'Thank you for voting!';
            updateVoteCounts(result.votes);
        } else {
            message.textContent = 'You have already voted!';
        }
    });
});
