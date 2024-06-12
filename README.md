# Satoshi Showdown Server

## Notice

Refer to [[JSDocs API Documentation]](https://sidebetxyz.github.io/satoshi-showdown/) for detailed API documentation.

## Overview

Satoshi Showdown is a sophisticated web-based platform dedicated to organizing and running competitive events, leveraging Bitcoin transactions. It combines efficient event management with secure transaction handling, targeting gaming enthusiasts and event organizers interested in cryptocurrency-based solutions.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
5. [Usage](#usage)
6. [API Documentation](#api-documentation)
7. [Development](#development)
   - [Coding Standards](#coding-standards)
   - [Running Tests](#running-tests)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

## Introduction

Satoshi Showdown is designed to facilitate the organization of gaming events with a unique twist - integration of Bitcoin transactions for entry fees and prizes. This innovative approach not only enhances the gaming experience but also introduces a new dimension to event management and cryptocurrency utilization.

## Features

- **Bitcoin Transactions**: Secure handling of Bitcoin transactions for event entry fees and prize distributions.
- **Event Management**: Comprehensive tools for organizing and managing various types of competitive events.
- **User Interaction**: Engaging user interface for participants to manage their profiles, events, and transactions.

## Project Structure

### Server Application

Located in the `server` directory, this application handles critical functionalities:

- **Controllers**: Manages the application logic, responding to user requests.
- **Models**: Represents data structures for user, event, and transaction information.
- **Services**: Contains business logic and interacts with models.
- **Middlewares**: Provides common functionalities like error handling and logging.
- **Utilities**: Offers reusable code segments for various operations.

### Configuration and Security

- **Configs**: Stores configuration files and environment variables.
- **Certs**: Contains security certificates for HTTPS connections.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB

### Installation

1. Clone the repository: `git clone git@github.com:sidebetxyz/satoshi-showdown.git`
2. Navigate to the project directory: `cd satoshi-showdown-server`
3. Install dependencies: `npm install`
4. Set up environment variables in `.env` file
5. Start the server: `npm start`

## Usage

- Run the server: `npm start`
- Access the API at `http://localhost:[port]/api`

## API Documentation

Refer to [[JSDocs API Documentation]](https://sidebetxyz.github.io/satoshi-showdown/) for detailed API documentation.

## Development

### Coding Standards

We use ESLint and Prettier for maintaining coding standards. Please adhere to the configurations provided in the project.

### Running Tests

To run tests, execute: `npm test`

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to submit pull requests, report issues, and contribute to the codebase.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

For any inquiries or contributions, please contact [project-maintainer-email] or join our community on [Discord/Slack].
