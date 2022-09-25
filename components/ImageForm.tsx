import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
import * as imageConversion from "image-conversion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaRedo } from "react-icons/fa";
import { LocalNoteImage } from "lib/types";
import FirebaseUtils from "lib/FirebaseUtils";
import TagsField from "./controls/TagsField";
import TextField from "./controls/TextField";
import Button from "./controls/Button";
import DateOffsetField from "./DateOffsetField";

dayjs.extend(CustomParseFormat);

const rotations = [0, 6, 3, 8];

const PhotoForm = ({
    value,
    onChange,
    file,
    onFileChange,
    onCancel,
    onSubmit,
    error = "",
    canChangeFile = true,
    knownId = "",
}: {
    value: LocalNoteImage;
    onChange: (image: LocalNoteImage) => void;
    file?: { file: Blob; thumbnail: Blob } | null;
    onFileChange?: (data: { file: Blob; thumbnail: Blob }) => void;
    onCancel?: () => void;
    onSubmit?: () => void;
    error?: string;
    canChangeFile?: boolean;
    knownId?: string;
}): JSX.Element => {
    const imgRef = useRef<HTMLImageElement>(null);

    const [rawUrl, setRawUrl] = useState("");
    const [url, setUrl] = useState("");
    const [dateString, setDateString] = useState(dayjs(value.date).format("DD/MM/YYYY"));
    const isValid = useMemo(() => dayjs(dateString, "DD/MM/YYYY").isValid(), [dateString]);

    const [rawFile, setRawFile] = useState<File | null>(null);
    const [rotationIndex, setRotationIndex] = useState(0);

    useEffect(() => {
        console.log(imgRef.current, file);
        if (!imgRef.current) return;
        setTimeout(() => {
            onChange({
                ...value,
                size: rawFile?.size || 0,
                type: rawFile?.type || "none",
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

    const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
    const [finalDimensions, setFinalDimensions] = useState({ width: 0, height: 0 });

    const [hasChangedFile, setHasChangedFile] = useState(false);

    useEffect(() => {
        const doLoad = async () => {
            const bytes = await FirebaseUtils.loadBytes(`images/${knownId}`);
            setRawFile(new File([bytes], "image.jpg", { type: "image/jpeg" }));
        };

        if (!knownId) return;
        doLoad();
    }, [knownId]);

    useEffect(() => {
        const doCompress = async () => {
            if (!rawFile) return;
            const fullBlob = await imageConversion.compressAccurately(rawFile, {
                size: 200,
                accuracy: 0.9,
                width: finalDimensions.width,
                height: finalDimensions.height,
                type: imageConversion.EImageType.JPEG,
                orientation: rotations[rotationIndex],
            });
            const thumbnailBlob = await imageConversion.compressAccurately(rawFile, {
                size: 10,
                accuracy: 0.9,
                width: Math.round(finalDimensions.width / 6),
                height: Math.round(finalDimensions.height / 6),
                type: imageConversion.EImageType.JPEG,
                orientation: rotations[rotationIndex],
            });
            const previewUrl = await imageConversion.filetoDataURL(fullBlob);
            setUrl(previewUrl);
            if (onFileChange && hasChangedFile)
                onFileChange({ file: fullBlob, thumbnail: thumbnailBlob });
        };

        if (!rawFile) return;
        if (finalDimensions.width === 0 || finalDimensions.height === 0) return;
        setTimeout(() => doCompress(), 250);
    }, [rawFile, rotationIndex, finalDimensions, hasChangedFile]);

    useEffect(() => {
        if (naturalDimensions.width === 0 || naturalDimensions.height === 0) return;
        const ratio = naturalDimensions.width / naturalDimensions.height;
        const long = 1600;
        const short = ratio < 1 ? Math.round(1600 * ratio) : Math.round(1600 / ratio);
        if (ratio < 1) {
            setFinalDimensions({ width: short, height: long });
        } else {
            setFinalDimensions({ width: long, height: short });
        }
    }, [naturalDimensions]);

    useEffect(() => {
        const getUrl = async () => {
            if (!rawFile) return;
            const url = await imageConversion.filetoDataURL(rawFile);
            setRawUrl(url);
        };

        if (!rawFile) return;
        getUrl();
    }, [rawFile]);

    const tryGetDimensions = useCallback(() => {
        if (!imgRef.current) return;
        setNaturalDimensions({
            width: imgRef.current.naturalWidth,
            height: imgRef.current.naturalHeight,
        });
    }, [imgRef]);

    return (
        <div>
            <div className="w-full h-48 relative -mt-4">
                <img
                    src={rawUrl}
                    ref={imgRef}
                    className={`absolute left-0 top-0 h-full w-full z-0 object-cover rounded-bl-lg rounded-br-lg ${
                        rawUrl ? "" : "hidden"
                    }`}
                    onLoad={tryGetDimensions}
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
                                    setHasChangedFile(true);
                                    setRawFile(e.target.files[0]);
                                }}
                            />
                        </>
                    ) : url ? (
                        <></>
                    ) : (
                        <p className="text-2xl">No image file!</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 mt-8">
                {error && <p className="text-red-300">{error}</p>}
                {url && canChangeFile && (
                    <div className="flex gap-4 justify-center">
                        <button
                            className="text-2xl bg-neutral-700 rounded p-2"
                            onClick={() => {
                                setHasChangedFile(true);
                                setRotationIndex(cur => (cur + 3) % 4);
                            }}
                        >
                            <FaRedo style={{ transform: "scaleX(-1)" }} />
                        </button>
                        <div
                            className="border border-white border-opacity-15 rounded p-2"
                            style={{
                                width: "15rem",
                                height: "15rem",
                            }}
                        >
                            <img
                                src={url}
                                className="object-contain"
                                style={{
                                    width: "calc(15rem - 2px - 1rem)",
                                    height: "calc(15rem - 2px - 1rem)",
                                }}
                            />
                        </div>
                        <button
                            className="text-2xl bg-neutral-700 rounded p-2"
                            onClick={() => {
                                setHasChangedFile(true);
                                setRotationIndex(cur => (cur + 1) % 4);
                            }}
                        >
                            <FaRedo />
                        </button>
                    </div>
                )}
                <DateOffsetField label="Date" value={dateString} onChange={setDateString} />
                <TextField
                    label="Category"
                    value={value.category}
                    placeholder={"Unsorted"}
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
            <pre>{JSON.stringify({ naturalDimensions, finalDimensions }, null, 2)}</pre>
        </div>
    );
};

export default PhotoForm;
