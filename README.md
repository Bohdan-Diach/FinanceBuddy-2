# PayTrack
Markdown
# Project Summary

**PayTrack** is a modern, responsive web application designed for personal finance management. Built with pure HTML5, Vanilla JavaScript, and Tailwind CSS, the application provides an intuitive interface for tracking daily expenses, logging incomes, and managing monthly budgets. 

Key features include a comprehensive dashboard with real-time balance visualization, a savings goal tracker ("На мрію"), categorized transaction history with search and filtering, and strict monthly limits for spending categories. The app features a dark-themed UI mode and a unique gamified **"Critic Mode"** that provides sarcastic, humorous feedback on the user's spending habits. All data is managed locally using the browser's `localStorage`, ensuring complete privacy and offline persistence without the need for a backend server.

# Project Module Description

The application architecture is divided into several key modules across distinct HTML pages:

1. **Dashboard (`index.html`)**: The main hub displaying the available balance, a visual savings goal progress ring, recent transactions, and a quick-entry form for adding new expenses or incomes.
2. **Statistics (`statistics.html`)**: Provides a visual breakdown of financial data, helping users analyze their spending habits across different categories over time.
3. **History (`history.html`)**: A detailed chronological ledger of all financial operations. Features an integrated search bar and quick filters (All / Incomes / Expenses) for easy data retrieval.
4. **Limits (`limits.html`)**: A budgeting interface where users can assign maximum monthly spending caps to specific categories (e.g., Groceries, Transport) and visually track their current usage against those caps.
5. **Settings (`settings.html`)**: The personal cabinet where users can configure app preferences. Includes profile details, default currency selection, Dark Mode toggle, the gamified "Critic Mode" toggle, and a "Danger Zone" for a complete data reset.

# Directory Tree

```text
/
├── index.html          # Main dashboard and entry point
├── history.html        # Transaction ledger and filtering interface
├── limits.html         # Budgeting and limits management
├── settings.html       # Application settings and data reset
├── statistics.html     # Data visualization and charts
└── app.js              # Core business logic, DOM manipulation, and state management
File Description Inventory
HTML Files (*.html): Each file represents a specific screen in the application. They are styled via Tailwind CSS (via CDN) and feature a responsive layout with a desktop sidebar and a mobile bottom navigation bar. They include dark mode specific utility classes.

app.js: The central engine of the application. It handles:

Abstraction of the browser's localStorage API for data persistence.

DOM manipulation and event listening for forms, buttons, and dynamic content rendering.

State management for transactions, savings goals, and budget limits.

Triggering the Toast notification system for limit warnings and "Critic Mode" comments.

Application of theme settings (Dark/Light mode) and currency formatting.

Technology Stack
Frontend: HTML5, Vanilla JavaScript (ES6+), CSS3

Styling: Tailwind CSS (via CDN)

Icons: FontAwesome 6

Data Storage: Browser LocalStorage API

Fonts: Google Fonts (Inter)

Usage
Because PayTrack is a purely frontend-driven application, there is no need for npm or complex build tools. To set up and run the application locally:

Clone the repository to your local machine:

Bash
   git clone <repository-url>
Open the project folder.

Launch the application:

Option A: Simply double-click on index.html to open it in your default web browser.

Option B: For a better development experience, use a local server extension like Live Server in VS Code. Right-click index.html and select "Open with Live Server".
