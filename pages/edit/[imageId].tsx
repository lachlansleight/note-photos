import { useCallback, useState } from "react";
import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import { FaCheckCircle, FaSync } from "react-icons/fa";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import Layout from "components/layout/Layout";
import PhotoForm from "components/ImageForm";
import { NoteImage } from "lib/types";
import useAuth from "lib/hooks/useAuth";
import { getImage } from "pages/api/image";
import FirebaseUtils from "lib/FirebaseUtils";

dayjs.extend(CustomParseFormat);

const EditPage = ({ image }: { image: NoteImage }): JSX.Element => {
    const { user } = useAuth();
    const router = useRouter();
    const [newImage, setNewImage] = useState<NoteImage>({
        id: image.id || "",
        url: image.url || "",
        thumbnailUrl: image.thumbnailUrl || "",
        width: image.width || 0,
        height: image.height || 0,
        size: image.size || 0,
        type: image.type || "",
        date: image.date || dayjs().startOf("day").toDate(),
        category: (image.category === "unsorted" ? "" : image.category) || "",
        tags: image.tags || [],
        note: image.note || "",
    });
    const [error, setError] = useState("");
    const [file, setFile] = useState<{ file: Blob; thumbnail: Blob } | null>(null);
    const [phase, setPhase] = useState<"form" | "uploading" | "done">("form");
    const [uploadCount, setUploadCount] = useState(0);

    const upload = useCallback(() => {
        if (!user) {
            setError("Not authenticated!");
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
                let url = newImage.url;
                let thumbnailUrl = newImage.thumbnailUrl;
                if (file) {
                    url = await FirebaseUtils.uploadBytes(file.file, `/images/${newImage.id}`);
                    console.log({ uploadedUrl: url });
                    setUploadCount(1);
                    thumbnailUrl = await FirebaseUtils.uploadBytes(
                        file.thumbnail,
                        `/thumbnails/${newImage.id}`
                    );
                    setUploadCount(2);
                    console.log(thumbnailUrl);
                } else {
                    setUploadCount(2);
                }
                const finalDate = dayjs(newImage.date);
                finalDate.set("hour", dayjs().hour());
                finalDate.set("minute", dayjs().minute());
                finalDate.set("second", dayjs().second());
                const toUpload: NoteImage = {
                    ...newImage,
                    date: finalDate.toDate(),
                    category: newImage.category || "unsorted",
                    url,
                    thumbnailUrl,
                };
                console.log({ toUpload });
                await axios.patch(`/api/image?id=${newImage.id}&auth=${user.token}`, toUpload);
                setUploadCount(3);

                await new Promise(resolve => setTimeout(resolve, 500));

                setPhase("done");
            } catch (e: any) {
                console.error(e);
                setError(e?.message || "unknown error");
                setPhase("form");
            }
        };

        doUpload();
    }, [newImage, user, file]);

    return (
        <Layout>
            {phase === "form" && (
                <PhotoForm
                    value={newImage}
                    onChange={val => setNewImage(cur => ({ ...cur, ...val }))}
                    onFileChange={data => {
                        console.log("Changed!");
                        setFile(data);
                    }}
                    onCancel={() => router.push(`/image/${image.id}`)}
                    onSubmit={upload}
                    error={error}
                    canChangeFile={true}
                    knownId={newImage.id}
                />
            )}
            {phase === "uploading" && (
                <div className="w-full py-48 grid place-items-center">
                    <div className="flex flex-col gap-8 items-center w-full">
                        <FaSync className="text-8xl animate-spin" />
                        <div className="text-4xl py-2 w-full grid place-items-center rounded border border-white relative">
                            <span className="relative z-10">Editing...</span>
                            <div
                                className="absolute z-0 left-0 top-0 h-full bg-primary-900"
                                style={{
                                    width: `${(100 * uploadCount) / 3}%`,
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
                        <p className="text-4xl py-2">Edit Complete</p>
                        <button
                            className="text-2xl bg-primary-800 rounded py-2 px-4"
                            onClick={() => router.push(`/image/${image.id}`)}
                        >
                            Return
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default EditPage;

export async function getServerSideProps(
    ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ image: NoteImage }>> {
    try {
        const result = await getImage(ctx.query.imageId as string);
        return {
            props: {
                image: result,
            },
        };
    } catch (error: any) {
        return {
            notFound: true,
        };
    }
}
