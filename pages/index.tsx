import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Layout from "components/layout/Layout";
import { NoteImage } from "lib/types";
import ImageTile from "components/ImageTile";
import useAuth from "lib/hooks/useAuth";

const PhotosPage = (): JSX.Element => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<NoteImage[]>([]);

    useEffect(() => {
        const doLoad = async () => {
            setLoading(true);
            const result = await axios("/api/images");
            if (!result?.data?.images) {
                setImages([]);
                setLoading(false);
                return;
            }
            const newImages = Object.keys(result.data.images)
                .map(k => result.data.images[k])
                .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
            //for(let i = 0; i < 30; i++) {
            //    newImages.push({...newImages[i % newImages.length], id: i});
            //}
            setImages(newImages);
            setLoading(false);
        };
        doLoad();
    }, []);

    const deleteImage = useCallback(
        (id: string) => {
            const doDelete = async () => {
                if (!user) return;
                await axios.delete(`/api/image?id=${id}&auth=${user.token}`);
            };
            if (!user) return;
            setImages(
                images.filter(i => i.id !== id).sort((a, b) => b.date.valueOf() - a.date.valueOf())
            );
            doDelete();
        },
        [user]
    );

    return (
        <Layout>
            {loading ? (
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">Loading...</p>
                </div>
            ) : images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {images.map(i => (
                        <ImageTile key={i.id} image={i} onDelete={deleteImage} />
                    ))}
                </div>
            ) : (
                <div className="h-48 grid place-items-center w-full">
                    <p className="text-4xl">No images yet!</p>
                </div>
            )}
        </Layout>
    );
};

export default PhotosPage;
