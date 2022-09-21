import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useMemo, useRef, useState } from "react";
import { LocalNoteImage } from "lib/types";
import TagsField from "./controls/TagsField";
import TextField from "./controls/TextField";
import Button from "./controls/Button";
import DateOffsetField from "./DateOffsetField";

dayjs.extend(CustomParseFormat);

const PhotoForm = ({
    value,
    onChange,
    file,
    onFileChange,
    onCancel,
    onSubmit,
    error = "",
    canChangeFile = true,
    knownUrl = "",
}: {
    value: LocalNoteImage;
    onChange: (image: LocalNoteImage) => void;
    file?: File | null;
    onFileChange?: (file: File) => void;
    onCancel?: () => void;
    onSubmit?: () => void;
    error?: string;
    canChangeFile?: boolean;
    knownUrl?: string;
}): JSX.Element => {
    const imgRef = useRef<HTMLImageElement>(null);

    const [url, setUrl] = useState("");
    const [dateString, setDateString] = useState(dayjs(value.date).format("DD/MM/YYYY"));
    const isValid = useMemo(() => dayjs(dateString, "DD/MM/YYYY").isValid(), [dateString]);

    useEffect(() => {
        if (file == null) return;
        const newUrl = URL.createObjectURL(file);
        setUrl(newUrl);
    }, [file, imgRef]);

    useEffect(() => {
        console.log(imgRef.current, file);
        if (!imgRef.current) return;
        setTimeout(() => {
            onChange({
                ...value,
                size: file?.size || 0,
                type: file?.type || "none",
                width: imgRef.current?.naturalWidth || 0,
                height: imgRef.current?.naturalHeight || 0,
            });
        }, 250);
    }, [file, imgRef]);

    useEffect(() => {
        const isValid = dayjs(dateString, "DD/MM/YYYY").isValid();
        if (isValid) {
            onChange({ ...value, date: dayjs(dateString, "DD/MM/YYYY").startOf("day").toDate() });
        }
    }, [dateString]);

    return (
        <div>
            <div className="w-full h-48 relative -mt-4">
                <img
                    src={knownUrl || url}
                    ref={imgRef}
                    className={`absolute left-0 top-0 h-full w-full z-0 object-cover rounded-bl-lg rounded-br-lg ${
                        knownUrl || url ? "" : "hidden"
                    }`}
                />
                <div className="absolute left-0 top-0 h-full w-full z-10 grid place-items-center">
                    {canChangeFile ? (
                        <>
                            <label
                                className="text-4xl px-8 py-2 bg-primary-800 rounded"
                                htmlFor="photo"
                            >
                                {url ? "Retake Photo" : "Take Photo"}
                            </label>
                            <input
                                id="photo"
                                className="text-2xl"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                hidden={true}
                                onChange={e => {
                                    if (e.target.files == null) return;
                                    if (e.target.files.length === 0) return;
                                    if (onFileChange) onFileChange(e.target.files[0]);
                                }}
                            />
                        </>
                    ) : knownUrl || url ? (
                        <></>
                    ) : (
                        <p className="text-2xl">No image file!</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 mt-8">
                {error && <p className="text-red-300">{error}</p>}
                <DateOffsetField label="Date" value={dateString} onChange={setDateString} />
                <TextField
                    label="Category"
                    value={value.category}
                    onChange={s => onChange({ ...value, category: s })}
                />
                <TagsField
                    label="Tags"
                    value={value.tags}
                    onChange={s => onChange({ ...value, tags: s })}
                />
                <TextField
                    label="Note"
                    value={value.note || ""}
                    onChange={s => onChange({ ...value, note: s })}
                />
                <div className="flex flex-col gap-4 pl-24 mt-8">
                    <Button
                        className={`px-2 py-1 rounded text-lg ${
                            isValid ? "bg-primary-800" : "bg-gray-500"
                        }`}
                        onClick={() => {
                            if (onSubmit) onSubmit();
                        }}
                    >
                        Upload
                    </Button>
                    <Button
                        className="mx-12 px-2 py-1 rounded bg-red-800 bg-opacity-50 text-md"
                        onClick={() => {
                            if (!window.confirm("Discard photo and all entered data?")) return;
                            if (onCancel) onCancel();
                        }}
                    >
                        Cancel
                    </Button>
                    {error && <p className="text-center text-red-300">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default PhotoForm;