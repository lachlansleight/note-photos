export interface LocalNoteImage {
    width: number;
    height: number;
    size: number;
    type: string;
    date: Date;
    category: string;
    tags: string[];
    note?: string;
}

export interface NoteImage extends LocalNoteImage {
    id: string;
    url: string;
    thumbnailUrl: string;
}
