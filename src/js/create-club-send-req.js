// Sends a POST request with all required values from the create club form

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createClubForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Collect required fields
        const clubName = form.elements['clubName'].value.trim();
        const username = form.elements['username'].value.trim();
        const clubPassword = form.elements['clubPassword'].value.trim();
        const clubType = form.elements['clubType'].value;
        const clubDescription = form.elements['clubDescription'].value.trim();
        const clubOwner = form.elements['clubOwner'].value.trim();
        const email = form.elements['email'].value.trim();
    // Optional fields
    const phone = form.elements['phone'].value.trim() || "N/A";
    const socialMedia = form.elements['socialMedia'].value.trim() || "N/A";
    const maxMembers = form.elements['maxMembers'].value || "N/A";
    const meetingFrequency = form.elements['meetingFrequency'].value || "N/A";
    const meetingLocation = form.elements['meetingLocation'].value.trim() || "N/A";
    const goals = form.elements['goals'].value.trim() || "N/A";
    const requirements = form.elements['requirements'].value.trim() || "N/A";
        const terms = form.elements['terms'].checked;

        // Validate required fields
        if (!clubName || !username || !clubPassword || !clubType || !clubDescription || !clubOwner || !email || !terms) {
            alert('Please fill in all required fields and agree to the terms.');
            return;
        }

        // Prepare payload
        const payload = {
            clubName,
            username,
            clubPassword,
            clubType,
            clubDescription,
            clubOwner,
            email,
            phone,
            socialMedia,
            maxMembers,
            meetingFrequency,
            meetingLocation,
            goals,
            requirements,
            activeStatus: true,
            memberRecruitment: true,
            clubTask: [],
            members:[
                {
                    name: clubOwner,
                    role: "Club Owner",
                    email: email,
                    number: phone,
                    pending : false
                }
            ],
            events: {}

        };

        // Send POST request
        await fetch('/api/create-club', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Club created successfully!');
                form.reset();
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(err => {
            alert('Network error: ' + err.message);
        });
    });
});
