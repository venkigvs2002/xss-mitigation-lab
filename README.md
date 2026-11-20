#  XSS Vulnerability & Mitigation Lab

A hands-on web security lab demonstrating Stored Cross-Site Scripting (XSS), its exploitation, and different mitigation techniques.

Built using vanilla HTML, CSS, JavaScript, Node.js and SQLite — without any web frameworks.

## Features

- Comment submission and persistent storage using SQLite.
- Intentionally vulnerable Stored XSS implementation.
- Multiple XSS mitigation techniques.
- HTTP security headers and Content Security Policy.
- Practical testing of different HTML injection payloads.

## XSS Mitigation Techniques

This project demonstrates six approaches to mitigating XSS:

### 1. textContent
Uses the DOM `textContent` property to insert untrusted input as plain text rather than interpreting it as HTML.

### 2. innerText
Displays user-controlled content as text instead of parsing it as HTML.

### 3. HTML Entity Encoding
Encodes special HTML characters such as `<`, `>`, `&`, `"`, and `'` to prevent HTML interpretation in the appropriate output context.

### 4. DOMPurify
Uses the DOMPurify library to sanitize user-generated HTML and remove dangerous elements and attributes while preserving permitted formatting.

### 5. Server-Side Output Encoding
Encodes untrusted data on the server before returning it for insertion into an HTML context.

### 6. Content Security Policy (CSP)
Implements CSP through HTTP response headers to restrict script execution and provide an additional layer of browser protection.

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- SQLite
- DOMPurify

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd stored-xss-lab
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

Enable CSP:

```text
http://localhost:3000/?csp=on
```

## Learning Objectives

- Understand how Stored XSS occurs.
- Trace attacker-controlled data from input to browser execution.
- Understand dangerous HTML rendering sinks.
- Compare different XSS mitigation techniques.
- Understand the role of output encoding and HTML sanitization.
- Implement and inspect Content Security Policy.
- Verify security fixes using browser DevTools.

## Disclaimer

This application intentionally contains vulnerable code for educational purposes.

Run it only in a local, controlled testing environment.

**Purpose:** Application Security learning and secure coding practice.