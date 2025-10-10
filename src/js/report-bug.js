document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bugReportForm');

    if (!form) return;

    function collectFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        // Include current URL and user agent for extra context
        data.currentUrl = window.location.href;
        data.userAgent = navigator.userAgent;
        return data;
    }

    function validateAllRequired(formElement) {
        const requiredFields = formElement.querySelectorAll('[required]');
        for (const field of requiredFields) {
            if (field.type === 'checkbox') {
                if (!field.checked) return false;
            } else if (field.tagName === 'SELECT') {
                if (!field.value || field.value === '') return false;
            } else {
                if (!String(field.value || '').trim()) return false;
            }
        }
        return true;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isValid = validateAllRequired(form);
        if (!isValid) {
            alert('Please fill in all required fields. The page will reload.');
            window.location.reload();
            return;
        }

        const payload = collectFormData(form);

        try {
            const response = await fetch('/api/report-bug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to submit bug report');
            }

            const result = await response.json().catch(() => ({}));

            // If the success modal exists, show it; otherwise, fallback to alert
            const successModal = document.getElementById('successModal');
            if (successModal && typeof successModal.showModal === 'function') {
                successModal.showModal();
            } else {
                alert(result.message || 'Bug report submitted successfully.');
            }

            // Clear any saved draft after successful submission
            try { localStorage.removeItem('bugReportDraft'); } catch {}

            form.reset();
        } catch (err) {
            console.error(err);
            alert('There was an error submitting your bug report. Please try again later.');
        }
    });
});


