import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
import { useCallback, useRef, useState } from "react";
import axios from "axios";
import * as imageConversion from "image-conversion";
import { NoteImage, LocalNoteImage } from "lib/types";
import FirebaseUtils from "lib/FirebaseUtils";
import useAuth from "lib/hooks/useAuth";
import TagsField from "./controls/TagsField";
import TextField from "./controls/TextField";
import Button from "./controls/Button";

dayjs.extend(CustomParseFormat);

const PhotoForm = ({
    file,
    url,
    onCancel,
    onComplete,
}: {
    file: File;
    url: string;
    onCancel?: () => void;
    onComplete?: () => void;
}): JSX.Element => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [dateString, setDateString] = useState(dayjs().format("DD/MM/YYYY"));
    const [noteImage, setNoteImage] = useState<LocalNoteImage>({
        width: 0,
        height: 0,
        size: 0,
        type: "none",
        date: new Date(),
        category: "unsorted",
        tags: [],
        note: "",
    });
    const [phase, setPhase] = useState<"form" | "uploading" | "done">("form");
    const [error, setError] = useState("");
    const { user } = useAuth();

    const upload = useCallback(() => {
        if (!file || !url) {
            setError("No file!");
            return;
        }
        if (!user) {
            setError("Not authenticated!");
            return;
        }
        setError("");
        const doUpload = async () => {
            setPhase("uploading");

            try {
                const newId: string = (await axios.post(`/api/image?auth=${user.token}`, {})).data
                    .id;
                console.log({ newId });
                const uploadedUrl = await FirebaseUtils.uploadBytes(file, `/images/${newId}`);
                console.log({ uploadedUrl });
                const thumbnailBlob = await imageConversion.compressAccurately(file, {
                    size: 100,
                    type: imageConversion.EImageType.JPEG,
                });
                const uploadedThumbnailUrl = await FirebaseUtils.uploadBytes(
                    thumbnailBlob,
                    `/thumbnails/${newId}`
                );
                console.log(uploadedThumbnailUrl);
                const newImage: NoteImage = {
                    ...noteImage,
                    id: newId,
                    url: uploadedUrl,
                    thumbnailUrl: uploadedThumbnailUrl,
                    size: file.size,
                    type: file.type,
                    width: imgRef.current?.naturalWidth || 0,
                    height: imgRef.current?.naturalHeight || 0,
                };
                console.log({ newImage });
                await axios.put(`/api/image?auth=${user.token}`, newImage);

                setPhase("done");
                if (onComplete) onComplete();
            } catch (e: any) {
                console.error(e);
                setError(e?.message || "unknown error");
                setPhase("form");
            }
        };

        doUpload();
    }, [noteImage, file, url, user, imgRef]);

    return (
        <div>
            <img
                src={url}
                ref={imgRef}
                className="w-screen h-48 object-cover rounded-bl-lg rounded-br-lg -mt-4"
            />
            {phase === "form" && (
                <div className="flex flex-col gap-2 mt-8">
                    {error && <p className="text-red-300">{error}</p>}
                    <TextField
                        label="Date"
                        value={dateString}
                        onChange={s => {
                            setDateString(s);
                            const t = dayjs();
                            const d = dayjs(s, "DD/MM/YYYY");
                            d.set("hour", t.get("hour"));
                            d.set("minute", t.get("minute"));
                            d.set("second", t.get("second"));
                            setNoteImage(cur => ({
                                ...cur,
                                date: d.toDate(),
                            }));
                        }}
                    />
                    <TextField
                        label="Category"
                        value={noteImage.category}
                        onChange={s => setNoteImage(cur => ({ ...cur, category: s }))}
                    />
                    <TagsField
                        label="Tags"
                        value={noteImage.tags}
                        onChange={s => setNoteImage(cur => ({ ...cur, tags: s }))}
                    />
                    <TextField
                        label="Note"
                        value={noteImage.note || ""}
                        onChange={s => setNoteImage(cur => ({ ...cur, note: s }))}
                    />
                    <div className="flex flex-col gap-4 pl-24">
                        <Button
                            className="px-2 py-1 rounded bg-primary-800 text-lg"
                            onClick={upload}
                        >
                            Upload
                        </Button>
                        <Button
                            className="mx-24 px-2 py-1 rounded bg-red-800 bg-opacity-50 text-md"
                            onClick={() => {
                                if (!window.confirm("Discard photo and all entered data?")) return;
                                if (onCancel) onCancel();
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                    <pre>{JSON.stringify(noteImage, null, 2)}</pre>
                </div>
            )}
            {phase === "uploading" && (
                <div className="h-48 grid place-items-center">
                    <p className="text-4xl">Uploading...</p>
                </div>
            )}
            {phase === "done" && (
                <div className="h-48 grid place-items-center">
                    <p className="text-4xl">Done!</p>
                </div>
            )}
        </div>
    );
};

export default PhotoForm;
