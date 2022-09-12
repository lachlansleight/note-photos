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
            <input
                className="text-4xl"
                type="file"
                accept="image/*"
                capture="environment"
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
