// ==UserScript==
// @name         Rocket Team Progress Tracker
// @namespace    http://rocketeam/
// @version      1.3.9
// @description  Track submissions with rocket-themed progress visualization, daily stats, timezone support, and calendar-based interaction tracking
// @author       @chrism245
// @match        https://a8c.zendesk.com/agent/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zendesk.com
// @updateURL    https://raw.githubusercontent.com/chrism245/Rocket-Team-Progress-Tracker/main/Rocket%20Team%20Progress%20Tracker-1.1.0.user.js
// @downloadURL  https://raw.githubusercontent.com/chrism245/Rocket-Team-Progress-Tracker/main/Rocket%20Team%20Progress%20Tracker-1.1.0.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Add Rocket-themed Styles and Dark Mode Support
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes rocketLaunch {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.03) translateY(-2px); }
            100% { transform: scale(1) translateY(0); }
        }

        @keyframes thrusterPulse {
            0% { box-shadow: 0 0 5px var(--progress-color); }
            50% { box-shadow: 0 0 15px var(--progress-color); }
            100% { box-shadow: 0 0 5px var(--progress-color); }
        }

        @keyframes flameEffect {
            0% { opacity: 0.7; transform: scaleY(1); }
            50% { opacity: 1; transform: scaleY(1.2); }
            100% { opacity: 0.7; transform: scaleY(1); }
        }

        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }

        .milestone-reached {
            animation: rocketLaunch 0.5s ease-in-out,
                       thrusterPulse 1s ease-in-out 3;
        }

        .count-increment {
            animation: rocketLaunch 0.3s ease-in-out;
        }

        .progress-icon {
            font-size: 14px;
            margin-right: 5px;
            vertical-align: middle;
        }

        [data-theme="dark"] #submission-count-display {
            background-color: #2d2d2d;
            color: #ffffff;
        }


        .interactions-panel {
            position: fixed;
            right: -400px;
            top: 60px;
            width: 320px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: -2px 0 15px rgba(0,0,0,0.1);
            transition: right 0.3s ease, opacity 0.3s ease;
            z-index: 9999;
            max-height: 80vh;
            overflow-y: auto;
            opacity: 0;
            pointer-events: none;
            display: none;
        }

        .interactions-panel.open {
            right: 10px;
            opacity: 1;
            pointer-events: auto;
            display: block;
        }

        [data-theme="dark"] .interactions-panel {
            background-color: #2d2d2d;
            color: #ffffff;
            border-color: #444;
        }

        .interactions-toggle {
            position: fixed;
            right: 10px;
            top: 60px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            z-index: 9998;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .interactions-toggle:hover {
            background: #1976D2;
            transform: scale(1.05);
            transition: all 0.2s ease;
        }


        .theme-toggle {
            position: absolute;
            right: 10px;
            top: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
        }

        #submission-count-display {
            padding: 4px;
            background-color: #f0f0f0;
            border-radius: 4px;
            font-size: 10px;
            float: right;
            margin: auto 5px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            min-width: 180px;
            max-width: 220px;
            height: fit-content;
            box-sizing: border-box;
            gap: 4px;
            flex-wrap: nowrap;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        #submission-progress-bar {
            height: 4px;
            border-radius: 2px;
            transition: width 0.3s ease-in-out, background-color 0.3s ease-in-out;
        }


        .interactions-calendar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .interactions-calendar-overlay.open {
            display: flex;
        }

        .interactions-calendar-container {
            background: var(--bg-color, #fff);
            border-radius: 12px;
            padding: 25px;
            max-width: 1000px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            position: relative;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
            margin-top: 15px;
            border: 1px solid var(--border-color, #ddd);
            border-radius: 8px;
            padding: 4px;
            background: var(--grid-bg, #f9f9f9);
        }

        .calendar-day-header {
            text-align: center;
            font-weight: bold;
            padding: 12px 8px;
            background: var(--header-bg, #e8e8e8);
            border-radius: 4px;
            font-size: 13px;
            color: var(--header-text, #555);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .calendar-day {
            aspect-ratio: 1;
            min-height: 80px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            padding: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background: var(--day-bg, #fff);
            position: relative;
        }

        .calendar-day:hover {
            transform: scale(1.05);
            border-color: var(--hover-color, #2196F3);
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
        }

        .calendar-day.other-month {
            opacity: 0.3;
        }

        .calendar-day.today {
            border-color: var(--today-color, #4CAF50);
            background: var(--today-bg, #e8f5e9);
        }

        .calendar-day.has-interactions {
            background: var(--interaction-bg, #e3f2fd);
            border-color: var(--interaction-border, #2196F3);
        }

        .calendar-day-number {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--day-number-color, #333);
            align-self: flex-start;
            width: 100%;
            text-align: left;
            padding-left: 4px;
        }

        .calendar-day.other-month .calendar-day-number {
            color: var(--other-month-color, #bbb);
        }

        .calendar-day-count {
            font-size: 11px;
            color: var(--count-color, #fff);
            font-weight: bold;
            background: var(--count-bg, #2196F3);
            padding: 3px 7px;
            border-radius: 12px;
            min-width: 22px;
            text-align: center;
            margin-top: auto;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .calendar-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--nav-border, #e0e0e0);
        }

        .calendar-nav h2 {
            font-size: 24px;
            font-weight: 600;
            color: var(--month-year-color, #333);
            margin: 0;
        }

        .calendar-nav button {
            background: var(--button-bg, #2196F3);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .calendar-nav button:hover {
            background: var(--button-hover, #1976D2);
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
        }

        .interactions-list {
            margin-top: 20px;
            max-height: 400px;
            overflow-y: auto;
        }

        .interaction-item {
            border: 1px solid var(--border-color, #ddd);
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 10px;
            background: var(--item-bg, #f9f9f9);
            cursor: pointer;
            transition: background 0.2s;
        }

        .interaction-item:hover {
            background: var(--item-hover-bg, #e8f4f8);
        }

        [data-theme="dark"] .interactions-calendar-container {
            background-color: #2d2d2d;
            color: #ffffff;
        }

        [data-theme="dark"] .calendar-grid {
            background: #1e1e1e;
            border-color: #444;
        }

        [data-theme="dark"] .calendar-day-header {
            background: #3d3d3d;
            color: #ccc;
        }

        [data-theme="dark"] .calendar-day {
            background: #3d3d3d;
            border-color: #555;
        }

        [data-theme="dark"] .calendar-day.has-interactions {
            background: #1e3a5f;
            border-color: #2196F3;
        }

        [data-theme="dark"] .calendar-day.today {
            background: #2d4a2d;
            border-color: #4CAF50;
        }

        [data-theme="dark"] .calendar-nav {
            border-color: #444;
        }

        [data-theme="dark"] .calendar-nav h2 {
            color: #fff;
        }

        [data-theme="dark"] .interaction-item {
            background-color: #3d3d3d !important;
            border-color: #555 !important;
        }

        [data-theme="dark"] .interaction-item:hover {
            background-color: #4d4d4d !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // Initialize variables
    let submissionCounter = parseInt(localStorage.getItem('zendeskSubmissionCounter') || '0');
    // lastTicketIds removed — dedup is handled by commentCounts per-observer
    let dailyTarget = parseInt(localStorage.getItem('zendeskDailyTarget') || '0');
    let workingHours = parseInt(localStorage.getItem('zendeskWorkingHours') || '0');
    let interactionsPerHour = parseFloat(localStorage.getItem('zendeskInteractionsPerHour') || '3.5');

    // Timezone Management
    const timezoneManager = {
        getCurrentTimezone: function() {
            return localStorage.getItem('zendeskPreferredTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
        },

        setTimezone: function(timezone) {
            localStorage.setItem('zendeskPreferredTimezone', timezone);
        },

        formatDateForTimezone: function(date = new Date()) {
            try {
                return date.toLocaleDateString('en-US', {
                    timeZone: this.getCurrentTimezone(),
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } catch (e) {
                console.error('Invalid timezone, resetting to local timezone');
                this.setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                return date.toLocaleDateString('en-US');
            }
        },

        getAvailableTimezones: function() {
            return Intl.supportedValuesOf('timeZone');
        }
    };

    // Maps a raw product string to a canonical ticket-type label
    function normalizeTicketType(raw) {
        if (!raw) return '';
        const s = raw.toLowerCase();
        if (/\bmobile\b|ios|android|jetpack.?mobile/i.test(s))   return 'Mobile';
        if (/mailpoet/i.test(s))                                  return 'MailPoet';
        if (/woocommerce|woo(?!dpress)/i.test(s))                 return 'WooCommerce';
        if (/jetpack/i.test(s))                                   return 'Jetpack';
        if (/wordpress\.com|wpcom/i.test(s))                      return 'WordPress.com';
        if (/akismet/i.test(s))                                   return 'Akismet';
        if (/pressable/i.test(s))                                 return 'Pressable';
        if (/plugin/i.test(s))                                    return 'Plugin';
        // Return title-cased raw value if no match
        return raw.trim().replace(/\b\w/g, c => c.toUpperCase());
    }

    // Returns a color hex for a given ticket-type label
    function ticketTypeColor(type) {
        const map = {
            'Mobile':        '#6366f1',
            'MailPoet':      '#ec4899',
            'WooCommerce':   '#8b5cf6',
            'Jetpack':       '#06b6d4',
            'WordPress.com': '#3b82f6',
            'Akismet':       '#f59e0b',
            'Pressable':     '#10b981',
            'Plugin':        '#64748b',
        };
        return map[type] || '#94a3b8';
    }

    // Searches the full document for the Product dropdown field.
    // Zendesk renders it as a Garden dropdown outside the conversationPane.
    function detectProductFromPage() {
        // Strategy 1 (most reliable): find any ticket-form dropdown whose label says "Product",
        // then read the title attribute on the selected value element.
        const dropdownFields = document.querySelectorAll('[data-test-id^="ticket-form-field-dropdown-field-"]');
        dbg(`[detectProduct S1] found ${dropdownFields.length} dropdown fields`);
        for (const field of dropdownFields) {
            const label = field.querySelector('label');
            if (!label || !/^product$/i.test(label.textContent.trim())) continue;
            dbg(`[detectProduct S1] found "Product" label in field ${field.getAttribute('data-test-id')}`);
            const valueEl = field.querySelector('[data-test-id="ticket-form-field-dropdown-button"] [title]');
            dbg(`[detectProduct S1] valueEl:`, valueEl ? `title="${valueEl.getAttribute('title')}" text="${valueEl.textContent.trim()}"` : 'null');
            if (valueEl) {
                const val = (valueEl.getAttribute('title') || valueEl.textContent.trim()).trim();
                if (val && !/^[-–—\s]+$/.test(val)) {
                    dbg(`[detectProduct S1] ✓ returning "${val}"`);
                    return val;
                }
            }
        }

        // Strategy 2: broader Garden dropdown containers with a "Product" label
        const allFields = document.querySelectorAll('[data-garden-id="forms.field"]');
        dbg(`[detectProduct S2] found ${allFields.length} garden form fields`);
        for (const field of allFields) {
            const label = field.querySelector('label');
            if (!label || !/^product$/i.test(label.textContent.trim())) continue;
            dbg(`[detectProduct S2] found "Product" label`);
            const valueEl = field.querySelector('[title]');
            if (valueEl) {
                const val = (valueEl.getAttribute('title') || valueEl.textContent.trim()).trim();
                if (val && !/^product$/i.test(val) && !/^[-–—\s]+$/.test(val)) {
                    dbg(`[detectProduct S2] ✓ returning "${val}"`);
                    return val;
                }
            }
        }

        // Strategy 3: aria-label attributes containing "Product"
        const ariaEls = document.querySelectorAll('[aria-label*="Product" i]');
        dbg(`[detectProduct S3] found ${ariaEls.length} elements with aria-label containing "Product"`);
        for (const el of ariaEls) {
            const val = el.getAttribute('title') || el.textContent.trim();
            dbg(`[detectProduct S3] el tag=${el.tagName} aria-label="${el.getAttribute('aria-label')}" title="${el.getAttribute('title')}" text="${el.textContent.trim().substring(0, 50)}"`);
            if (val && !/^product$/i.test(val) && !/^[-–—\s]+$/.test(val)) {
                dbg(`[detectProduct S3] ✓ returning "${val}"`);
                return val;
            }
        }

        dbgWarn('[detectProduct] all strategies failed — product field not found in DOM');
        return '';
    }

    // Interaction Tracking System
    const interactionTracker = {
        data: JSON.parse(localStorage.getItem('zendeskInteractions') || '{}'),
        trackedToday: new Set(),

        trackInteraction: function(ticketId, ticketData) {
            const today = timezoneManager.formatDateForTimezone();
            const interactionKey = `${today}_${ticketId}`;

            // Skip if already tracked today
            if (this.trackedToday.has(interactionKey)) {
                return;
            }

            if (!this.data[today]) {
                this.data[today] = [];
            }

            // Check if this ticket was already tracked today
            const existingIndex = this.data[today].findIndex(interaction => interaction.ticketId === ticketId);
            if (existingIndex !== -1) {
                // Update existing entry with latest data
                this.data[today][existingIndex] = {
                    ...this.data[today][existingIndex],
                    ...ticketData,
                    lastAccessed: new Date().toISOString()
                };
            } else {
                // Add new interaction
                this.data[today].push({
                    ticketId: ticketId,
                    timestamp: new Date().toISOString(),
                    lastAccessed: new Date().toISOString(),
                    ...ticketData
                });
            }

            this.trackedToday.add(interactionKey);
            this.save();
        },

        getTicketData: function(ticketId) {
            return new Promise((resolve) => {
                // Wait a bit for the page to fully load
                setTimeout(() => {
                    const conversationPane = document.querySelector(
                        `[data-support-suite-trial-onboarding-id="conversationPane"][data-ticket-id="${ticketId}"]`
                    );

                    const ticketData = {
                        url: window.location.href,
                        ticketId: ticketId,
                        subject: '',
                        product: '',
                        ticketType: '',
                        status: '',
                        priority: '',
                        requester: ''
                    };

                    // Extract ticket ID from URL if available
                    const urlMatch = window.location.href.match(/\/tickets\/(\d+)/);
                    if (urlMatch) {
                        ticketData.ticketId = urlMatch[1];
                    }

                    if (conversationPane) {
                        // Get ticket subject/title - aggressively filter out notification banners
                        const notificationPatterns = [
                            /checking for new messages?/i,
                            /new messages? available/i,
                            /messages? available/i,
                            /unread/i,
                            /notification/i,
                            /alert/i,
                            /^messages?$/i,
                            /^new$/i,
                            /available/i
                        ];
                        
                        // Helper function to check if element is likely a notification
                        function isNotificationElement(element) {
                            if (!element) return true;
                            
                            const text = element.textContent.trim();
                            if (!text || text.length < 3) return true;
                            
                            // Check text patterns
                            if (notificationPatterns.some(pattern => pattern.test(text))) {
                                return true;
                            }
                            
                            // Check element classes/attributes that indicate notifications
                            const className = element.className || '';
                            const id = element.id || '';
                            const role = element.getAttribute('role') || '';
                            const ariaLabel = element.getAttribute('aria-label') || '';
                            
                            const notificationIndicators = [
                                /notification/i,
                                /alert/i,
                                /banner/i,
                                /toast/i,
                                /message.*available/i,
                                /unread/i
                            ];
                            
                            const checkString = (className + ' ' + id + ' ' + role + ' ' + ariaLabel).toLowerCase();
                            if (notificationIndicators.some(pattern => pattern.test(checkString))) {
                                return true;
                            }
                            
                            // Check parent elements for notification indicators
                            let parent = element.parentElement;
                            let depth = 0;
                            while (parent && depth < 3) {
                                const parentClass = (parent.className || '').toLowerCase();
                                const parentId = (parent.id || '').toLowerCase();
                                if (notificationIndicators.some(pattern => 
                                    pattern.test(parentClass) || pattern.test(parentId))) {
                                    return true;
                                }
                                parent = parent.parentElement;
                                depth++;
                            }
                            
                            return false;
                        }
                        
                        // First, try to find subject in header area (most reliable location)
                        const headerArea = conversationPane.querySelector('[class*="header"]') || 
                                         conversationPane.querySelector('[data-test-id*="header"]') ||
                                         conversationPane.querySelector('[role="banner"]');
                        
                        if (headerArea) {
                            // Try specific subject selectors in header first
                            const headerSubjectSelectors = [
                                '[data-test-id="omni-header-subject"]',
                                'h1[data-test-id*="subject"]',
                                '[class*="subject"][class*="header"]',
                                '[aria-label*="subject" i]'
                            ];
                            
                            for (const selector of headerSubjectSelectors) {
                                const element = headerArea.querySelector(selector);
                                if (element && !isNotificationElement(element)) {
                                    const subjectText = element.textContent.trim();
                                    if (subjectText && subjectText.length > 5) {
                                        ticketData.subject = subjectText;
                                        break;
                                    }
                                }
                            }
                            
                            // If still no subject, try h1 in header but filter notifications aggressively
                            if (!ticketData.subject) {
                                const headerH1s = headerArea.querySelectorAll('h1');
                                for (let i = 0; i < headerH1s.length; i++) {
                                    const h1 = headerH1s[i];
                                    if (!isNotificationElement(h1)) {
                                        const text = h1.textContent.trim();
                                        if (text && text.length > 5) {
                                            ticketData.subject = text;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // If still no subject, try broader search but always filter notifications aggressively
                        if (!ticketData.subject) {
                            const subjectSelectors = [
                                '[data-test-id="omni-header-subject"]',
                                'h1[data-test-id*="subject"]',
                                '[class*="subject"]',
                                '[aria-label*="subject" i]'
                            ];
                            
                            for (const selector of subjectSelectors) {
                                const elements = conversationPane.querySelectorAll(selector);
                                for (let i = 0; i < elements.length; i++) {
                                    const element = elements[i];
                                    if (!isNotificationElement(element)) {
                                        const text = element.textContent.trim();
                                        if (text && text.length > 5) {
                                            ticketData.subject = text;
                                            break;
                                        }
                                    }
                                }
                                if (ticketData.subject) break;
                            }
                        }
                        
                        // Last resort: try all h1 elements but be very strict about filtering
                        if (!ticketData.subject) {
                            const allH1s = conversationPane.querySelectorAll('h1');
                            for (let i = 0; i < allH1s.length; i++) {
                                const h1 = allH1s[i];
                                if (!isNotificationElement(h1)) {
                                    const text = h1.textContent.trim();
                                    // Require longer text and check it doesn't look like a notification
                                    if (text && text.length > 10 && 
                                        !/^(new|messages?|available|unread|notification|alert)/i.test(text)) {
                                        ticketData.subject = text;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Final fallback: try to extract from page title
                        // Zendesk usually formats title as "Ticket #12345 - Subject - Zendesk" or similar
                        if (!ticketData.subject) {
                            const pageTitle = document.title.trim();
                            if (pageTitle) {
                                // Helper to check if text looks like notification
                                function isNotificationText(text) {
                                    if (!text || text.length < 3) return true;
                                    return notificationPatterns.some(pattern => pattern.test(text));
                                }
                                
                                // Try to extract subject from title (usually between ticket ID and "Zendesk" or similar)
                                const titleMatch = pageTitle.match(/Ticket\s*#?\d+\s*[-–—]\s*(.+?)(?:\s*[-–—]|\s*\||\s*-\s*Zendesk|$)/i);
                                if (titleMatch && titleMatch[1]) {
                                    const titleSubject = titleMatch[1].trim();
                                    // Make sure it's not a notification
                                    if (titleSubject && titleSubject.length > 5 && !isNotificationText(titleSubject)) {
                                        ticketData.subject = titleSubject;
                                    }
                                } else {
                                    // If no standard format, try to get text after ticket number
                                    const altMatch = pageTitle.match(/#?\d+\s*[-–—]\s*(.+)/i);
                                    if (altMatch && altMatch[1]) {
                                        const altSubject = altMatch[1].trim();
                                        // Remove common suffixes
                                        const cleanedSubject = altSubject.replace(/\s*[-–—]\s*(Zendesk|Agent|Support).*$/i, '').trim();
                                        if (cleanedSubject && cleanedSubject.length > 5 && !isNotificationText(cleanedSubject)) {
                                            ticketData.subject = cleanedSubject;
                                        }
                                    }
                                }
                            }
                        }

                        // The Zendesk Product field lives in the sidebar, which is outside conversationPane.
                        // Use detectProductFromPage() which has the exact Zendesk-specific selectors.
                        ticketData.product = detectProductFromPage();
                        dbg(`[Product detection] raw value: "${ticketData.product}"`);

                        // Derive normalized ticket type from whatever product value we found
                        ticketData.ticketType = normalizeTicketType(ticketData.product);
                        dbg(`[Product detection] normalized type: "${ticketData.ticketType}"`);

                        // Get status
                        const statusSelectors = [
                            '[data-test-id*="status"]',
                            '[class*="status"]',
                            'button[aria-label*="status" i]'
                        ];
                        for (const selector of statusSelectors) {
                            const element = conversationPane.querySelector(selector);
                            if (element && element.textContent.trim()) {
                                ticketData.status = element.textContent.trim();
                                break;
                            }
                        }

                        // Get priority
                        const prioritySelectors = [
                            '[data-test-id*="priority"]',
                            '[class*="priority"]',
                            'button[aria-label*="priority" i]'
                        ];
                        for (const selector of prioritySelectors) {
                            const element = conversationPane.querySelector(selector);
                            if (element && element.textContent.trim()) {
                                ticketData.priority = element.textContent.trim();
                                break;
                            }
                        }

                        // Get requester from first comment
                        const requesterSelectors = [
                            '[data-test-id="omni-log-comment-user-link"]',
                            '[class*="requester"]',
                            'a[href*="/users/"]'
                        ];
                        for (const selector of requesterSelectors) {
                            const element = conversationPane.querySelector(selector);
                            if (element && element.textContent.trim()) {
                                ticketData.requester = element.textContent.trim();
                                break;
                            }
                        }
                    }

                    resolve(ticketData);
                }, 500); // Wait 500ms for page to load
            });
        },

        save: function() {
            localStorage.setItem('zendeskInteractions', JSON.stringify(this.data));
        },

        createInteractionsPanel: function() {
            // Create toggle button for calendar view
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'interactions-toggle';
            toggleBtn.innerHTML = '📅';
            toggleBtn.title = 'Open Interaction Tracker Calendar';
            document.body.appendChild(toggleBtn);

            // Open calendar in new tab when clicked
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCalendarInNewTab();
            });
        },

        openCalendarInNewTab: function() {
            // Load latest data
            this.data = JSON.parse(localStorage.getItem('zendeskInteractions') || '{}');
            const timezone = localStorage.getItem('zendeskPreferredTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
            const theme = localStorage.getItem('zendeskTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            
            const calendarHTML = this.generateCalendarHTML(timezone, theme);
            const calendarScript = this.generateCalendarScript(timezone);
            
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(calendarHTML);
                newWindow.document.close();
                
                // Inject script after HTML is written to avoid CSP issues
                // Wait a bit longer to ensure DOM is ready
                setTimeout(() => {
                    try {
                        if (newWindow.document && newWindow.document.body) {
                            const script = newWindow.document.createElement('script');
                            script.textContent = calendarScript;
                            newWindow.document.body.appendChild(script);
                        } else {
                            // If body not ready, wait and try again
                            setTimeout(() => {
                                const script = newWindow.document.createElement('script');
                                script.textContent = calendarScript;
                                newWindow.document.body.appendChild(script);
                            }, 100);
                        }
                    } catch (e) {
                        console.error('Error injecting calendar script:', e);
                    }
                }, 50);
            }
        },

        generateCalendarHTML: function(timezone, theme) {
            const interactionData = JSON.parse(localStorage.getItem('zendeskInteractions') || '{}');
            
            return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interaction Tracker Calendar - Rocket Team Progress Tracker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--bg-color, #f5f5f5);
            color: var(--text-color, #333);
            padding: 20px;
            min-height: 100vh;
        }

        .calendar-container {
            max-width: 1400px;
            margin: 0 auto;
            background: var(--bg-color, #fff);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--border-color, #e0e0e0);
        }

        .calendar-header h1 {
            font-size: 28px;
            color: var(--title-color, #333);
        }

        .monthly-total {
            text-align: right;
        }

        .monthly-total-label {
            font-size: 14px;
            color: var(--text-color, #666);
            margin-bottom: 5px;
        }

        .monthly-total-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--total-color, #2196F3);
        }

        .calendar-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .calendar-nav button {
            background: var(--button-bg, #2196F3);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .calendar-nav button:hover {
            background: var(--button-hover, #1976D2);
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
        }

        .calendar-nav h2 {
            font-size: 24px;
            font-weight: 600;
            color: var(--month-year-color, #333);
            margin: 0;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 2px;
            border: 1px solid var(--border-color, #ddd);
            border-radius: 8px;
            overflow: hidden;
            background: var(--grid-bg, #f9f9f9);
        }

        .calendar-day-header {
            text-align: center;
            font-weight: bold;
            padding: 12px 8px;
            background: var(--header-bg, #e8e8e8);
            font-size: 13px;
            color: var(--header-text, #555);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .calendar-day-header.total-header {
            background: var(--total-header-bg, #2196F3);
            color: white;
        }

        .calendar-day {
            min-height: 120px;
            border: 1px solid var(--border-color, #e0e0e0);
            padding: 10px;
            background: var(--day-bg, #fff);
            position: relative;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
        }

        .calendar-day:hover {
            background: var(--day-hover-bg, #f0f0f0);
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
        }

        .calendar-day.other-month {
            opacity: 0.3;
            background: var(--other-month-bg, #f5f5f5);
        }

        .calendar-day.today {
            border: 2px solid var(--today-color, #4CAF50);
            background: var(--today-bg, #e8f5e9);
        }

        .calendar-day.has-interactions {
            background: var(--interaction-bg, #e3f2fd);
        }

        .calendar-day-number {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--day-number-color, #333);
        }

        .calendar-day-icon {
            font-size: 14px;
            margin-bottom: 5px;
            opacity: 0.7;
        }

        .calendar-day-count {
            font-size: 18px;
            font-weight: bold;
            color: var(--count-color, #2196F3);
            margin-bottom: 3px;
        }

        .calendar-day-count.zero {
            color: var(--zero-color, #999);
        }

        .calendar-day-trades {
            font-size: 11px;
            color: var(--trades-color, #666);
            margin-top: auto;
        }

        .calendar-week-total {
            min-height: 120px;
            border: 1px solid var(--border-color, #e0e0e0);
            padding: 10px;
            background: var(--week-total-bg, #f8f9fa);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-weight: bold;
        }

        .week-total-count {
            font-size: 20px;
            color: var(--total-color, #2196F3);
            margin-bottom: 5px;
        }

        .week-total-trades {
            font-size: 12px;
            color: var(--trades-color, #666);
        }

        .interactions-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .interactions-modal.open {
            display: flex;
        }

        .interactions-modal-content {
            background: var(--bg-color, #fff);
            border-radius: 12px;
            padding: 25px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            position: relative;
        }

        .interactions-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--border-color, #e0e0e0);
        }

        .interactions-modal-header h3 {
            font-size: 20px;
            color: var(--title-color, #333);
        }

        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--close-color, #ff4444);
            padding: 5px;
        }

        .interactions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .interaction-item {
            border: 1px solid var(--border-color, #ddd);
            border-radius: 4px;
            padding: 12px;
            background: var(--item-bg, #f9f9f9);
            cursor: pointer;
            transition: background 0.2s;
        }

        .interaction-item:hover {
            background: var(--item-hover-bg, #e8f4f8);
        }

        [data-theme="dark"] {
            --bg-color: #1e1e1e;
            --text-color: #fff;
            --title-color: #fff;
            --grid-bg: #2d2d2d;
            --border-color: #444;
            --header-bg: #3d3d3d;
            --header-text: #ccc;
            --day-bg: #3d3d3d;
            --day-hover-bg: #4d4d4d;
            --other-month-bg: #2d2d2d;
            --interaction-bg: #1e3a5f;
            --today-bg: #2d4a2d;
            --today-color: #4CAF50;
            --item-bg: #3d3d3d;
            --item-hover-bg: #4d4d4d;
            --week-total-bg: #2d2d2d;
            --total-header-bg: #1976D2;
        }
    </style>
</head>
<body>
    <div class="calendar-container">
        <div class="calendar-header">
            <h1>🚀 Interaction Tracker Calendar</h1>
            <div class="monthly-total">
                <div class="monthly-total-label">Monthly Interactions</div>
                <div class="monthly-total-value" id="monthly-total">0</div>
            </div>
        </div>
        <div class="calendar-nav">
            <button id="prev-month">← Previous Month</button>
            <h2 id="calendar-month-year"></h2>
            <button id="next-month">Next Month →</button>
        </div>
        <div id="calendar-grid"></div>
    </div>

    <div class="interactions-modal" id="interactions-modal">
        <div class="interactions-modal-content">
            <div class="interactions-modal-header">
                <h3 id="modal-date-title"></h3>
                <button class="close-modal" id="close-modal">×</button>
            </div>
            <div id="interactions-list" class="interactions-list"></div>
        </div>
    </div>
</body>
</html>`;
        },

        generateCalendarScript: function(timezone) {
            // Get data from the parent window's localStorage before opening new window
            const interactionData = JSON.parse(localStorage.getItem('zendeskInteractions') || '{}');
            
            return `(function() {
                const timezone = '${timezone}';
                const interactionData = ${JSON.stringify(interactionData)};
                
                // Always start on the current month - force it explicitly
                const now = new Date();
                let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
                
                // Try to find the most recent month with interactions
                const allKeys = Object.keys(interactionData);
                if (allKeys.length > 0) {
                    // Parse all date keys and find the most recent one
                    let mostRecentDate = null;
                    for (let i = 0; i < allKeys.length; i++) {
                        const key = allKeys[i];
                        const keyParts = key.split('/');
                        if (keyParts.length === 3) {
                            const keyMonth = parseInt(keyParts[0]) - 1;
                            const keyDay = parseInt(keyParts[1]);
                            const keyYear = parseInt(keyParts[2]);
                            const keyDate = new Date(keyYear, keyMonth, keyDay);
                            if (!mostRecentDate || keyDate > mostRecentDate) {
                                mostRecentDate = keyDate;
                            }
                        }
                    }
                    // If we found interactions and they're not in the current month, start on that month
                    if (mostRecentDate) {
                        const mostRecentMonth = new Date(mostRecentDate.getFullYear(), mostRecentDate.getMonth(), 1);
                        // Only switch if the most recent month is different from current month
                        if (mostRecentMonth.getTime() !== currentDate.getTime()) {
                            console.log('Found interactions in', mostRecentMonth, '- switching calendar to that month');
                            currentDate = mostRecentMonth;
                        }
                    }
                }
                
                console.log('Calendar initialized with date:', currentDate);
                console.log('Current date (now):', now);
                console.log('Interaction data keys:', allKeys);
                if (allKeys.length > 0) {
                    console.log('First date key:', allKeys[0], '- Interactions:', interactionData[allKeys[0]].length);
                }
                console.log('Total interactions:', Object.values(interactionData).reduce(function(sum, arr) { return sum + (Array.isArray(arr) ? arr.length : 0); }, 0));

                function formatDateForTimezone(date) {
                    try {
                        return date.toLocaleDateString('en-US', {
                            timeZone: timezone,
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    } catch (e) {
                        return date.toLocaleDateString('en-US');
                    }
                }

                function renderCalendar(date) {
                    const grid = document.getElementById('calendar-grid');
                    const monthYear = document.getElementById('calendar-month-year');
                    
                    if (!grid || !monthYear) {
                        console.error('Calendar grid or month year element not found');
                        return;
                    }
                    
                    // Verify grid CSS is applied
                    const gridStyle = window.getComputedStyle(grid);
                    if (gridStyle.display !== 'grid') {
                        console.error('Grid display not applied! Current display:', gridStyle.display);
                        grid.style.display = 'grid';
                        grid.style.gridTemplateColumns = 'repeat(8, 1fr)';
                        grid.style.gap = '2px';
                    }

                    const year = date.getFullYear();
                    const month = date.getMonth();
                    
                    monthYear.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startingDayOfWeek = firstDay.getDay();

                    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Total'];
                    
                    grid.innerHTML = '';
                    
                    dayHeaders.forEach(function(day) {
                        const header = document.createElement('div');
                        header.className = 'calendar-day-header' + (day === 'Total' ? ' total-header' : '');
                        header.textContent = day;
                        grid.appendChild(header);
                    });
                    
                    console.log('Rendering calendar for', year, month, 'with', Object.keys(interactionData).length, 'date keys');
                    const allKeys = Object.keys(interactionData);
                    console.log('All date keys in data:', allKeys);
                    if (allKeys.length > 0) {
                        console.log('First date key:', allKeys[0], '- Interactions:', interactionData[allKeys[0]].length);
                    }

                    const weekTotals = {};
                    let monthlyTotal = 0;
                    const dayCells = []; // Store all day cells first, then render in rows

                    const today = new Date();
                    const todayDate = today.getDate();
                    const todayMonth = today.getMonth();
                    const todayYear = today.getFullYear();

                    // Add empty cells for days before month starts
                    for (let i = 0; i < startingDayOfWeek; i++) {
                        const emptyDay = document.createElement('div');
                        emptyDay.className = 'calendar-day other-month';
                        dayCells.push({ element: emptyDay, weekIndex: 0 });
                    }

                    // Add days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                        const currentDate = new Date(year, month, day);
                        const dateStr = formatDateForTimezone(currentDate);
                        const dayOfWeek = currentDate.getDay();
                        
                        const weekIndex = Math.floor((day - 1 + startingDayOfWeek) / 7);
                        const weekKey = 'week-' + weekIndex;
                        
                        // Try multiple date formats to match stored data
                        let interactions = interactionData[dateStr] || [];
                        
                        // If not found, try matching with different date formats
                        if (interactions.length === 0 && Object.keys(interactionData).length > 0) {
                            const allKeys = Object.keys(interactionData);
                            for (let i = 0; i < allKeys.length; i++) {
                                const key = allKeys[i];
                                // Try parsing the key as a date (MM/DD/YYYY format)
                                const keyParts = key.split('/');
                                if (keyParts.length === 3) {
                                    const keyMonth = parseInt(keyParts[0]) - 1; // Month is 0-indexed
                                    const keyDay = parseInt(keyParts[1]);
                                    const keyYear = parseInt(keyParts[2]);
                                    
                                    // Match if year, month, and day match
                                    if (keyYear === year && keyMonth === month && keyDay === day) {
                                        interactions = interactionData[key] || [];
                                        console.log('✓ Matched day', day, '- Stored key:', key, '- Found', interactions.length, 'interactions');
                                        break;
                                    }
                                }
                            }
                            
                            // If still not found, try direct comparison with all keys
                            if (interactions.length === 0 && day <= 3) {
                                console.log('Day', day, '- Generated dateStr:', dateStr, '- No match found. Checking all keys...');
                                for (let i = 0; i < allKeys.length; i++) {
                                    const key = allKeys[i];
                                    console.log('  Checking key:', key, '- Value:', interactionData[key]);
                                }
                            }
                        } else if (interactions.length > 0 && day <= 3) {
                            console.log('✓ Direct match for day', day, '- dateStr:', dateStr, '- Found', interactions.length, 'interactions');
                        }
                        
                        const interactionCount = interactions.length;
                        monthlyTotal += interactionCount;

                        if (!weekTotals[weekKey]) {
                            weekTotals[weekKey] = { count: 0, trades: 0 };
                        }
                        weekTotals[weekKey].count += interactionCount;
                        weekTotals[weekKey].trades += interactionCount;

                        const dayElement = document.createElement('div');
                        dayElement.className = 'calendar-day';
                        
                        if (day === todayDate && month === todayMonth && year === todayYear) {
                            dayElement.classList.add('today');
                        }
                        
                        if (interactionCount > 0) {
                            dayElement.classList.add('has-interactions');
                        }

                        const zeroClass = interactionCount === 0 ? 'zero' : '';
                        const interactionText = interactionCount === 1 ? '1 interaction' : interactionCount + ' interactions';
                        
                        dayElement.innerHTML = '<div class="calendar-day-number">' + day + '</div>' +
                            '<div class="calendar-day-icon">📄</div>' +
                            '<div class="calendar-day-count ' + zeroClass + '">' + interactionCount + '</div>' +
                            '<div class="calendar-day-trades">' + interactionText + '</div>';

                        dayElement.onclick = function() {
                            showInteractionsForDate(dateStr, currentDate, interactions);
                        };

                        dayCells.push({ element: dayElement, weekIndex: weekIndex });
                    }

                    // Add empty cells for days after month ends to complete the last week
                    const totalDayCells = dayCells.length;
                    const remainingCells = totalDayCells % 7;
                    if (remainingCells > 0) {
                        const cellsToAdd = 7 - remainingCells;
                        for (let i = 0; i < cellsToAdd; i++) {
                            const emptyDay = document.createElement('div');
                            emptyDay.className = 'calendar-day other-month';
                            const lastWeekIndex = dayCells.length > 0 ? dayCells[dayCells.length - 1].weekIndex : 0;
                            dayCells.push({ element: emptyDay, weekIndex: lastWeekIndex });
                        }
                    }

                    // Render cells in rows of 7 day cells + 1 week total = 8 cells per row
                    // The grid has 8 columns, so each row should have exactly 8 cells
                    const totalRows = Math.ceil(dayCells.length / 7);
                    console.log('Rendering', totalRows, 'rows with', dayCells.length, 'day cells');
                    
                    for (let row = 0; row < totalRows; row++) {
                        const startIdx = row * 7;
                        const weekCells = dayCells.slice(startIdx, startIdx + 7);
                        
                        const weekIndex = weekCells.length > 0 ? weekCells[0].weekIndex : row;
                        const weekKey = 'week-' + weekIndex;
                        
                        // Add exactly 7 day cells for this row
                        for (let col = 0; col < 7; col++) {
                            if (col < weekCells.length) {
                                grid.appendChild(weekCells[col].element);
                            } else {
                                // Fill with empty cell if needed
                                const emptyDay = document.createElement('div');
                                emptyDay.className = 'calendar-day other-month';
                                grid.appendChild(emptyDay);
                            }
                        }
                        
                        // Add the week total (8th cell in the row)
                        const weekTotal = document.createElement('div');
                        weekTotal.className = 'calendar-week-total';
                        const weekData = weekTotals[weekKey] || { count: 0, trades: 0 };
                        const weekInteractionText = weekData.trades === 1 ? '1 interaction' : weekData.trades + ' interactions';
                        weekTotal.innerHTML = '<div class="week-total-count">' + weekData.count + '</div>' +
                            '<div class="week-total-trades">' + weekInteractionText + '</div>';
                        grid.appendChild(weekTotal);
                    }
                    
                    console.log('Grid now has', grid.children.length, 'children (should be', (8 + totalRows * 8), 'with headers)');

                    document.getElementById('monthly-total').textContent = monthlyTotal;
                }

                function showInteractionsForDate(dateStr, dateObj, interactions) {
                    const modal = document.getElementById('interactions-modal');
                    const title = document.getElementById('modal-date-title');
                    const list = document.getElementById('interactions-list');
                    
                    if (!modal || !title || !list) return;
                    
                    modal.classList.add('open');
                    const dateFormatted = dateObj.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    const interactionText = interactions.length === 1 ? 'interaction' : 'interactions';
                    title.textContent = 'Interactions for ' + dateFormatted + ' (' + interactions.length + ' ' + interactionText + ')';

                    if (interactions.length === 0) {
                        list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No interactions tracked for this date.</p>';
                        return;
                    }

                    const sortedInteractions = [...interactions].sort(function(a, b) {
                        const timeA = new Date(a.lastAccessed || a.timestamp).getTime();
                        const timeB = new Date(b.lastAccessed || b.timestamp).getTime();
                        return timeB - timeA;
                    });

                    let html = '';
                    sortedInteractions.forEach(function(interaction) {
                        const time = new Date(interaction.lastAccessed || interaction.timestamp);
                        const timeStr = time.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            timeZone: timezone
                        });
                        
                        const subjectHtml = interaction.subject ? '<div style="font-size: 13px; margin-bottom: 8px; color: #333; font-weight: 500;">' + escapeHtml(interaction.subject) + '</div>' : '';
                        const typeColorMap = {'Mobile':'#6366f1','MailPoet':'#ec4899','WooCommerce':'#8b5cf6','Jetpack':'#06b6d4','WordPress.com':'#3b82f6','Akismet':'#f59e0b','Pressable':'#10b981','Plugin':'#64748b'};
                        const typeColor = typeColorMap[interaction.ticketType] || '#94a3b8';
                        const badgeLabel = interaction.product || interaction.ticketType || '';
                        const typeBadgeHtml = badgeLabel ? '<span style="background:' + typeColor + ';color:#fff;border-radius:4px;padding:2px 7px;font-size:11px;font-weight:600;letter-spacing:0.03em;">' + escapeHtml(badgeLabel) + '</span>' : '';
                        const statusHtml = interaction.status ? '<span>📋 ' + escapeHtml(interaction.status) + '</span>' : '';
                        const priorityHtml = interaction.priority ? '<span>⚡ ' + escapeHtml(interaction.priority) + '</span>' : '';
                        
                        html += '<div class="interaction-item" data-url="' + escapeHtml(interaction.url) + '">' +
                            '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">' +
                            '<strong style="font-size: 14px;">Ticket #' + interaction.ticketId + '</strong>' +
                            '<span style="font-size: 12px; color: #666;">' + timeStr + '</span>' +
                            '</div>' +
                            subjectHtml +
                            '<div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #666; align-items: center;">' +
                            typeBadgeHtml +
                            statusHtml +
                            priorityHtml +
                            '</div>' +
                            '</div>';
                    });
                    
                    list.innerHTML = html;

                    list.querySelectorAll('.interaction-item').forEach(function(item) {
                        item.onclick = function() {
                            const url = item.dataset.url;
                            if (url) {
                                window.open(url, '_blank');
                            }
                        };
                    });
                }

                function escapeHtml(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }

                document.getElementById('close-modal').onclick = function() {
                    document.getElementById('interactions-modal').classList.remove('open');
                };

                document.getElementById('interactions-modal').onclick = function(e) {
                    if (e.target.id === 'interactions-modal') {
                        document.getElementById('interactions-modal').classList.remove('open');
                    }
                };

                document.getElementById('prev-month').onclick = function() {
                    currentDate.setMonth(currentDate.getMonth() - 1);
                    renderCalendar(currentDate);
                };

                document.getElementById('next-month').onclick = function() {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    renderCalendar(currentDate);
                };

                // Initialize calendar when DOM is ready
                function initCalendar() {
                    const grid = document.getElementById('calendar-grid');
                    if (!grid) {
                        setTimeout(initCalendar, 50);
                        return;
                    }
                    renderCalendar(currentDate);
                }
                
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initCalendar);
                } else {
                    setTimeout(initCalendar, 100);
                }
            })();`;
        },

        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        initializeToday: function() {
            const today = timezoneManager.formatDateForTimezone();
            this.trackedToday.clear();
            if (this.data[today]) {
                this.data[today].forEach(interaction => {
                    this.trackedToday.add(`${today}_${interaction.ticketId}`);
                });
            }
        }
    };

    // Daily Stats Tracking System
    const dailyStats = {
        data: JSON.parse(localStorage.getItem('zendeskDailyStats') || '{}'),

        addEntry: function(count, hours) {
            const today = timezoneManager.formatDateForTimezone();
            if (!this.data[today]) {
                this.data[today] = {
                    count: count,
                    hours: hours,
                    targetMet: count >= Math.ceil(hours * interactionsPerHour)
                };
            } else {
                this.data[today].count = count;
                this.data[today].hours = hours;
                this.data[today].targetMet = count >= Math.ceil(hours * interactionsPerHour);
            }
            this.save();
        },

        save: function() {
            localStorage.setItem('zendeskDailyStats', JSON.stringify(this.data));
        }
    };

    function createOrUpdateSubmissionCountElement() {
        let countDisplay = document.getElementById('submission-count-display');
        if (!countDisplay) {
            countDisplay = document.createElement('div');
            countDisplay.id = 'submission-count-display';

            // Create left section for stats
            const statsSection = document.createElement('div');
            statsSection.className = 'stats-section';
            statsSection.style.cssText = `
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex: 1;
                min-width: 0;
                white-space: nowrap;
            `;

            // Create right section for the single settings button
            const controlsSection = document.createElement('div');
            controlsSection.style.cssText = `
                display: flex;
                align-items: center;
                position: relative;
            `;

            // Create progress bar container
            const progressContainer = document.createElement('div');
            progressContainer.style.cssText = `
                width: 100%;
                height: 4px;
                background-color: #ddd;
                border-radius: 2px;
                margin: 2px 0;
            `;

            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.id = 'submission-progress-bar';

            // ── Single settings gear button with dropdown ─────────────────────
            const gearButton = document.createElement('button');
            gearButton.textContent = '⚙️';
            gearButton.title = 'Settings & Actions';
            gearButton.style.cssText = `
                padding: 2px 5px;
                font-size: 11px;
                cursor: pointer;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #fff;
                line-height: 1;
                height: 22px;
            `;

            // Dropdown menu — appended to body to escape header overflow clipping
            const dropdown = document.createElement('div');
            dropdown.id = 'rocket-settings-dropdown';
            dropdown.style.cssText = `
                display: none;
                position: fixed;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 6px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                z-index: 999999;
                min-width: 200px;
                overflow: hidden;
            `;

            const menuItems = [
                { icon: '⏰', label: 'Adjust Hours', action: () => {
                    const hours = prompt('🚀 How many support hours are you fueling up for today?', workingHours);
                    if (hours !== null && !isNaN(hours)) {
                        workingHours = parseInt(hours);
                        dailyTarget = Math.ceil(workingHours * interactionsPerHour);
                        localStorage.setItem('zendeskWorkingHours', workingHours.toString());
                        localStorage.setItem('zendeskDailyTarget', dailyTarget.toString());
                        updateCountDisplay();
                    }
                }},
                { icon: '🎯', label: 'Adjust Target Rate', action: () => {
                    const newRate = prompt(`🚀 What's your target interactions per hour?\n(Current: ${interactionsPerHour}/h)`, interactionsPerHour);
                    if (newRate !== null && !isNaN(newRate) && parseFloat(newRate) > 0) {
                        interactionsPerHour = parseFloat(newRate);
                        dailyTarget = Math.ceil(workingHours * interactionsPerHour);
                        localStorage.setItem('zendeskInteractionsPerHour', interactionsPerHour.toString());
                        localStorage.setItem('zendeskDailyTarget', dailyTarget.toString());
                        updateCountDisplay();
                    }
                }},
                { icon: '🔄', label: 'Adjust Count', action: () => {
                    const newValue = prompt('🚀 Adjust your rocket\'s current altitude (interactions count):', submissionCounter);
                    if (newValue !== null && !isNaN(newValue)) {
                        submissionCounter = parseInt(newValue);
                        localStorage.setItem('zendeskSubmissionCounter', submissionCounter.toString());
                        updateCountDisplay();
                    }
                }},
                { icon: '➕', label: 'Add Ticket Manually', action: () => {
                    const input = prompt('🚀 Enter ticket number or URL to add to the calendar:');
                    if (!input) return;
                    const match = input.trim().match(/(\d{6,})/);
                    if (!match) { alert('⚠️ Could not find a valid ticket number in your input.'); return; }
                    const ticketId = match[1];
                    const ticketData = {
                        ticketId, url: `https://a8c.zendesk.com/agent/tickets/${ticketId}`,
                        subject: '', product: '', ticketType: '', status: '', priority: '', requester: ''
                    };
                    const openPane = document.querySelector(
                        `[data-support-suite-trial-onboarding-id="conversationPane"][data-ticket-id="${ticketId}"]`
                    );
                    if (openPane) {
                        ticketData.product = detectProductFromPage();
                        ticketData.ticketType = normalizeTicketType(ticketData.product);
                        const subjectEl = openPane.querySelector('[data-test-id="omni-header-subject"]');
                        if (subjectEl) ticketData.subject = subjectEl.textContent.trim();
                    }
                    interactionTracker.trackInteraction(ticketId, ticketData);
                    submissionCounter++;
                    localStorage.setItem('zendeskSubmissionCounter', submissionCounter.toString());
                    updateCountDisplay();
                    showRocketNotification(`➕ Ticket #${ticketId} added to today's calendar!`);
                }},
            ];

            menuItems.forEach((item, i) => {
                const row = document.createElement('button');
                row.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 12px;
                    text-align: left;
                    color: #333;
                    border-bottom: ${i < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none'};
                `;
                row.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
                row.onmouseenter = () => row.style.background = '#f5f5f5';
                row.onmouseleave = () => row.style.background = 'transparent';
                row.onclick = (e) => { e.stopPropagation(); dropdown.style.display = 'none'; item.action(); };
                dropdown.appendChild(row);
            });

            // Toggle dropdown — position it below the gear button using fixed coords
            gearButton.onclick = function(e) {
                e.stopPropagation();
                if (dropdown.style.display !== 'none') {
                    dropdown.style.display = 'none';
                    return;
                }
                const rect = gearButton.getBoundingClientRect();
                dropdown.style.top = (rect.bottom + 6) + 'px';
                dropdown.style.right = (window.innerWidth - rect.right) + 'px';
                dropdown.style.left = 'auto';
                dropdown.style.display = 'block';
            };
            document.addEventListener('click', () => { dropdown.style.display = 'none'; });
            document.body.appendChild(dropdown);

            // Assemble the components
            progressContainer.appendChild(progressBar);
            statsSection.appendChild(progressContainer);
            controlsSection.appendChild(gearButton);

            countDisplay.appendChild(statsSection);
            countDisplay.appendChild(controlsSection);

            const targetContainer = document.querySelector('[data-test-id="header-tablist"]');
            if (targetContainer) {
                targetContainer.appendChild(countDisplay);
            }
        }
        updateCountDisplay();
    }

    function checkMilestones(previousCount, currentCount) {
        const milestones = [
            { threshold: 0.25, message: "🚀 Rocket Launching!", icon: "🔧" },
            { threshold: 0.5, message: "🚀 Breaking the Atmosphere!", icon: "🛸" },
            { threshold: 0.75, message: "🚀 Reaching Orbit!", icon: "🌠" },
            { threshold: 0.85, message: "🚀 Entering Deep Space!", icon: "🌌" },
            { threshold: 1, message: "🚀 Mission Accomplished!", icon: "✨" },
            { threshold: 1.25, message: "🚀 Beyond the Stars!", icon: "🌟" }
        ];

        const countDisplay = document.getElementById('submission-count-display');
        const previousProgress = (previousCount / dailyTarget);
        const currentProgress = (currentCount / dailyTarget);

        milestones.forEach(milestone => {
            if (previousProgress < milestone.threshold &&
                currentProgress >= milestone.threshold) {

                countDisplay.classList.add('milestone-reached');
                setTimeout(() => countDisplay.classList.remove('milestone-reached'), 3000);
                showRocketNotification(milestone.message);
            }
        });
    }

    function showProductWarning() {
        const existing = document.getElementById('rocket-product-warning');
        if (existing) return;
        const el = document.createElement('div');
        el.id = 'rocket-product-warning';
        el.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #b45309;
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 1px solid #fbbf24;
            cursor: pointer;
        `;
        el.textContent = '⚠️ Product field is empty — fill it in before adding your private note!';
        el.title = 'Click to dismiss';
        el.addEventListener('click', () => el.remove());
        document.body.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) {
                el.style.transition = 'opacity 0.5s';
                el.style.opacity = '0';
                setTimeout(() => el.remove(), 500);
            }
        }, 8000);
    }

    function showRocketNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            animation: rocketLaunch 0.5s ease-in-out;
            box-shadow: 0 4px 15px rgba(255,100,0,0.3);
            border: 1px solid var(--progress-color);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease-in-out forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    function getProgressIcon(progress) {
        if (progress < 33) {
            return "🔧"; // Preparation phase
        } else if (progress < 55) {
            return "🚀"; // Launch phase
        } else if (progress < 85) {
            return "🛸"; // In flight
        } else {
            return "✨"; // Mission success
        }
    }

    function updateCountDisplay() {
        const countDisplay = document.getElementById('submission-count-display');
        const progressBar = document.getElementById('submission-progress-bar');

        if (countDisplay && progressBar) {
            const progress = (submissionCounter / dailyTarget) * 100;
            const progressWidth = Math.min(progress, 100);
            const progressIcon = getProgressIcon(progress);

            let progressColor, borderGradient;
            if (progress < 33) {
                progressColor = '#ff0000';
                borderGradient = `linear-gradient(45deg, #ff0000, #ff4444, #ff0000)`;
            } else if (progress < 55) {
                progressColor = '#ffd700';
                borderGradient = `linear-gradient(45deg, #ffd700, #ffa502, #ffd700)`;
            } else if (progress < 85) {
                progressColor = '#ff8c00';
                borderGradient = `linear-gradient(45deg, #ff8c00, #ff7000, #ff8c00)`;
            } else {
                progressColor = '#2ecc71';
                borderGradient = `linear-gradient(45deg, #2ecc71, #27ae60, #2ecc71)`;
            }

            countDisplay.style.setProperty('--progress-color', progressColor);

            progressBar.style.width = `${progressWidth}%`;
            progressBar.style.backgroundColor = progressColor;

            countDisplay.style.cssText += `
                border: 2px solid transparent;
                background:
                    linear-gradient(var(--bg-color, #f0f0f0), var(--bg-color, #f0f0f0)) padding-box,
                    ${borderGradient} border-box;
                box-shadow: 0 0 5px ${progressColor};
                transition: all 0.3s ease;
            `;

            // Update the stats display with rocket theme
            const statsSection = countDisplay.querySelector('.stats-section');
            if (statsSection) {
                statsSection.innerHTML = `
                    <div style="font-size: 12px; line-height: 1.2;">
                        <span class="progress-icon">${progressIcon}</span>
                        ${submissionCounter}/${dailyTarget} (${Math.round(progress)}%)
                    </div>
                    <div style="font-size: 10px; color: var(--text-secondary-color, #666); line-height: 1.2;">
                        🚀 Team Rocket: ${workingHours}h @ ${interactionsPerHour}/h
                    </div>
                    ${progressBar.outerHTML}
                `;
            }

            // Update daily stats
            dailyStats.addEntry(submissionCounter, workingHours);
        }
    }
    function incrementSubmissionCounter(ticketId) {
        const previousCount = submissionCounter;
        submissionCounter++;
        localStorage.setItem('zendeskSubmissionCounter', submissionCounter.toString());

        const countDisplay = document.getElementById('submission-count-display');
        countDisplay.classList.add('count-increment');
        setTimeout(() => countDisplay.classList.remove('count-increment'), 300);

        checkMilestones(previousCount, submissionCounter);
        updateCountDisplay();

        // Track interaction when submission counter increments (private note added)
        interactionTracker.getTicketData(ticketId).then(ticketData => {
            interactionTracker.trackInteraction(ticketId, ticketData);
        });
    }

    function checkDateAndResetCounter() {
        const lastResetDate = localStorage.getItem('zendeskLastResetDate');
        const currentDate = timezoneManager.formatDateForTimezone();

        if (lastResetDate !== currentDate) {
            submissionCounter = 0;
            localStorage.setItem('zendeskSubmissionCounter', '0');
            localStorage.setItem('zendeskLastResetDate', currentDate);
            
            // Reinitialize interaction tracker for new day
            interactionTracker.initializeToday();
        }

        // Initialize working hours if not set
        if (!workingHours) {
            workingHours = 8; // Default to 8 hours
            localStorage.setItem('zendeskWorkingHours', workingHours.toString());
        }

        // Initialize interactions per hour if not set
        if (!interactionsPerHour || interactionsPerHour <= 0) {
            interactionsPerHour = 3.5;
            localStorage.setItem('zendeskInteractionsPerHour', interactionsPerHour.toString());
        }

        // Calculate daily target based on working hours and interactions per hour
        dailyTarget = Math.ceil(workingHours * interactionsPerHour);
        localStorage.setItem('zendeskDailyTarget', dailyTarget.toString());
    }

    // ─── DEBUG LOGGER ──────────────────────────────────────────────────────────
    // Set to false to silence debug output once the issue is identified.
    const DEBUG = true;
    const LOG_PREFIX = '🚀 [RocketTracker DEBUG]';
    function dbg(...args) {
        if (DEBUG) console.log(LOG_PREFIX, ...args);
    }
    function dbgWarn(...args) {
        if (DEBUG) console.warn(LOG_PREFIX, ...args);
    }
    function dbgGroup(label, fn) {
        if (!DEBUG) { fn(); return; }
        console.group(LOG_PREFIX + ' ' + label);
        try { fn(); } finally { console.groupEnd(); }
    }
    // ───────────────────────────────────────────────────────────────────────────

    // Tab monitoring and initialization
    let tabContainer = null;
    let knownTabs = new Set();
    let commentCounts = new Map();
    let omniLogObservers = new Map(); // ticketId → MutationObserver on its omni-log-container
    let lastUrl = window.location.href;

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    function checkConversationPane(tabEntityId, _retryCount, _step2RetryCount) {
        const retryCount = _retryCount || 0;
        const step2RetryCount = _step2RetryCount || 0;
        dbg(`checkConversationPane — ticketId: ${tabEntityId}${retryCount ? ` (retry ${retryCount})` : ''}${step2RetryCount ? ` (s2-retry ${step2RetryCount})` : ''}`);

        // ── Step 1: locate the conversation pane ──────────────────────────────
        const conversationPane = document.querySelector(
            `[data-support-suite-trial-onboarding-id="conversationPane"][data-ticket-id="${tabEntityId}"]`
        );

        if (!conversationPane) {
            // Retry up to 6 times with increasing delays (500ms, 1s, 1.5s, 2s, 2.5s, 3s) = up to ~10.5s total
            const maxRetries = 6;
            if (retryCount < maxRetries) {
                const delay = (retryCount + 1) * 500;
                dbg(`[Step 1] conversationPane not yet in DOM for ticket ${tabEntityId} — retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
                setTimeout(() => checkConversationPane(tabEntityId, retryCount + 1), delay);
                return;
            }

            dbgWarn(`[Step 1 FAIL] conversationPane not found for ticket ${tabEntityId} after ${maxRetries} retries.`);
            // Dump any elements that have data-support-suite-trial-onboarding-id to help identify the new selector
            const anyPane = document.querySelectorAll('[data-support-suite-trial-onboarding-id]');
            if (anyPane.length) {
                dbgWarn(`  Found ${anyPane.length} element(s) with data-support-suite-trial-onboarding-id:`);
                anyPane.forEach((el, i) => {
                    dbgWarn(`  [${i}] tag=${el.tagName} id="${el.getAttribute('data-support-suite-trial-onboarding-id')}" ticket="${el.getAttribute('data-ticket-id')}"`);
                });
            } else {
                dbgWarn('  No elements with data-support-suite-trial-onboarding-id found in DOM. Selector may have changed entirely.');
                // Look for any element that has a data-ticket-id attribute
                const ticketIdEls = document.querySelectorAll(`[data-ticket-id="${tabEntityId}"]`);
                if (ticketIdEls.length) {
                    dbgWarn(`  BUT found ${ticketIdEls.length} element(s) with data-ticket-id="${tabEntityId}":`);
                    ticketIdEls.forEach((el, i) => {
                        dbgWarn(`  [${i}] tag=${el.tagName} classes="${el.className}" attrs:`, el.getAttributeNames().map(a => `${a}="${el.getAttribute(a)}"`).join(', '));
                    });
                } else {
                    dbgWarn(`  No elements with data-ticket-id="${tabEntityId}" found either.`);
                }
            }
            return;
        }
        dbg(`[Step 1 OK] conversationPane found for ticket ${tabEntityId}`);

        // ── Step 2: locate the omni-log container ─────────────────────────────
        const omniLogContainer = conversationPane.querySelector('[data-test-id="omni-log-container"]');
        if (!omniLogContainer) {
            const maxStep2Retries = 8;
            if (step2RetryCount < maxStep2Retries) {
                const delay = (step2RetryCount + 1) * 500;
                dbg(`[Step 2] omni-log-container not yet in DOM for ticket ${tabEntityId} — retrying in ${delay}ms (attempt ${step2RetryCount + 1}/${maxStep2Retries})`);
                setTimeout(() => checkConversationPane(tabEntityId, 0, step2RetryCount + 1), delay);
                return;
            }
            dbgWarn(`[Step 2 FAIL] omni-log-container not found inside conversationPane for ticket ${tabEntityId} after ${maxStep2Retries} retries.`);
            // Dump data-test-id values present inside the pane to identify the new structure
            const dataTestIds = conversationPane.querySelectorAll('[data-test-id]');
            if (dataTestIds.length) {
                const ids = [...new Set([...dataTestIds].map(el => el.getAttribute('data-test-id')))];
                dbgWarn(`  data-test-id values found in conversationPane: ${ids.join(', ')}`);
            } else {
                dbgWarn('  No elements with data-test-id found inside conversationPane.');
            }
            return;
        }
        dbg(`[Step 2 OK] omni-log-container found`);

        // ── Step 3: count comment items ───────────────────────────────────────
        const currentComments = omniLogContainer.querySelectorAll('[data-test-id="omni-log-comment-item"]');
        const currentCommentCount = currentComments.length;
        const previousCommentCount = commentCounts.get(tabEntityId);
        dbg(`[Step 3] ticket ${tabEntityId} — previous comments: ${previousCommentCount ?? 'unset'}, current: ${currentCommentCount}`);

        if (currentCommentCount === 0) {
            dbgWarn(`[Step 3 WARN] 0 omni-log-comment-item elements found. Checking what items ARE in the log container...`);
            const logChildren = omniLogContainer.querySelectorAll('[data-test-id]');
            if (logChildren.length) {
                const ids = [...new Set([...logChildren].map(el => el.getAttribute('data-test-id')))];
                dbgWarn(`  data-test-id values inside omni-log-container: ${ids.join(', ')}`);
            } else {
                dbgWarn('  omni-log-container has no children with data-test-id.');
            }
        }

        if (previousCommentCount !== undefined && currentCommentCount > previousCommentCount) {
            const newComment = currentComments[currentCommentCount - 1];

            // ── Step 4: detect private/internal note ─────────────────────────
            // Zendesk doesn't always write data-zes-comment-is-note to the DOM in time,
            // so we fall back to the aria-label which reliably says "Internal note from..."
            const isNoteAttr = newComment.getAttribute('data-zes-comment-is-note');
            const ariaLabel = newComment.getAttribute('aria-label') || '';
            const isNoteByAttr = isNoteAttr === 'true';
            const isNoteByAria = /internal note/i.test(ariaLabel);
            const isNewCommentNote = isNoteByAttr || isNoteByAria;
            dbg(`[Step 4] New comment — data-zes-comment-is-note="${isNoteAttr}", aria-label="${ariaLabel}" → isNote=${isNewCommentNote}`);
            if (!isNewCommentNote && isNoteAttr === null) {
                dbgWarn(`[Step 4 WARN] Could not confirm note type. Dumping new comment attributes:`,
                    newComment.getAttributeNames().map(a => `${a}="${newComment.getAttribute(a)}"`).join(', '));
            }

            if (currentCommentCount >= 2) {
                const secondLastComment = currentComments[currentCommentCount - 2];
                const secondLastNoteAttr = secondLastComment.getAttribute('data-zes-comment-is-note');
                const secondLastAriaLabel = secondLastComment.getAttribute('aria-label') || '';
                const isSecondLastCommentNote = secondLastNoteAttr === 'true' || /internal note/i.test(secondLastAriaLabel);

                // ── Step 5: locate user links ─────────────────────────────────
                const newCommentUserLink = newComment.querySelector('a[data-test-id="omni-log-comment-user-link"]');
                const secondLastCommentUserLink = secondLastComment.querySelector('a[data-test-id="omni-log-comment-user-link"]');

                if (!newCommentUserLink || !secondLastCommentUserLink) {
                    dbgWarn(`[Step 5 FAIL] User link(s) not found. newCommentUserLink=${!!newCommentUserLink}, secondLastCommentUserLink=${!!secondLastCommentUserLink}`);
                    // Try to find whatever links are inside the comment
                    const linksInNew = newComment.querySelectorAll('a[data-test-id]');
                    if (linksInNew.length) {
                        dbgWarn(`  Anchor data-test-ids in new comment: ${[...linksInNew].map(a => a.getAttribute('data-test-id')).join(', ')}`);
                    } else {
                        dbgWarn('  No anchors with data-test-id found in new comment.');
                    }
                } else {
                    const newCommentUser = newCommentUserLink.textContent;
                    const secondLastCommentUser = secondLastCommentUserLink.textContent;
                    dbg(`[Step 5 OK] new comment user="${newCommentUser}", previous user="${secondLastCommentUser}", isSecondLastNote=${isSecondLastCommentNote}`);

                    if (isNewCommentNote) {
                        dbg(`[Step 6 OK] New private note detected — incrementing counter for ticket ${tabEntityId}`);
                        if (!detectProductFromPage()) showProductWarning();
                        incrementSubmissionCounter(tabEntityId);
                    } else {
                        dbg(`[Step 6 SKIP] New comment is not a private note (isNote=${isNewCommentNote}) — skipping.`);
                    }
                }
            } else {
                dbg(`[Step 5 alt] Only 1 comment total. isNote=${isNewCommentNote}`);
                if (isNewCommentNote) {
                    dbg(`[Step 6 OK] Single comment is a private note — incrementing counter for ticket ${tabEntityId}`);
                    if (!detectProductFromPage()) showProductWarning();
                    incrementSubmissionCounter(tabEntityId);
                } else {
                    dbg(`[Step 6 SKIP] Single comment is not a private note — not counting.`);
                }
            }
        } else if (previousCommentCount === undefined) {
            dbg(`[Step 3 INFO] First time seeing ticket ${tabEntityId} — storing initial comment count: ${currentCommentCount}`);
            // ── Attach a dedicated observer to detect new comments immediately ──
            // The tab-list MutationObserver only fires on tab open/close, which can
            // be too late (the ticket pane may already be unmounted when navigating
            // away via the play queue).  Watching the omni-log-container directly
            // fires as soon as Zendesk appends the new comment to the DOM.
            if (!omniLogObservers.has(tabEntityId)) {
                const omniObserver = new MutationObserver(debounce(() => {
                    dbg(`[omniObserver] DOM change in omni-log-container for ticket ${tabEntityId} — checking`);
                    checkConversationPane(tabEntityId);
                }, 300));
                omniObserver.observe(omniLogContainer, { childList: true, subtree: true });
                omniLogObservers.set(tabEntityId, omniObserver);
                dbg(`[Step 3 INFO] omni-log observer attached for ticket ${tabEntityId}`);
            }
        } else {
            dbg(`[Step 3 INFO] No new comments for ticket ${tabEntityId} (prev=${previousCommentCount}, curr=${currentCommentCount})`);
        }

        commentCounts.set(tabEntityId, currentCommentCount);
    }

    function checkForTabChanges() {
        if (!tabContainer) return;

        const rawTabs = tabContainer.querySelectorAll('[data-test-id="header-tab"]');
        dbg(`checkForTabChanges — found ${rawTabs.length} [data-test-id="header-tab"] element(s)`);

        if (rawTabs.length === 0) {
            dbgWarn('[Tab detection FAIL] No elements with data-test-id="header-tab" in tabContainer. Checking what IS inside...');
            const innerTestIds = tabContainer.querySelectorAll('[data-test-id]');
            if (innerTestIds.length) {
                const ids = [...new Set([...innerTestIds].map(el => el.getAttribute('data-test-id')))];
                dbgWarn('  data-test-id values inside tabContainer:', ids.join(', '));
            } else {
                dbgWarn('  No elements with data-test-id inside tabContainer.');
            }
        }

        const currentTabs = new Set(
            Array.from(rawTabs).map(tab => {
                const id = tab.getAttribute('data-entity-id');
                if (!id) {
                    dbgWarn('[Tab detection WARN] header-tab found but data-entity-id is missing. Attrs:', tab.getAttributeNames().map(a => `${a}="${tab.getAttribute(a)}"`).join(', '));
                }
                return id;
            }).filter(Boolean)
        );

        dbg(`Tab IDs found: [${[...currentTabs].join(', ')}]`);

        currentTabs.forEach(tabId => {
            if (!knownTabs.has(tabId)) {
                dbg(`New tab detected: ${tabId}`);
                knownTabs.add(tabId);
                checkConversationPane(tabId);
            }
        });

        knownTabs.forEach(tabId => {
            if (!currentTabs.has(tabId)) {
                dbg(`Tab closed: ${tabId}`);
                knownTabs.delete(tabId);
                commentCounts.delete(tabId);
                const obs = omniLogObservers.get(tabId);
                if (obs) {
                    obs.disconnect();
                    omniLogObservers.delete(tabId);
                    dbg(`[omniObserver] disconnected for closed tab ${tabId}`);
                }
            }
        });

        // Detect the active tab from the current URL (most reliable for Zendesk SPA)
        const urlMatch = window.location.pathname.match(/\/tickets\/(\d+)/);
        const activeTabId = urlMatch ? urlMatch[1] : null;
        if (activeTabId) {
            dbg(`Active/selected tab (from URL): ${activeTabId}`);
            checkConversationPane(activeTabId);
        } else {
            dbgWarn('[Tab detection WARN] Could not determine active tab from URL:', window.location.pathname);
        }
    }

    function observeContainer() {
        const observer = new MutationObserver(debounce(() => {
            checkForTabChanges();
        }, 3000));

        // Watch only direct children of the tab list (not the full subtree) to avoid
        // firing on every keystroke/render inside the conversation pane.
        observer.observe(tabContainer, {
            childList: true,
            subtree: false,
        });

        // Catch SPA navigations (tab switches update the URL via pushState)
        const debouncedTabCheck = debounce(checkForTabChanges, 500);
        window.addEventListener('popstate', debouncedTabCheck);
        const _pushState = history.pushState.bind(history);
        history.pushState = function (...args) {
            _pushState(...args);
            debouncedTabCheck();
        };
        const _replaceState = history.replaceState.bind(history);
        history.replaceState = function (...args) {
            _replaceState(...args);
            debouncedTabCheck();
        };

        checkForTabChanges();
    }

    const findTabContainer = debounce(() => {
        tabContainer = document.querySelector('[data-test-id="header-tablist"]');
        if (!tabContainer) {
            dbgWarn('[findTabContainer] [data-test-id="header-tablist"] not found yet — retrying in 5s...');
            // On first miss, log what header-level data-test-ids exist to help diagnose a selector change
            const headerTestIds = document.querySelectorAll('[data-test-id*="header"]');
            if (headerTestIds.length) {
                const ids = [...new Set([...headerTestIds].map(el => el.getAttribute('data-test-id')))];
                dbgWarn('  data-test-id values containing "header":', ids.join(', '));
            }
            findTabContainer();
        } else {
            dbg('[findTabContainer] tabContainer found:', tabContainer.tagName, tabContainer.className);
            observeContainer();
            createOrUpdateSubmissionCountElement();
            // Container found — stop polling. The MutationObserver handles changes from here.
        }
    }, 5000);

    // Initialize theme based on system preference or stored value
    function initializeTheme() {
        const storedTheme = localStorage.getItem('zendeskTheme');
        if (storedTheme) {
            document.body.setAttribute('data-theme', storedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    // Initialize everything
    function initialize() {
        console.log('🚀 [RocketCounter v1.3.9] Initializing...');

        // Initialize theme
        initializeTheme();

        // Initialize interaction tracker for today first
        interactionTracker.initializeToday();

        // Create interactions panel after a short delay to ensure DOM is ready
        setTimeout(() => {
            interactionTracker.createInteractionsPanel();
        }, 100);

        // Check and reset counter if needed
        checkDateAndResetCounter();

        // Start tab monitoring
        findTabContainer();

        // Add version info to console
        console.log('🚀 [RocketCounter v1.3.0] Features:');
        console.log('- Daily statistics tracking');
        console.log('- Dark mode support');
        console.log('- Enhanced progress visualization');
        console.log('- Performance improvements');
        console.log('- Timezone support');
        console.log('- Calendar-based interaction tracking (tracks only when private note added)');
    }

    // Initialize based on document ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
