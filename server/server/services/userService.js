const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { ValidationError, NotFoundError } = require('../utils/errorUtil');
const { v4: uuidv4 } = require('uuid');

// Service for managing user operations
const UserService = {
    // Registers a new user or creates a guest user profile
    async createUser(userData, isGuest = false) {
        if (!isGuest && await this.usernameExists(userData.username)) {
            throw new ValidationError('Username already exists');
        }

        const user = new User({
            ...userData,
            uniqueIdentifier: userData.uniqueIdentifier || uuidv4(),
            role: isGuest ? 'participant' : userData.role,
        });

        if (!isGuest) {
            user.passwordHash = await bcrypt.hash(userData.password, 10);
        }

        await user.save();
        return this.excludeSensitiveData(user);
    },

    async getOrCreateUserId(req) {
        if (req.user && req.user._id) {
            return req.user._id;
        } else {
            const guestUserData = {
                username: `guest_${uuidv4()}`,
                role: 'participant',
                isGuest: true
            };
            const guestUser = await this.createUser(guestUserData, true);
            return guestUser._id;
        }
    },

    // Retrieves a user profile by ID, excluding sensitive information
    async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return this.excludeSensitiveData(user);
    },

    // Updates a user's profile information
    async updateUser(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (updateData.password && !user.isGuest) {
            updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
            delete updateData.password;
        }

        Object.assign(user, updateData);
        await user.save();
        return this.excludeSensitiveData(user);
    },

    // Checks if a username already exists in the database
    async usernameExists(username) {
        const count = await User.countDocuments({ username });
        return count > 0;
    },

    // Excludes sensitive data from user objects
    excludeSensitiveData(user) {
        const userObj = user.toObject();
        delete userObj.passwordHash;
        return userObj;
    },

    // Additional methods can be implemented as needed
};

module.exports = UserService;
