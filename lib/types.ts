export interface LocalNoteImage {
    width: number;
    height: number;
    size: number;
    type: string;
    projects: Project[];
}

export interface NoteImage extends LocalNoteImage {
    id: string;
    url: string;
    thumbnailUrl: string;
}

export interface Project {
    date: Date;
    name: string;
}

export const ImageHasCategory = (image: NoteImage, category: string) =>
    image.projects.findIndex(p => p.name === category) !== -1;
