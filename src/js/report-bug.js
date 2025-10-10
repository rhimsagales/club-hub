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

    // Prevent duplicate submissions
    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (isSubmitting) {
            return;
        }

        const isValid = validateAllRequired(form);
        if (!isValid) {
            alert('Please fill in all required fields. The page will reload.');
            window.location.reload();
            return;
        }

        isSubmitting = true;
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
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
                
                // Add event listener for modal close button
                const closeBtn = successModal.querySelector('button[onclick*="close"]');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        successModal.close();
                        // Reset form and page after modal closes
                        form.reset();
                        // Reset to page 1 if showPage function exists
                        if (typeof showPage === 'function') {
                            showPage(1);
                        }
                    });
                }
                
                // Add event listener for modal backdrop
                const backdrop = successModal.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.addEventListener('click', () => {
                        successModal.close();
                        form.reset();
                        if (typeof showPage === 'function') {
                            showPage(1);
                        }
                    });
                }
            } else {
                alert(result.message || 'Bug report submitted successfully.');
                form.reset();
                if (typeof showPage === 'function') {
                    showPage(1);
                }
            }

            // Clear any saved draft after successful submission
            try { localStorage.removeItem('bugReportDraft'); } catch {}

        } catch (err) {
            console.error(err);
            alert('There was an error submitting your bug report. Please try again later.');
        } finally {
            isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Bug Report
                `;
            }
        }
    });
});


