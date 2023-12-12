# Satoshi Showdown

## Overview
SatoshiShowdown is a web-based application designed for competitive events with a unique Bitcoin transaction-based entry system. It focuses on backend functionalities, with plans to develop a comprehensive client-server model.

## Project Structure

### Server
- **Location**: `server` folder.
- **Functionalities**: Handles Bitcoin transactions, event management, and wallet operations.
- **Technologies**: Node.js, Express.js, and Mongoose.

### Client (Planned)
- **Location**: `client` folder (future development).
- **Goal**: To provide a user-friendly interface for event participation and monitoring.
- **Technologies**: Planned use of React.js or a similar framework.

## Key Components

- **Models**: MongoDB schemas for events, wallets, and blockchain transactions.
- **Routes**: API endpoints for event and transaction management.
- **Services**: Core business logic, including real-time Bitcoin transaction monitoring.
- **Utils**: Utility functions and database connection setup.

## Setup and Installation

1. Ensure Node.js and MongoDB are installed.
2. Navigate to the `server` directory.
3. Install dependencies with `npm install`.
4. Set up a `.env` file with necessary environment variables.
5. Start the server using `npm start`.

## Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string.
- `ENCRYPTION_KEY`: Key for encrypting sensitive data.
- `PORT`: (Optional) Server port number.

## API Endpoints

- `/events`: Event creation and management.
- `/transactions`: Handling Bitcoin transactions.

## Error Handling

Custom error handling is implemented with specialized classes and middleware:
- `BaseError`: Base class for custom errors with timestamps.
- `DatabaseError`: Handles database operation errors.
- `ValidationError`: Manages validation errors.
- `NotFoundError`: Used when a resource is not found.
- `errorHandler`: Middleware for processing and logging errors in Express.

## Development Best Practices

- Write clean, well-commented, and efficient code.
- Adhere to the project's coding conventions and style guide.
- Regularly update the repository with changes and document them.
- Thoroughly test all features.

## Contributing

- Use the feature-branch workflow for contributions.
- Submit pull requests with clear descriptions and issue references.
- Mandatory code reviews before merging.

## Future Enhancements

- Broaden event types and transaction options.
- Add support for additional cryptocurrencies.
- Enhance security features and user authentication.

## Note

This documentation is for internal use only as part of the development phase of SatoshiShowdown. All information is confidential.
