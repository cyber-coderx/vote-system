document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('votingForm');
    const message = document.getElementById('message');
    const voteCountsDiv = document.getElementById('voteCounts');

    // Initialize vote counts from localStorage
    const initializeVoteCounts = () => {
        const votes = JSON.parse(localStorage.getItem('votes')) || { 'Option 1': 0, 'Option 2': 0 };
        return votes;
    };

    const updateVoteCounts = (votes) => {
        localStorage.setItem('votes', JSON.stringify(votes));
        voteCountsDiv.textContent = `Current vote counts: Option 1: ${votes['Option 1']} | Option 2: ${votes['Option 2']}`;
    };

    // Display initial vote counts
    const votes = initializeVoteCounts();
    updateVoteCounts(votes);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const selectedOption = document.querySelector('input[name="vote"]:checked');
        if (!selectedOption) {
            message.textContent = 'Please select an option!';
            return;
        }

        const voteValue = selectedOption.value;
        const votes = initializeVoteCounts();

        if (localStorage.getItem('voted') === 'true') {
            message.textContent = 'You have already voted!';
        } else {
            votes[voteValue]++;
            localStorage.setItem('voted', 'true');
            updateVoteCounts(votes);
            message.textContent = 'Thank you for voting!';
        }
    });
});
