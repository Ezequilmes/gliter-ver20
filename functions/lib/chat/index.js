"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewMessage = exports.sendMessage = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
// import { db } from '../index';
// Placeholder for chat functions
exports.sendMessage = (0, https_1.onCall)(async (request) => {
    // TODO: Implement message sending with validation
    console.log('Sending message:', request.data);
    return { success: true, message: 'Message send placeholder' };
});
exports.onNewMessage = (0, firestore_1.onDocumentCreated)('chats/{chatId}/messages/{messageId}', async (event) => {
    var _a;
    // TODO: Implement push notification on new message
    console.log('New message created:', (_a = event.data) === null || _a === void 0 ? void 0 : _a.data());
    return { success: true };
});
//# sourceMappingURL=index.js.map