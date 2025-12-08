// app/api/listings/service.ts
import { createServerSupabaseClient } from "@/utils/supabase/server";

export const listingService = {
    async getListings() {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("listings")
            .select("id, cleaned")
            .order('id', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getListingById(id: number) {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("listings")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async updateListing(id: number, payload: any) {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("listings")
            .update(payload)
            .eq("id", id)
            .select();

        if (error) throw error;
        return data;
    },

    async deleteListing(id: number) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("listings")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },
};
