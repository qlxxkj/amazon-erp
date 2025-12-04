// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: '没有接收到文件' },
                { status: 400 }
            );
        }

        // 转发到 Telegraph 图床
        const telegraphFormData = new FormData();
        telegraphFormData.append('file', file);

        const response = await fetch('https://telegra.ph/upload', {
            method: 'POST',
            body: telegraphFormData,
        });

        if (!response.ok) {
            throw new Error(`Telegraph upload failed: ${response.status}`);
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '上传服务暂时不可用'
            },
            { status: 500 }
        );
    }
}