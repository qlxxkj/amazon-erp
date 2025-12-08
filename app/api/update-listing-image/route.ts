// app/api/update-listing-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        // 直接从 Supabase Auth 获取当前用户
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user)
            return NextResponse.json({ success: false, error: "未认证" }, { status: 401 });

        const userId = user.id;

        const { listingId, newImageUrl, targetField = "other_images" } =
            await request.json();

        if (!listingId || !newImageUrl)
            return NextResponse.json({ success: false, error: "缺少参数" }, { status: 400 });

        const { data: listing, error: fetchError } = await supabase
            .from("listings")
            .select("cleaned, user_id")
            .eq("id", listingId)
            .single();

        if (fetchError) throw fetchError;

        if (listing.user_id !== userId)
            return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });

        const currentCleaned = listing.cleaned || {};
        let updatedCleaned;

        if (targetField === "main_image") {
            updatedCleaned = { ...currentCleaned, main_image: newImageUrl };
        } else {
            const currentOtherImages = currentCleaned.other_images || [];
            updatedCleaned = {
                ...currentCleaned,
                other_images: [...currentOtherImages, newImageUrl],
            };
        }

        const { data, error: updateError } = await supabase
            .from("listings")
            .update({
                cleaned: updatedCleaned,
                updated_at: new Date().toISOString(),
            })
            .eq("id", listingId)
            .select();

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || "失败" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user)
            return NextResponse.json({ success: false, error: "未认证" }, { status: 401 });

        const userId = user.id;

        const { listingId, imageUrlToRemove, targetField = "other_images" } =
            await request.json();

        if (!listingId || !imageUrlToRemove)
            return NextResponse.json({ success: false, error: "缺少参数" }, { status: 400 });

        const { data: listing, error: fetchError } = await supabase
            .from("listings")
            .select("cleaned, user_id")
            .eq("id", listingId)
            .single();

        if (fetchError) throw fetchError;

        if (listing.user_id !== userId)
            return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });

        const currentCleaned = listing.cleaned || {};
        let updatedCleaned;

        if (targetField === "main_image") {
            updatedCleaned = { ...currentCleaned, main_image: null };
        } else {
            const currentOtherImages = currentCleaned.other_images || [];
            updatedCleaned = {
                ...currentCleaned,
                other_images: currentOtherImages.filter((u: string) => u !== imageUrlToRemove),
            };
        }

        const { error: updateError } = await supabase
            .from("listings")
            .update({ cleaned: updatedCleaned })
            .eq("id", listingId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "失败" },
            { status: 500 }
        );
    }
}
