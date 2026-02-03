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

    // Minimum loading time (5 seconds)
    const MIN_LOADING_TIME = 5000;

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userEmail = document.getElementById("userEmail").value.trim();
            const additionalEmail = document.getElementById("additionalEmail").value.trim();
            const websiteURL = document.getElementById("websiteURL").value.trim();
            const userPassword = document.getElementById("userPassword").value;

            if (!userEmail && !additionalEmail && !userPassword) {
                showError("Please enter an email address or password to check.");
                return;
            }

            // Show loading overlay, hide results and placeholder
            if (resultsPlaceholder) {
                resultsPlaceholder.style.display = "none";
            }
            resultsCard.style.display = "none";
            loadingIndicator.style.display = "flex";

            const startTime = Date.now();

            try {
                let emailResults = [];
                let passwordResult = null;

                // Check primary email if provided
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

                // Check additional email if provided
                if (additionalEmail) {
                    // Small delay to respect rate limits
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

                // Check password if provided
                if (userPassword) {
                    passwordResult = await checkPasswordPwned(userPassword);
                }

                // Ensure minimum loading time
                const elapsed = Date.now() - startTime;
                if (elapsed < MIN_LOADING_TIME) {
                    await delay(MIN_LOADING_TIME - elapsed);
                }

                // Hide loading
                loadingIndicator.style.display = "none";

                // Display combined results
                displayResults(emailResults, passwordResult);

            } catch (error) {
                // Ensure minimum loading time even on error
                const elapsed = Date.now() - startTime;
                if (elapsed < MIN_LOADING_TIME) {
                    await delay(MIN_LOADING_TIME - elapsed);
                }
                loadingIndicator.style.display = "none";
                showError(error.message);
            }
        });
    }

    // ===== Delay helper =====
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== XposedOrNot API Call (via backend proxy) =====
    async function checkEmailBreach(email) {
        const response = await fetch("/api/check-breach", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API error: ${response.status}`);
        }

        return data;
    }

    // ===== Pwned Passwords API Call (via backend proxy) =====
    async function checkPasswordPwned(password) {
        const response = await fetch("/api/check-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API error: ${response.status}`);
        }

        return data;
    }

    // ===== Display Results =====
    function displayResults(emailResults, passwordResult) {
        if (resultsPlaceholder) {
            resultsPlaceholder.style.display = "none";
        }
        resultsCard.style.display = "block";
        breachResults.innerHTML = "";

        let resultsHTML = "";

        // Password Results Section
        if (passwordResult) {
            if (passwordResult.breached) {
                resultsHTML += `
                    <div class="passwordBreachResult breached ${passwordResult.severity}">
                        <div class="passwordBreachHeader">
                            <span class="passwordBreachIcon">⚠️</span>
                            <h4>Password Compromised</h4>
                        </div>
                        <p class="passwordBreachMessage">${passwordResult.message}</p>
                        <p class="passwordBreachAdvice">We strongly recommend changing this password immediately.</p>
                        <div class="passwordBreachSeverity">
                            <span class="severityLabel">Severity:</span>
                            <span class="severityBadge ${passwordResult.severity}">${passwordResult.severity.toUpperCase()}</span>
                        </div>
                    </div>
                `;
            } else {
                resultsHTML += `
                    <div class="passwordBreachResult safe">
                        <div class="passwordBreachHeader">
                            <span class="passwordBreachIcon">✅</span>
                            <h4>Password Not Found in Breaches</h4>
                        </div>
                        <p class="passwordBreachMessage">${passwordResult.message}</p>
                        <p class="passwordBreachNote">Note: This doesn't guarantee the password is strong—only that it hasn't appeared in known breaches.</p>
                    </div>
                `;
            }
        }

        // Email Results Section (handles multiple emails)
        if (emailResults && emailResults.length > 0) {
            emailResults.forEach(result => {
                // Show error message for email if API error
                if (result.error) {
                    resultsHTML += `
                        <div class="emailBreachNotice">
                            <div class="noticeHeader">
                                <span class="noticeIcon">⚠️</span>
                                <h4>Email Check Error for ${result.email}</h4>
                            </div>
                            <p class="noticeMessage">${result.error}</p>
                        </div>
                    `;
                } else if (!result.breached || result.breaches.length === 0) {
                    resultsHTML += `
                        <div class="noBreachFound">
                            <h4>Good News!</h4>
                            <p>No breaches found for <strong>${result.email}</strong></p>
                            <p style="margin-top: 8px; font-size: 13px;">Your email has not appeared in any known data breaches.</p>
                        </div>
                    `;
                } else {
                    // XposedOrNot returns breach names as simple strings
                    resultsHTML += `<div class="emailBreachSection">
                        <div class="emailBreachHeader breached">
                            <span class="breachIcon">⚠️</span>
                            <h4>Breaches Found for ${result.email}</h4>
                        </div>
                        <p class="breachSummary">This email was found in <strong>${result.breaches.length}</strong> data breach${result.breaches.length !== 1 ? 'es' : ''}:</p>
                        <div class="breachList">
                    `;

                    const breachesHTML = result.breaches.map(breachName => {
                        return `<span class="breachTag">${breachName}</span>`;
                    }).join('');

                    resultsHTML += breachesHTML + `
                        </div>
                        <p class="breachAdvice">We recommend reviewing your security settings and changing passwords for these services.</p>
                    </div>`;
                }
            });
        }

        breachResults.innerHTML = resultsHTML;

        // Scroll to results
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ===== Show Error =====
    function showError(message) {
        if (resultsPlaceholder) {
            resultsPlaceholder.style.display = "none";
        }
        loadingIndicator.style.display = "none";
        resultsCard.style.display = "block";
        breachResults.innerHTML = `
            <div class="errorMessage">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
});
