import Link from "next/link";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { formatRelativeDate, formatPrice } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/supabase/storage";
import type { ConversationSummary } from "@/services/messaging";

export function ConversationList({
  conversations,
  currentUserId,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
}) {
  if (conversations.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-line-strong bg-paper-muted p-8 text-center text-muted">
        Aucune conversation pour le moment. Contacte un vendeur depuis une annonce pour démarrer.
      </p>
    );
  }

  return (
    <div className="divide-y divide-line rounded-[14px] border border-line">
      {conversations.map((conv) => {
        const isBuyer = conv.buyer_id === currentUserId;
        const otherParty = isBuyer ? conv.seller : conv.buyer;
        const unreadCount = isBuyer ? conv.buyer_unread_count : conv.seller_unread_count;
        const avatarUrl = getAvatarUrl(otherParty?.avatar_url);

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 p-4 hover:bg-paper-muted"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper-muted text-muted">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" />
              ) : (
                <UserIcon size={20} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-ink">
                  {otherParty?.display_name ?? "Utilisateur"}
                </p>
                <span className="shrink-0 text-xs text-muted">
                  {formatRelativeDate(conv.last_message_at)}
                </span>
              </div>
              <p className="truncate text-sm text-muted">
                {conv.listing?.title} {conv.listing ? `· ${formatPrice(conv.listing.price)}` : ""}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-volt px-1.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
