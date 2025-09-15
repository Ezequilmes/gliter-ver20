import ChatPageClient from './ChatPageClient';

export function generateStaticParams() {
  return [
    { chatId: 'chat1' },
    { chatId: 'chat2' },
    { chatId: 'chat3' },
  ];
}

export default function ChatPage() {
  return <ChatPageClient />;
}