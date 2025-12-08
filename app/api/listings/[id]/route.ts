// app/api/listings/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';


export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const listingId = Number(id); // ← 正确方式
        if (isNaN(listingId)) {
            return NextResponse.json(
                { error: 'Invalid listing ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const optimized = body.optimized || null;

        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from('listings')
            .update({ optimized })
            .eq('id', listingId)
            .select();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Server Error' },
            { status: 500 }
        );
    }
}
