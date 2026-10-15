import { createClient } from "@/lib/supabase/server";

const CONVERSATION_SELECT = `
  *,
  listing:listings!conversations_listing_id_fkey ( id, slug, title, price, status ),
  buyer:profiles!conversations_buyer_id_fkey ( id, username, display_name, avatar_url ),
  seller:profiles!conversations_seller_id_fkey ( id, username, display_name, avatar_url )
`;

export interface ConversationSummary {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  listing: { id: string; slug: string; title: string; price: number; status: string } | null;
  buyer: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
  seller: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
}

export async function getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("[getConversationsForUser]", error.message);
    return [];
  }
  return (data ?? []) as unknown as ConversationSummary[];
}

export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<ConversationSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .maybeSingle();

  if (error) return null;
  return data as unknown as ConversationSummary | null;
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getConversationOffers(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getTotalUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data: asBuyer } = await supabase
    .from("conversations")
    .select("buyer_unread_count")
    .eq("buyer_id", userId);
  const { data: asSeller } = await supabase
    .from("conversations")
    .select("seller_unread_count")
    .eq("seller_id", userId);

  const buyerTotal = (asBuyer ?? []).reduce((sum, c) => sum + c.buyer_unread_count, 0);
  const sellerTotal = (asSeller ?? []).reduce((sum, c) => sum + c.seller_unread_count, 0);
  return buyerTotal + sellerTotal;
}
