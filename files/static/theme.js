// Shared light/dark theme handling for every page.
//
// Previously each page did `document.body.classList.toggle("dark")` and nothing
// else: the choice was forgotten on every navigation (including logging out),
// the logic was duplicated between script.js and dashboardScripts.js, and
// aboutus.html had a toggle button but loaded no JS at all so it did nothing.
(function () {
    var STORAGE_KEY = 'footprintTheme';

    // localStorage throws in private mode in some browsers, so every access is
    // guarded - a failure should cost the preference, not break the page.
    function readStored() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function store(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            /* preference simply will not persist */
        }
    }

    function preferredTheme() {
        var stored = readStored();
        if (stored === 'dark' || stored === 'light') return stored;
        // No explicit choice yet, so follow the OS setting.
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function applyTheme(theme) {
        document.body.classList.toggle('dark', theme === 'dark');
    }

    // Runs the switch with a temporary class that gives every element the same
    // colour transition. Without it only the handful of elements carrying their
    // own transition animate and the rest snap instantly, which is what made
    // the toggle look abrupt. The class is removed afterwards so this never
    // interferes with other animations.
    function switchTheme(theme) {
        var root = document.body;
        root.classList.add('themeTransition');
        applyTheme(theme);
        store(theme);

        window.setTimeout(function () {
            root.classList.remove('themeTransition');
        }, 400);
    }

    function init() {
        // Apply without the transition class so the stored theme is simply the
        // starting state rather than something that visibly fades in on load.
        applyTheme(preferredTheme());

        var toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                switchTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
            });
        }

        // Follow the OS setting only while the user has not made a choice.
        if (window.matchMedia) {
            var media = window.matchMedia('(prefers-color-scheme: dark)');
            var onChange = function (ev) {
                if (readStored()) return;
                applyTheme(ev.matches ? 'dark' : 'light');
            };
            if (media.addEventListener) media.addEventListener('change', onChange);
            else if (media.addListener) media.addListener(onChange);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
