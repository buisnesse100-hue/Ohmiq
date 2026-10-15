import { createClient } from "@/lib/supabase/server";

export interface ProDashboardStats {
  revenueTotal: number;
  salesCount: number;
  activeListingsCount: number;
  soldListingsCount: number;
  pendingOffersCount: number;
  unreadMessagesCount: number;
}

export async function getProDashboardStats(sellerId: string): Promise<ProDashboardStats> {
  const supabase = await createClient();

  const { data: sellerListings } = await supabase.from("listings").select("id").eq("seller_id", sellerId);
  const listingIds = (sellerListings ?? []).map((l) => l.id);

  const [{ data: completedOrders }, { count: activeListingsCount }, { count: soldListingsCount }, { data: conversations }, { count: pendingOffersCount }] =
    await Promise.all([
      supabase.from("orders").select("amount").eq("seller_id", sellerId).eq("status", "completed"),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("status", "active"),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("status", "sold"),
      supabase.from("conversations").select("seller_unread_count").eq("seller_id", sellerId),
      listingIds.length > 0
        ? supabase
            .from("offers")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending")
            .in("listing_id", listingIds)
        : Promise.resolve({ count: 0 }),
    ]);

  const revenueTotal = (completedOrders ?? []).reduce((sum, o) => sum + Number(o.amount), 0);
  const unreadMessagesCount = (conversations ?? []).reduce((sum, c) => sum + c.seller_unread_count, 0);

  return {
    revenueTotal,
    salesCount: completedOrders?.length ?? 0,
    activeListingsCount: activeListingsCount ?? 0,
    soldListingsCount: soldListingsCount ?? 0,
    pendingOffersCount: pendingOffersCount ?? 0,
    unreadMessagesCount,
  };
}

export async function getSellerOrders(sellerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, listing:listings!orders_listing_id_fkey ( title, slug )")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
