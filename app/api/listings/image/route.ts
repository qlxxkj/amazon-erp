// app/api/listings/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const BUCKET = "listing-images"; // 你 Supabase 的存储桶名称

/**
 * 创建 Supabase Server Client（自动解析 cookie）
 */
function createClient(req: NextRequest) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => req.cookies.get(name)?.value,
            },
        }
    );
}

/**
 * 上传图片 (method = POST)
 * Body: { listingId, fileName, fileBase64, targetField }
 */
export async function POST(req: NextRequest) {
    const supabase = createClient(req);

    try {
        // 获取用户
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "未认证" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { listingId, fileName, fileBase64, targetField = "other_images" } =
            body;

        if (!listingId || !fileName || !fileBase64) {
            return NextResponse.json(
                { success: false, error: "缺少参数" },
                { status: 400 }
            );
        }

        // 检查 listing 是否属于当前用户
        const { data: listing } = await supabase
            .from("listings")
            .select("cleaned, user_id")
            .eq("id", listingId)
            .single();

        if (!listing || listing.user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: "无权限" },
                { status: 403 }
            );
        }

        // 生成路径：userId/listingId/xxx.jpg
        const filePath = `${user.id}/${listingId}/${Date.now()}-${fileName}`;

        // Base64 → Buffer
        const fileBuffer = Buffer.from(fileBase64, "base64");

        // 上传到 Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, fileBuffer, {
                contentType: "image/jpeg",
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json(
                { success: false, error: uploadError.message },
                { status: 500 }
            );
        }

        // 获取公开 URL
        const {
            data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

        // 更新数据库 cleaned 字段
        const cleaned = listing.cleaned || {};
        let updatedCleaned;

        if (targetField === "main_image") {
            updatedCleaned = { ...cleaned, main_image: publicUrl };
        } else {
            const newList = cleaned.other_images || [];
            updatedCleaned = {
                ...cleaned,
                other_images: [...newList, publicUrl],
            };
        }

        const { error: updateError } = await supabase
            .from("listings")
            .update({
                cleaned: updatedCleaned,
                updated_at: new Date().toISOString(),
            })
            .eq("id", listingId);

        if (updateError) {
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
        });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 500 }
        );
    }
}

/**
 * 删除图片 (method = DELETE)
 * Body: { listingId, imageUrl, targetField }
 */
export async function DELETE(req: NextRequest) {
    const supabase = createClient(req);

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "未认证" },
                { status: 401 }
            );
        }

        const { listingId, imageUrl, targetField = "other_images" } =
            await req.json();

        if (!listingId || !imageUrl) {
            return NextResponse.json(
                { success: false, error: "缺少参数" },
                { status: 400 }
            );
        }

        // 检查 listing 归属
        const { data: listing } = await supabase
            .from("listings")
            .select("cleaned, user_id")
            .eq("id", listingId)
            .single();

        if (!listing || listing.user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: "无权限" },
                { status: 403 }
            );
        }

        const cleaned = listing.cleaned || {};
        let updatedCleaned;

        if (targetField === "main_image") {
            updatedCleaned = { ...cleaned, main_image: null };
        } else {
            const current = cleaned.other_images || [];
            updatedCleaned = {
                ...cleaned,
                other_images: current.filter((u: string) => u !== imageUrl),
            };
        }

        // 从 storage 删除
        // imageUrl 格式: https://xxxx.supabase.co/storage/v1/object/public/listing-images/{path}
        const bucketPrefix = `/${BUCKET}/`;
        const filePath = imageUrl.split(bucketPrefix)[1];

        if (filePath) {
            await supabase.storage.from(BUCKET).remove([filePath]);
        }

        await supabase
            .from("listings")
            .update({ cleaned: updatedCleaned })
            .eq("id", listingId);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 500 }
        );
    }
}
