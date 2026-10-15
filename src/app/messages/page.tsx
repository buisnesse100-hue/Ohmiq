import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/services/profiles";
import { getConversationsForUser } from "@/services/messaging";
import { ConversationList } from "@/components/messaging/ConversationList";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?next=/messages");

  const conversations = await getConversationsForUser(profile.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Messages</h1>
      <div className="mt-6">
        <ConversationList conversations={conversations} currentUserId={profile.id} />
      </div>
    </div>
  );
}
