import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/services/profiles";
import {
  getConversationById,
  getConversationMessages,
  getConversationOffers,
} from "@/services/messaging";
import { markConversationReadAction } from "@/actions/messaging";
import { MessageThread } from "@/components/messaging/MessageThread";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Conversation" };

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/connexion?next=/messages/${id}`);

  const conversation = await getConversationById(id, profile.id);
  if (!conversation) notFound();

  const [messages, offers] = await Promise.all([
    getConversationMessages(id),
    getConversationOffers(id),
  ]);

  await markConversationReadAction(id);

  const isSeller = conversation.seller_id === profile.id;
  const otherParty = isSeller ? conversation.buyer : conversation.seller;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link href="/messages" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> Retour aux messages
      </Link>

      <div className="mt-3 mb-4">
        <h1 className="font-display text-xl font-semibold">{otherParty?.display_name}</h1>
        {conversation.listing && (
          <Link
            href={`/annonce/${conversation.listing.slug}`}
            className="text-sm text-volt-ink underline"
          >
            {conversation.listing.title} · {formatPrice(conversation.listing.price)}
          </Link>
        )}
      </div>

      <MessageThread
        conversationId={id}
        listingId={conversation.listing_id}
        currentUserId={profile.id}
        isSeller={isSeller}
        messages={messages}
        offers={offers}
        listingStatus={conversation.listing?.status ?? "active"}
      />
    </div>
  );
}
