import { useCallback, useState } from "react";
import * as imageConversion from "image-conversion";
import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import { FaCheckCircle, FaSync } from "react-icons/fa";
import Layout from "components/layout/Layout";
import PhotoForm from "components/ImageForm";
import { LocalNoteImage, NoteImage } from "lib/types";
import useAuth from "lib/hooks/useAuth";
import FirebaseUtils from "lib/FirebaseUtils";

dayjs.extend(CustomParseFormat);

const UploadPage = (): JSX.Element => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [newImage, setNewImage] = useState<LocalNoteImage>({
        category: "unsorted",
        tags: [],
        width: 0,
        height: 0,
        size: 0,
        type: "none",
        note: "",
        date: dayjs().startOf("day").toDate(),
    });
    const [error, setError] = useState("");
    const [phase, setPhase] = useState<"form" | "uploading" | "done">("form");
    const [uploadCount, setUploadCount] = useState(0);

    const restart = () => {
        setNewImage(cur => ({
            category: "",
            tags: [],
            width: 0,
            height: 0,
            size: 0,
            type: "none",
            note: "",
            date: cur.date,
        }));
        setError("");
        setFile(null);
        setPhase("form");
        setUploadCount(0);
    };

    const upload = useCallback(() => {
        if (!user) {
            setError("Not authenticated!");
            return;
        }
        if (!file) {
            setError("No file!");
            return;
        }
        if (!dayjs(newImage.date).isValid()) {
            setError("Invalid date!");
            return;
        }
        setError("");
        const doUpload = async () => {
            setPhase("uploading");
            setUploadCount(0);

            try {
                const newId: string = (await axios.post(`/api/image?auth=${user.token}`, {})).data
                    .id;
                console.log({ newId });
                setUploadCount(1);
                const uploadedUrl = await FirebaseUtils.uploadBytes(file, `/images/${newId}`);
                console.log({ uploadedUrl });
                setUploadCount(2);
                const thumbnailBlob = await imageConversion.compressAccurately(file, {
                    size: 100,
                    type: imageConversion.EImageType.JPEG,
                });
                setUploadCount(3);
                const uploadedThumbnailUrl = await FirebaseUtils.uploadBytes(
                    thumbnailBlob,
                    `/thumbnails/${newId}`
                );
                setUploadCount(4);
                console.log(uploadedThumbnailUrl);
                const finalDate = dayjs(newImage.date);
                finalDate.set("hour", dayjs().hour());
                finalDate.set("minute", dayjs().minute());
                finalDate.set("second", dayjs().second());
                const toUpload: NoteImage = {
                    ...newImage,
                    date: finalDate.toDate(),
                    id: newId,
                    url: uploadedUrl,
                    thumbnailUrl: uploadedThumbnailUrl,
                    category: newImage.category || "unsorted",
                };
                console.log({ toUpload });
                await axios.put(`/api/image?auth=${user.token}`, toUpload);
                setUploadCount(5);

                await new Promise(resolve => setTimeout(resolve, 500));

                setPhase("done");
            } catch (e: any) {
                console.error(e);
                setError(e?.message || "unknown error");
                setPhase("form");
            }
        };

        doUpload();
    }, [newImage, file, user]);

    return (
        <Layout>
            {phase === "form" && (
                <PhotoForm
                    value={newImage}
                    onChange={setNewImage}
                    file={file}
                    onFileChange={setFile}
                    onCancel={restart}
                    onSubmit={upload}
                    error={error}
                    canChangeFile={true}
                />
            )}
            {phase === "uploading" && (
                <div className="w-full py-48 grid place-items-center">
                    <div className="flex flex-col gap-8 items-center w-full">
                        <FaSync className="text-8xl animate-spin" />
                        <div className="text-4xl py-2 w-full grid place-items-center rounded border border-white relative">
                            <span className="relative z-10">Uploading...</span>
                            <div
                                className="absolute z-0 left-0 top-0 h-full bg-primary-900"
                                style={{
                                    width: `${(100 * uploadCount) / 5}%`,
                                    transition: "all 0.3s",
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {phase === "done" && (
                <div className="w-full py-48 grid place-items-center">
                    <div className="flex flex-col gap-8 items-center w-full">
                        <FaCheckCircle className="text-8xl" />
                        <p className="text-4xl py-2">Upload Complete</p>
                        <button
                            className="text-2xl bg-primary-800 rounded py-2 px-4"
                            onClick={restart}
                        >
                            Upload Another
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UploadPage;

/*
//Leaving this here so that I don't have to keep looking up the syntax...
import { GetServerSidePropsContext } from "next/types";
export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<{ props: any }> {
    return {
        props: {  },
    };
}
*/
