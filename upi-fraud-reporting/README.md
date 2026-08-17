# UPI Fraud Reporting Portal

## Problem Statement

Digital payments have become a major part of everyday transactions in India. Users may encounter suspicious payment requests, fraudulent transactions, phishing attempts, fake customer-care calls, or other forms of digital payment scams.

## Solution

The UPI Fraud Reporting Portal is a simple, functional, clean, and easy-to-use web application that allows users to report and manage digital payment fraud incidents. It provides a simple dashboard to track the status of reported incidents and perform full CRUD (Create, Read, Update, Delete) operations on fraud reports.

## Features

- **Dashboard Statistics**: Automatically updates to show total, pending, under review, and resolved reports.
- **Submit Report**: Form with basic validation for reporting fraud incidents.
- **Report List**: Dynamically rendered list of all submitted reports.
- **View Details**: View the complete details of any report.
- **Edit/Update**: Update report information and modify its status (e.g., from Pending to Resolved).
- **Delete Report**: Remove reports from the system.
- **Search & Filter**: Client-side filtering by name, ID, incident type, and status without page reloads.
- **Responsive UI**: A clean, security-themed interface that works on both desktop and mobile devices.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla + Flexbox), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Storage**: In-memory JavaScript array (No external database required)

## Project Structure

\`\`\`
upi-fraud-reporting/
│
├── frontend/
│   ├── index.html     (Main layout structure)
│   ├── style.css      (Styling using CSS Flexbox)
│   └── script.js      (Frontend logic, fetch APIs, DOM manipulation)
│
├── backend/
│   └── server.js      (Express server and REST API logic)
│
├── package.json       (Project metadata and dependencies)
└── README.md          (Project documentation)
\`\`\`

## How to Install

1. Navigate to the project directory:
   \`\`\`bash
   cd upi-fraud-reporting
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

## How to Run

Start the Express server by running:
\`\`\`bash
node backend/server.js
\`\`\`

## Application URL

Open your web browser and go to:
[http://localhost:3000](http://localhost:3000)

## API Endpoints

The backend provides the following RESTful APIs:

- **Get all reports**
  - \`GET /api/reports\`
  - Returns: HTTP 200 with JSON array of all reports.

- **Get one report**
  - \`GET /api/reports/:id\`
  - Returns: HTTP 200 with report details, or HTTP 404 if not found.

- **Create report**
  - \`POST /api/reports\`
  - Body: JSON object containing report fields.
  - Returns: HTTP 201 on success, HTTP 400 on validation failure.

- **Update report**
  - \`PUT /api/reports/:id\`
  - Body: JSON object with fields to update (including status).
  - Returns: HTTP 200 on success, HTTP 404 if not found, HTTP 400 on invalid data.

- **Delete report**
  - \`DELETE /api/reports/:id\`
  - Returns: HTTP 200 on success, HTTP 404 if not found.

## Validation

### Frontend Validation (JavaScript)
- Name must be at least 2 characters.
- Contact number must be exactly 10 digits.
- Amount must be greater than 0.
- Incident date cannot be in the future.
- Description must be at least 10 characters.
- Required fields cannot be empty.

### Backend Validation (Express.js)
- Validates the presence of required fields before creating a report.
- Validates numeric value for amount and 10-digit format for contact number.
- Returns HTTP 400 Bad Request if validation fails.
- Checks if the requested ID exists for GET/PUT/DELETE, returning HTTP 404 Not Found otherwise.

## Storage

**Important Note:** This application uses an in-memory array (`reports`) to store data. This means that all submitted reports, updates, and deletions will reset to the default sample data whenever the Node.js server is restarted. This is intended for the purpose of the assessment.

## Testing

You can test the APIs using tools like Postman or Thunder Client:
1. Start the server.
2. Send a \`GET\` request to \`http://localhost:3000/api/reports\`.
3. Try sending a \`POST\` request to \`http://localhost:3000/api/reports\` with JSON body data.
4. Try updating an existing ID using \`PUT\` or deleting using \`DELETE\`.
