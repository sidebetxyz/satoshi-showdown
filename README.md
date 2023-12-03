# SatoshiShowdown

## Overview

SatoshiShowdown is an innovative web-based application facilitating competitive events with a Bitcoin transaction-based entry system. This project is currently in its development phase, focusing primarily on backend functionalities with plans to expand into a comprehensive client-server model.

## Project Structure

- **Server**:
  - Located in the `server` folder.
  - Handles Bitcoin transactions, event management, and wallet operations.
  - Built with Node.js, Express.js, and Mongoose.

- **Client**:
  - Future development in the `client` folder.
  - Will provide a user-friendly interface for event participation and monitoring.
  - Planned technologies include React.js (or a similar framework).

### Server Details

#### Key Components

- **Models**: MongoDB schemas for events, wallets, and blockchain transactions.
- **Routes**: API endpoints for event and transaction management.
- **Services**: Core business logic, including `BlockchainService` for real-time Bitcoin transaction monitoring.
- **Utils**: Utility functions and database connection setup.

#### Setup and Installation

1. Ensure Node.js and MongoDB are installed.
2. Navigate to the `server` directory.
3. Install dependencies:

    ```text
    npm install
    ```

4. Set up a `.env` file with the necessary environment variables.
5. Start the server:

    ```text
    npm start
    ```

#### Environment Variables

- `MONGODB_URI`: Connection string for MongoDB Atlas.
- `ENCRYPTION_KEY`: Key used for encrypting sensitive data.
- `PORT`: (Optional) Port number for the server.

#### API Endpoints

- `/events`: Event creation and management.
- `/transactions`: Handling of Bitcoin transactions.
- More details in the API documentation (to be provided).

### Client Considerations (Next Steps)

- Design and develop a frontend application.
- Focus on user experience for event creation, participation, and tracking.
- Implement secure and intuitive Bitcoin transaction functionalities.
- Integrate with the server's RESTful API.

## Development Best Practices

- Write clean, commented, and efficient code.
- Follow the project's coding conventions and style guide.
- Regularly push changes to the repository and document updates.
- Ensure thorough testing of all features.

## Contributing

- Follow the feature-branch workflow for contributions.
- Submit pull requests with concise descriptions and reference to related issues.
- Code reviews are mandatory before merging.

## Future Enhancements

- Expand the event types and transaction options.
- Integrate additional cryptocurrency support.
- Enhance security features and user authentication.

---

**Note**: This documentation is for internal use only as part of the development phase of SatoshiShowdown. All information is confidential and should not be shared externally.
