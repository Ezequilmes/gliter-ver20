import { onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
// import { db } from '../index';

// Placeholder for chat functions
export const sendMessage = onCall(async (request) => {
  // TODO: Implement message sending with validation
  console.log('Sending message:', request.data);
  return { success: true, message: 'Message send placeholder' };
});

export const onNewMessage = onDocumentCreated('chats/{chatId}/messages/{messageId}', async (event) => {
  // TODO: Implement push notification on new message
  console.log('New message created:', event.data?.data());
  return { success: true };
});