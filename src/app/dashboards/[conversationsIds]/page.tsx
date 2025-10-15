import { useRouter } from "next/router";

export default function ConversationPage() {
  const router = useRouter();
  const { conversationsIds } = router.query;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Conversation ID</h1>
      <p>{conversationsIds}</p>
    </div>
  );
}
