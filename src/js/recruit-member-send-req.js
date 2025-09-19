// recruit-member-send-req.js
// Handles recruit member form submission, validation, and POST request

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recruitForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Validate required fields
        const requiredFields = form.querySelectorAll('.required-field');
        let isValid = true;
        requiredFields.forEach(field => {
            let isEmpty = false;
            if (field.type === 'checkbox') {
                isEmpty = !field.checked;
            } else if (field.tagName === 'SELECT') {
                isEmpty = !field.value || field.value === '';
            } else {
                isEmpty = !field.value.trim();
            }
            if (isEmpty) {
                field.classList.add('input-error');
                isValid = false;
            } else {
                field.classList.remove('input-error');
            }
        });
        if (!isValid) {
            alert('Please fill in all required fields before submitting.');
            return;
        }
        // Gather form data
        const data = {
            club: form.club.value,
            name: form.name.value,
            email: form.email.value,
            number: form.number.value,
            section: form.section.value,
            yearLevel: form.yearLevel.value,
            studentId: form.studentId.value
        };
        try {
            const response = await fetch('/api/recruit-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Your application has been submitted!');
                form.reset();
            } else {
                alert(result.message || 'Submission failed. Please try again.');
            }
        } catch (err) {
            alert('An error occurred while submitting. Please try again later.');
        }
    });
});
