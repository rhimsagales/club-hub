document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createClubForm");
    const loadingScreen = document.getElementById("loadingScreen");
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const submitBtn = document.getElementById("submitBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    // Progress indicators
    const step1Indicator = document.getElementById("step1-indicator");
    const step1Text = document.getElementById("step1-text");
    const step2Indicator = document.getElementById("step2-indicator");
    const step2Text = document.getElementById("step2-text");
    const progressLine = document.getElementById("progress-line");
    const currentStep = document.getElementById("current-step");

    let currentPage = 1;

    // Navigation functions
    function showPage(page) {
        // Toggle required attributes for visible fields only
        const page1Fields = page1.querySelectorAll('[required]');
        const page2Fields = page2.querySelectorAll('[required]');
        if (page === 1) {
            page1Fields.forEach(f => f.setAttribute('required', ''));
            page2Fields.forEach(f => f.removeAttribute('required'));
            page1.classList.remove("hidden");
            page2.classList.add("hidden");
            nextBtn.classList.remove("hidden");
            submitBtn.classList.add("hidden");
            prevBtn.classList.add("hidden");
            // Update progress indicators
            step1Indicator.classList.remove("bg-base-300", "text-base-content");
            step1Indicator.classList.add("bg-primary", "text-primary-content");
            step1Text.classList.remove("text-base-content/70");
            step1Text.classList.add("text-base-content");
            step2Indicator.classList.remove("bg-primary", "text-primary-content");
            step2Indicator.classList.add("bg-base-300", "text-base-content");
            step2Text.classList.remove("text-base-content");
            step2Text.classList.add("text-base-content/70");
            progressLine.classList.remove("bg-primary");
            progressLine.classList.add("bg-base-300");
            currentStep.textContent = "Step 1 of 2";
        } else {
            page1Fields.forEach(f => f.removeAttribute('required'));
            page2Fields.forEach(f => f.setAttribute('required', ''));
            page1.classList.add("hidden");
            page2.classList.remove("hidden");
            nextBtn.classList.add("hidden");
            submitBtn.classList.remove("hidden");
            prevBtn.classList.remove("hidden");
            // Update progress indicators
            step1Indicator.classList.remove("bg-primary", "text-primary-content");
            step1Indicator.classList.add("bg-base-300", "text-base-content");
            step1Text.classList.remove("text-base-content");
            step1Text.classList.add("text-base-content/70");
            step2Indicator.classList.remove("bg-base-300", "text-base-content");
            step2Indicator.classList.add("bg-primary", "text-primary-content");
            step2Text.classList.remove("text-base-content/70");
            step2Text.classList.add("text-base-content");
            progressLine.classList.remove("bg-base-300");
            progressLine.classList.add("bg-primary");
            currentStep.textContent = "Step 2 of 2";
        }
        currentPage = page;
    }

    // Validation function
    function validateFields(container) {
    const requiredFields = container.querySelectorAll(".required-field");
        let isValid = true;

        requiredFields.forEach((field) => {
        let isEmpty = false;

        if (field.type === "checkbox") {
            isEmpty = !field.checked;
        } else if (field.tagName === "SELECT") {
            isEmpty = !field.value || field.value === "";
        } else {
            isEmpty = !field.value.trim();
        }

        if (isEmpty) {
            field.classList.add("input-error");
            isValid = false;
        } else {
            field.classList.remove("input-error");
        }
        });

        return isValid;
    }

    // Event listeners
    nextBtn.addEventListener("click", () => {
        if (validateFields(page1)) {
        showPage(2);
        } else {
        alert("Please fill in all required fields before proceeding.");
        }
    });

    prevBtn.addEventListener("click", () => {
        showPage(1);
    });

    cancelBtn.addEventListener("click", () => {
        if (
        confirm("Are you sure you want to cancel? All entered data will be lost.")
        ) {
        form.reset();
        showPage(1);
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validate all fields
        const page1Valid = validateFields(page1);
        const page2Valid = validateFields(page2);

        if (!page1Valid || !page2Valid) {
        alert("Please fill in all required fields before submitting.");
        return;
        }

        // Show loading screen
        form.classList.add("hidden");
        loadingScreen.classList.remove("hidden");

        // Simulate form processing
        setTimeout(() => {
        // Hide loading screen and show success message
        loadingScreen.classList.add("hidden");

        // Reset form
        form.reset();
        form.classList.remove("hidden");
        showPage(1);
        }, 2000);
    });

    // Initialize
    showPage(1);

});
