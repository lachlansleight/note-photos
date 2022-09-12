import { useEffect, useState } from "react";

const TakePhoto = ({ onPhoto }: { onPhoto: (file: File, url: string) => void }): JSX.Element => {
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (file == null) return;
        const newUrl = URL.createObjectURL(file);
        onPhoto(file, newUrl);
    }, [file]);

    return (
        <div className="h-48 grid place-items-center">
            <label className="text-4xl px-8 py-2 bg-primary-800 rounded" htmlFor="photo">
                Take Photo
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
                    setFile(e.target.files[0]);
                }}
            />
        </div>
    );
};

export default TakePhoto;
