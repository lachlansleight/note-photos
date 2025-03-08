import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Layout from "components/layout/Layout";
import { LlmTranscription, NoteImage } from "lib/types";
import useAuth from "lib/hooks/useAuth";
import ProgressBar from "components/controls/ProgressBar";
import Button from "components/controls/Button";

const PhotosPage = (): JSX.Element => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<NoteImage[]>([]);
    const [loadingTranscription, setLoadingTranscription] = useState(false);
    const [currentNote, setCurrentNote] = useState<NoteImage | null>(null);
    const [currentMessage, setCurrentMessage] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const doLoad = async () => {
            setLoading(true);
            const result = await axios("/api/images");
            if (!result?.data?.images) {
                setImages([]);
                setLoading(false);
                return;
            }
            console.log(result.data);
            const newImages: NoteImage[] = Object.keys(result.data.images)
                .map(k => result.data.images[k])
                .sort(
                    (a, b) =>
                        new Date(a.projects[0].date).valueOf() -
                        new Date(b.projects[0].date).valueOf()
                );
            //for(let i = 0; i < 30; i++) {
            //    newImages.push({...newImages[i % newImages.length], id: i});
            //}
            const filteredImages = newImages.filter(i => !i.transcription?.tagline?.trim()?.length);
            console.log({ filteredImages });
            setImages(filteredImages);
            console.log(
                `${filteredImages.length} / ${newImages.length} images need transcriptions`
            );
            setLoading(false);
        };
        doLoad();
    }, []);

    const getTranscription = useCallback(
        async (note: NoteImage, force = false) => {
            if (!user) return;

            let transcription: LlmTranscription | null = null;
            const startingTranscription = note.transcription?.rawText;

            try {
                //doesn't return the result, we need to poll
                const message = `Transcribing note from ${dayjs(note.projects[0].date).format(
                    "DD MMMM YYYY"
                )} (${note.projects.map(p => p.name).join(", ")})`;
                setCurrentMessage(message);
                await axios.get(`/api/transcribe?force=${force}&id=${note.id}&auth=${user.token}`);
                let attempt = 0;
                while (attempt < 30) {
                    const testResponse = await axios("/api/image?id=" + note.id);
                    const hasTranscription =
                        testResponse.data.transcription?.tagline?.trim()?.length;
                    if (
                        hasTranscription &&
                        (testResponse.data.transcription.rawText !== startingTranscription ||
                            !force)
                    ) {
                        transcription = testResponse.data.transcription;
                        break;
                    }
                    await new Promise(r => setTimeout(r, 2000));
                    attempt++;
                    setCurrentMessage(
                        `${message} - waiting for brain response (${
                            2 * (30 - attempt)
                        }sec to timeout)`
                    );
                }
                if (transcription) {
                    setCurrentMessage("Transcription complete for note " + transcription.tagline);
                    console.log("Transcription Result!", transcription);
                    await new Promise(r => setTimeout(r, 1000));
                } else {
                    console.error("Failed to get transcription after " + attempt + " attempts");
                }
            } catch (error: any) {
                console.error(error);
                setLoadingTranscription(false);
            }
        },
        [loadingTranscription, user]
    );

    const getAllTranscriptions = async () => {
        if (!user) {
            alert("No user");
            return;
        }
        setLoadingTranscription(true);
        for (let i = 0; i < images.length; i++) {
            setCurrentIndex(i);
            setCurrentNote(images[i]);
            await getTranscription(images[i]);
        }
        setLoadingTranscription(false);
    };

    if (loading) {
        return (
            <Layout>
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">Loading...</p>
                </div>
            </Layout>
        );
    }

    if (images.length === 0) {
        return (
            <Layout>
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">No images yet!</p>
                </div>
            </Layout>
        );
    }

    if (!user?.token) {
        return (
            <Layout>
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">You must be logged in to transcribe</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col">
                <h1 className="text-[35px] w-full text-center">The Great Transcriptioning</h1>
                <ProgressBar
                    className="w-full grid place-items-center border border-white border-opacity-20 rounded-[10px] py-[8px]"
                    innerClassName="bg-blue-500 rounded-[10px]"
                    progress={currentIndex / images.length}
                >
                    <div className="flex flex-col items-center">
                        <p className="m-0 text-[25px]">
                            {loadingTranscription
                                ? `${currentIndex + 1} / ${images.length}`
                                : "READY"}
                        </p>
                        <p className="m-0 text-[12px]">
                            {loadingTranscription
                                ? currentMessage || "Initializing"
                                : `${images.length} note pages to be transcribed`}
                        </p>
                    </div>
                </ProgressBar>
                {loadingTranscription ? (
                    <Button
                        className="text-[20px] px-8 py-4 bg-red-700 hover:bg-red-500 transition-all duration 300 w-[200px] mx-auto rounded-[10px] mt-[20px]"
                        onClick={() => {
                            document.location.reload();
                        }}
                    >
                        STOOOPPPP
                    </Button>
                ) : (
                    <Button
                        className="text-[20px] px-8 py-4 bg-cyan-700 hover:bg-cyan-500 transition-all duration 300 w-[200px] mx-auto rounded-[10px] mt-[20px]"
                        onClick={() => {
                            getAllTranscriptions();
                        }}
                    >
                        PUNCH IT
                    </Button>
                )}
                {loadingTranscription && currentNote && (
                    <img
                        src={currentNote.url}
                        width={1000}
                        height={Math.round(1000 * (currentNote.height / currentNote.width))}
                    />
                )}
            </div>
        </Layout>
    );
};

export default PhotosPage;
