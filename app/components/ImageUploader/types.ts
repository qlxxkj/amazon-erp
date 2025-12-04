// components/ImageUploader/types.ts
export interface ImageUploaderProps {
    listingId: number;
    targetField: 'main_image' | 'other_images';
    initialImages?: string[];
    maxCount?: number;
    onUploadSuccess?: (imageUrl: string) => void;
    onDeleteSuccess?: (imageUrl: string) => void;
    
}

export interface UploadResponse {
    success: boolean;
    data?: {
        src: string;
    }[];
    error?: string;
}

export interface DatabaseUpdateResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export interface ImageFile {
    id: string;
    url: string;
    file?: File;
    status: 'uploading' | 'success' | 'error';
}