// Ishaal
// dashboardScripts.js
document.addEventListener('DOMContentLoaded', () => {

    // ===== Theme toggle =====
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            document.body.classList.toggle("dark");
        });
    }

    // ===== Logout button =====
    const logOutBtn = document.getElementById("logOutBtn");
    if (logOutBtn) {
        logOutBtn.addEventListener("click", () => {
            window.location.href = "/logout";
        });
    }

    // ===== Breach Check Form =====
    const form = document.getElementById("breachCheckForm");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const resultsCard = document.getElementById("resultsCard");
    const breachResults = document.getElementById("breachResults");
    const resultsPlaceholder = document.getElementById("resultsPlaceholder");

    // Minimum loading time (5 seconds)
    const MIN_LOADING_TIME = 5000;

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userEmail = document.getElementById("userEmail").value.trim();
            const additionalEmail = document.getElementById("additionalEmail").value.trim();
            const userPassword = document.getElementById("userPassword").value;

            if (!userEmail && !additionalEmail && !userPassword) {
                showError("Please enter an email address or password to check.");
                return;
            }

            if (resultsPlaceholder) resultsPlaceholder.style.display = "none";
            resultsCard.style.display = "none";
            loadingIndicator.style.display = "flex";

            const startTime = Date.now();

            try {
                let emailResults = [];
                let passwordResult = null;

                // ===== Email checks (Ishaal) =====
                if (userEmail) {
                    try {
                        const result = await checkEmailBreach(userEmail);
                        emailResults.push({
                            email: userEmail,
                            breached: result.breached,
                            breaches: result.breaches || [],
                            error: null
                        });
                    } catch (err) {
                        emailResults.push({
                            email: userEmail,
                            breached: false,
                            breaches: [],
                            error: err.message
                        });
                    }
                }

                if (additionalEmail) {
                    await delay(500);
                    try {
                        const result = await checkEmailBreach(additionalEmail);
                        emailResults.push({
                            email: additionalEmail,
                            breached: result.breached,
                            breaches: result.breaches || [],
                            error: null
                        });
                    } catch (err) {
                        emailResults.push({
                            email: additionalEmail,
                            breached: false,
                            breaches: [],
                            error: err.message
                        });
                    }
                }

                // ===== Password check (Ishaal) =====
                if (userPassword) {
                    passwordResult = await checkPasswordPwned(userPassword);
                }

                // ===== Ensure minimum loading time =====
                const elapsed = Date.now() - startTime;
                if (elapsed < MIN_LOADING_TIME) {
                    await delay(MIN_LOADING_TIME - elapsed);
                }

                loadingIndicator.style.display = "none";

                // ===== Display Ishaal results =====
                displayResults(emailResults, passwordResult);

                // ==================================================
                // Khang — Data Removal Protocol Trigger
                // ==================================================
                const hasEmailBreaches = emailResults.some(
                    r => r.breached && r.breaches.length > 0
                );

                if (hasEmailBreaches) {
                    renderRemovalProtocol([
                        {
                            Name: "ExampleBreach",
                            BreachDate: "2021-01-01",
                            DataClasses: ["Emails", "Passwords"]
                        }
                    ]);
                }

            } catch (error) {
                const elapsed = Date.now() - startTime;
                if (elapsed < MIN_LOADING_TIME) {
                    await delay(MIN_LOADING_TIME - elapsed);
                }
                loadingIndicator.style.display = "none";
                showError(error.message);
            }
        });
    }

    // ===== Helpers (Ishaal) =====
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function checkEmailBreach(email) {
        const response = await fetch("/api/check-breach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API error: ${response.status}`);
        }

        return data;
    }

    async function checkPasswordPwned(password) {
        const response = await fetch("/api/check-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API error: ${response.status}`);
        }

        return data;
    }

    // ===== Display Results (Ishaal) =====
    function displayResults(emailResults, passwordResult) {
        if (resultsPlaceholder) resultsPlaceholder.style.display = "none";
        resultsCard.style.display = "block";
        breachResults.innerHTML = "";

        let resultsHTML = "";

        if (passwordResult) {
            resultsHTML += passwordResult.breached
                ? `<div class="passwordBreachResult breached">
                    <h4>Password Compromised</h4>
                    <p>${passwordResult.message}</p>
                </div>`
                : `<div class="passwordBreachResult safe">
                    <h4>Password Safe</h4>
                    <p>${passwordResult.message}</p>
                </div>`;
        }

        emailResults.forEach(result => {
            if (result.error) {
                resultsHTML += `<div class="emailBreachNotice">${result.error}</div>`;
            } else if (!result.breached) {
                resultsHTML += `<div class="noBreachFound">
                    No breaches for <strong>${result.email}</strong>
                </div>`;
            } else {
                resultsHTML += `<div class="emailBreachSection">
                    <h4>Breaches for ${result.email}</h4>
                    ${result.breaches.map(b => `<span class="breachTag">${b}</span>`).join("")}
                </div>`;
            }
        });

        breachResults.innerHTML = resultsHTML;
        resultsCard.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        if (resultsPlaceholder) resultsPlaceholder.style.display = "none";
        loadingIndicator.style.display = "none";
        resultsCard.style.display = "block";
        breachResults.innerHTML = `<div class="errorMessage">${message}</div>`;
    }

    
    // Khang — Data Removal Protocol (API)
    
    async function fetchRemovalProviders() {
        const res = await fetch("/api/removal/providers");
        if (!res.ok) throw new Error("Failed to load removal providers");
        return res.json();
    }

    async function fetchRemovalSummary() {
        const res = await fetch("/api/removal/summary");
        if (!res.ok) throw new Error("Failed to load removal summary");
        return res.json();
    }

    async function postRemovalAction(providerId, status) {
        await fetch("/api/removal/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider_id: providerId, status })
        });
    }

    async function renderRemovalProtocol(breaches) {
        const section = document.getElementById("removalProtocol");
        const providersEl = document.getElementById("removalProviders");
        const summaryEl = document.getElementById("removalSummary");

        if (!section || breaches.length === 0) return;

        section.style.display = "block";
        providersEl.innerHTML = "<p>Loading removal options...</p>";

        try {
            const providers = await fetchRemovalProviders();
            providersEl.innerHTML = providers.map(p => `
                <div>
                    <strong>${p.name}</strong>
                    <a href="${p.optOutUrl}" target="_blank">Opt out</a>
                </div>
            `).join("");

            const summary = await fetchRemovalSummary();
            summaryEl.textContent = JSON.stringify(summary, null, 2);
        } catch {
            providersEl.textContent = "Failed to load removal protocol.";
        }
    }

});
