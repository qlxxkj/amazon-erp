// app/api/update-listing-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
    try {
        const { listingId, newImageUrl, targetField = 'other_images' } = await request.json();

        if (!listingId || !newImageUrl) {
            return NextResponse.json(
                { success: false, error: '缺少必要参数: listingId 或 newImageUrl' },
                { status: 400 }
            );
        }

        // 获取当前数据
        const { data: currentListing, error: fetchError } = await supabase
            .from('listings')
            .select('cleaned')
            .eq('id', listingId)
            .single();

        if (fetchError) {
            throw new Error(`获取数据失败: ${fetchError.message}`);
        }

        const currentCleaned = currentListing?.cleaned || {};
        let updatedCleaned;

        if (targetField === 'main_image') {
            // 更新主图
            updatedCleaned = { ...currentCleaned, main_image: newImageUrl };
        } else {
            // 添加到其他图片数组
            const currentOtherImages = currentCleaned.other_images || [];
            updatedCleaned = {
                ...currentCleaned,
                other_images: [...currentOtherImages, newImageUrl]
            };
        }

        // 执行更新
        const { data, error: updateError } = await supabase
            .from('listings')
            .update({
                cleaned: updatedCleaned,
                updated_at: new Date().toISOString()
            })
            .eq('id', listingId)
            .select();

        if (updateError) {
            throw new Error(`更新失败: ${updateError.message}`);
        }

        return NextResponse.json({
            success: true,
            message: '图片URL更新成功',
            data
        });

    } catch (error) {
        console.error('Database update error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '数据库更新失败'
            },
            { status: 500 }
        );
    }
}

// 删除图片的API
export async function DELETE(request: NextRequest) {
    try {
        const { listingId, imageUrlToRemove, targetField = 'other_images' } = await request.json();

        if (!listingId || !imageUrlToRemove) {
            return NextResponse.json(
                { success: false, error: '缺少必要参数' },
                { status: 400 }
            );
        }

        const { data: currentListing, error: fetchError } = await supabase
            .from('listings')
            .select('cleaned')
            .eq('id', listingId)
            .single();

        if (fetchError) throw fetchError;

        const currentCleaned = currentListing?.cleaned || {};
        let updatedCleaned;

        if (targetField === 'main_image') {
            // 如果是主图，清空主图字段
            updatedCleaned = { ...currentCleaned, main_image: null };
        } else {
            // 从other_images数组中移除指定图片
            const currentOtherImages = currentCleaned.other_images || [];
            updatedCleaned = {
                ...currentCleaned,
                other_images: currentOtherImages.filter((url: string) => url !== imageUrlToRemove)
            };
        }

        const { error: updateError } = await supabase
            .from('listings')
            .update({ cleaned: updatedCleaned })
            .eq('id', listingId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: '图片删除成功' });

    } catch (error) {
        console.error('Delete image error:', error);
        return NextResponse.json(
            { success: false, error: '删除失败' },
            { status: 500 }
        );
    }
}