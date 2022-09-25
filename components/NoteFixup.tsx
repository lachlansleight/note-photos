import { useCallback, useState } from "react";
import * as imageConversion from "image-conversion";
import axios from "axios";
import { NoteImage } from "lib/types";
import FirebaseUtils from "lib/FirebaseUtils";
import useAuth from "lib/hooks/useAuth";
import Button from "./controls/Button";

const NoteFixup = ({ notes }: { notes: NoteImage[] }): JSX.Element => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const doLoad = useCallback(async () => {
        if (!user) return;
        const fixImage = async (note: NoteImage) => {
            console.log(note);
            if (!user) return;
            const bytes = await FirebaseUtils.loadBytes(`images/${note.id}`);
            const file = new Blob([bytes]);

            const fullBlob = await imageConversion.compressAccurately(file, {
                size: 200,
                accuracy: 0.9,
                width: 1200,
                height: Math.round(1200 * 1.333),
                type: imageConversion.EImageType.JPEG,
            });
            const uploadedUrl = await FirebaseUtils.uploadBytes(
                fullBlob,
                `/test-images/${note.id}`
            );
            console.log({ uploadedUrl });

            const thumbnailBlob = await imageConversion.compressAccurately(file, {
                size: 10,
                accuracy: 0.9,
                width: 200,
                height: Math.round(200 * 1.333),
                type: imageConversion.EImageType.JPEG,
            });
            const uploadedThumbnailUrl = await FirebaseUtils.uploadBytes(
                thumbnailBlob,
                `/test-thumbnails/${note.id}`
            );
            console.log({ uploadedThumbnailUrl });

            await axios.patch(`/api/image?id=${note.id}&auth=${user.token || ""}`, {
                url: uploadedUrl,
                thumbnailUrl: uploadedThumbnailUrl,
                width: 1200,
                height: Math.round(1200 * 1.333),
            });
        };

        setLoading(true);
        setProgress(1);
        for (let i = 1; i < notes.length; i++) {
            await fixImage(notes[i]);
            setProgress(i);
        }
        setProgress(notes.length);
        setLoading(false);
    }, [user, notes]);

    return (
        <div>
            {loading ? (
                <div>
                    <div className="w-full h-10 relative border border-white rounded">
                        <div
                            className="absolute z-0 h-full bg-primary-500 left-0 top-0"
                            style={{
                                width: `${(progress / notes.length) * 100}%`,
                            }}
                        />
                        <p className="absolute z-10 h-full w-full grid place-items-center font-bold text-lg">
                            Fixing image {progress} / {notes.length}
                        </p>
                    </div>
                </div>
            ) : (
                <Button
                    className="text-4xl bg-primary-800 rounded px-4 py-2"
                    onClick={() => doLoad()}
                >
                    Go!
                </Button>
            )}
        </div>
    );
};

export default NoteFixup;
