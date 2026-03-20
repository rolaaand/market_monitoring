# Market Monitoring Blueprint

## Overview
A web-based dashboard that monitors specific keywords using Google News RSS feeds. It provides real-time search results for market trends in the Korean music streaming and subscription service industry.

## Current State
- **Technologies:** HTML, CSS, JavaScript (Framework-less).
- **Functionality:** Uses a Google Apps Script (GAS) URL to fetch news data for a predefined list of keywords.
- **UI:** Basic grid layout with minimal styling.

## Target State & Features
- **RSS Integration:** Switch from GAS to direct Google News RSS feed fetching using a CORS proxy (e.g., AllOrigins).
- **XML Parsing:** Implement a client-side XML parser to extract titles, links, and publication dates from the RSS feed.
- **Modern UI/UX:**
    - **Vibrant Design:** Use `oklch` color spaces for rich, energetic colors.
    - **Depth & Texture:** Multi-layered drop shadows and subtle background textures.
    - **Responsiveness:** Use Container Queries and modern Grid/Flexbox for a seamless experience across devices.
    - **Interactive Elements:** Glowing effects on buttons and cards.
- **Keywords:** 멜론, 유튜브뮤직, 유튜브프리미엄, 유튜브프리미엄라이트, 스포티파이, 지니뮤직, 플로, 애플뮤직.
- **Smart Filtering:**
    - Refined search for "멜론" (Melon): Uses a broad search query to maximize result retrieval, then filters out fruit-related titles (e.g., '농민', '출하', '당도') on the client side for higher precision.
    - Time-based filtering: Displays news from the last 3.5 days (84 hours), accounting for UTC/KST timezone offsets.
- **Data Reliability:**
    - Proxy Cache Busting: Appends a unique timestamp to each request to ensure fresh data from the CORS proxy.
    - Result Expansion: Increased display limit to 7 items per keyword to provide a more comprehensive view.

## Plan & Steps
1.  **Refactor `main.js`:**
    - Implement `fetchRSS(keyword)` function using a CORS proxy.
    - Parse XML using `DOMParser`.
    - Update the rendering logic to handle the new data structure.
2.  **Update `index.html`:**
    - Add semantic HTML5 elements.
    - Enhance the header and layout structure.
    - Add a loading state indicator.
3.  **Modernize `style.css`:**
    - Implement a color palette using CSS variables with `oklch`.
    - Add glassmorphism or depth effects to cards.
    - Use modern typography and spacing.
    - Implement container queries for component responsiveness.
4.  **Verification:**
    - Test keyword searches.
    - Check for console errors.
    - Validate responsive behavior.
