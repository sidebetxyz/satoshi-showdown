# Satoshi Showdown

## Overview

Satoshi Showdown is a sophisticated web-based platform dedicated to organizing and running competitive events, leveraging Bitcoin transactions. It combines efficient event management with secure transaction handling and user interaction.

## Project Structure

### Server Application

Located in the `server` directory, this application is the core of Satoshi Showdown, handling critical functionalities:

- **Bitcoin Transactions**: Manages the intricacies of Bitcoin transactions for event participation and prize allocation.
- **Event Management**: Supports creating, updating, and overseeing competitive events.
- **User and Wallet Management**: Offers services for user registration, authentication, and digital wallet operations.
- **Middleware Integration**: Employs various middleware for enhanced security, data processing, and error management.
- **Technology Stack**: Uses Node.js, Express.js, MongoDB, Mongoose, and a suite of cryptographic libraries.

### Certificates

The `certs` folder within the `server` directory contains SSL/TLS certificates and keys (`cert.pem`, `csr.pem`, `key.pem`) for HTTPS setup and secure data transmission.

### Configuration Files

In the `configs` folder, configuration files for essential tools are maintained:

- **JSDoc (`jsdoc.json`)**: Configurations for generating project documentation.
- **ESLint (`.eslintrc.js`)**: JavaScript linting options for code quality and consistency.
- **Prettier (`.prettierrc`)**: Code formatting rules.
- **dotenv**: Environment variable configurations.

### Client Application (Future Development)

Planned under a separate `client` folder, focused on delivering an intuitive user interface for the platform's services.

## Key Components

- **Controllers**: Manage API requests and responses.
- **Models**: Define data structures and schemas for the MongoDB database.
- **Routes**: Specify API endpoints for client-server communication.
- **Services**: Core business logic, including transaction handling and event management.
- **Utils**: Auxiliary functions for database connectivity, logging, error handling, and more.

## Installation and Setup

1. Install Node.js, npm, and MongoDB.
2. Clone the repository and navigate to the `server` directory.
3. Run `npm install` to install dependencies.
4. Set up a `.env` file for environment variables (e.g., database URI, cryptographic keys).
5. Start the application with `npm start`.

## Environment Variables

- **Database URI**: MongoDB connection string.
- **Cryptographic Keys**: Keys for data encryption and secure connections.
- **Server Configuration**: Additional settings like the port number.

## API Documentation

The project utilizes JSDoc for documentation generation, configured in `configs/jsdoc.json`.

## Development Best Practices

- Write clean, efficient, and well-documented code.
- Follow predefined coding standards and style guidelines.
- Consistently update the repository with changes and accompanying documentation.
- Conduct thorough testing for all features and functionalities.

## Contributing Guidelines

- Use a feature-branch workflow for development.
- Code reviews are mandatory before merging any changes.
- Follow protocols for pull requests, including detailed descriptions and issue references.

## Future Enhancements

- Broadening the scope of event types and user interaction features.
- Integration of additional cryptocurrencies and payment methods.
- Enhancement of security features and user authentication mechanisms.

## Confidentiality Note

This README and the associated codebase are part of Satoshi Showdown's internal development phase. All information is confidential and proprietary.
