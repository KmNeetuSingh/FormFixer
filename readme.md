# FormFixer

FormFixer is a full-stack web application that automates HTML form analysis, JSON schema generation, and accessibility checks to help developers build better, more accessible forms quickly.

## Features

- **HTML Form Analysis:** Parses and validates form elements using efficient custom algorithms.
- **JSON Schema Generation:** Automatically creates JSON schemas based on form structure.
- **Accessibility Checks:** Detects common accessibility violations to ensure inclusive design.
- **RESTful API:** Built with Express.js for scalable backend services.
- **React Frontend:** Responsive UI with real-time feedback, toast notifications, and clipboard copy functionality.

## Tech Stack

- Backend: Node.js, Express.js
- Frontend: React.js, Axios, React-Toastify
- Others: CORS, Clipboard API

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/formfixer.git
   cd formfixer
````

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

* Start backend server:

  ```bash
  cd backend
  npm start
  ```

* Start frontend app:

  ```bash
  cd frontend
  npm start
  ```

* Open `http://localhost:3000` in your browser.

## Usage

* Paste your HTML form code into the textarea.
* Click **Analyze** to validate the form and find issues.
* Click **Generate Schema** to get a JSON schema of your form.
* Click **Accessibility** to check for accessibility violations.
* Use the copy buttons to copy reports or schema to clipboard.

## Why Use FormFixer?

* Accelerates form validation and debugging.
* Ensures forms meet accessibility standards.
* Simplifies schema creation for backend integration.
* Enhances developer productivity with clear feedback.

