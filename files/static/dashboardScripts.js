//Ishaal
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

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userEmail = document.getElementById("userEmail").value.trim();
            const additionalEmail = document.getElementById("additionalEmail").value.trim();
            const websiteURL = document.getElementById("websiteURL").value.trim();
            const userPassword = document.getElementById("userPassword").value.trim();

            if (!userEmail) {
                showError("Email address is required to check for breaches.");
                return;
            }

            // Show loading, hide results and placeholder
            loadingIndicator.style.display = "block";
            resultsCard.style.display = "none";
            if (resultsPlaceholder) {
                resultsPlaceholder.style.display = "none";
            }

            try {
                // Call HaveIBeenPwned API
                const breaches = await checkHaveIBeenPwned(userEmail);

                // Hide loading
                loadingIndicator.style.display = "none";

                // Display results
                displayResults(breaches, userEmail);

            } catch (error) {
                loadingIndicator.style.display = "none";
                showError(error.message);
            }
        });
    }

    // ===== HaveIBeenPwned API Call =====
    async function checkHaveIBeenPwned(email) {
        const apiUrl = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'FootprintDashboard'
                }
            });

            if (response.status === 404) {
                // No breaches found
                return [];
            }

            if (response.status === 429) {
                throw new Error("Rate limit exceeded. Please try again in a moment.");
            }

            if (!response.ok) {
                throw new Error(`API error: ${response.status}. The API may require an API key for this request.`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            if (error.message.includes("Failed to fetch")) {
                throw new Error("Unable to connect to HaveIBeenPwned API. This may be due to CORS restrictions. Consider using a backend proxy.");
            }
            throw error;
        }
    }

    // ===== Display Results =====
    function displayResults(breaches, userEmail) {
        if (resultsPlaceholder) {
            resultsPlaceholder.style.display = "none";
        }
        resultsCard.style.display = "block";
        breachResults.innerHTML = "";

        if (breaches.length === 0) {
            breachResults.innerHTML = `
                <div class="noBreachFound">
                    <h4>Good News!</h4>
                    <p>No breaches found for <strong>${userEmail}</strong></p>
                    <p style="margin-top: 8px; font-size: 13px;">Your email has not appeared in any known data breaches.</p>
                </div>
            `;
        } else {
            const breachesHTML = breaches.map(breach => {
                const date = new Date(breach.BreachDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const dataClasses = breach.DataClasses ? breach.DataClasses.join(', ') : 'Unknown';

                return `
                    <div class="breachItem">
                        <div class="breachName">${breach.Name || breach.Title}</div>
                        <div class="breachDate">Breach Date: ${date}</div>
                        <div class="breachDescription">${breach.Description || 'No description available.'}</div>
                        <div class="breachData">Compromised Data: ${dataClasses}</div>
                    </div>
                `;
            }).join('');

            breachResults.innerHTML = breachesHTML;
        }

        // Scroll to results
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ===== Show Error =====
    function showError(message) {
        if (resultsPlaceholder) {
            resultsPlaceholder.style.display = "none";
        }
        resultsCard.style.display = "block";
        breachResults.innerHTML = `
            <div class="errorMessage">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
});
