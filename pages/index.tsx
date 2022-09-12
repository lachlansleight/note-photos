import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Link from "next/link";
import Layout from "components/layout/Layout";
import { NoteImage } from "lib/types";

const PhotosPage = (): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<NoteImage[]>([]);

    useEffect(() => {
        const doLoad = async () => {
            setLoading(true);
            const result = await axios("/api/images");
            const newImages = Object.keys(result.data.images).map(k => result.data.images[k]);
            //for(let i = 0; i < 30; i++) {
            //    newImages.push({...newImages[i % newImages.length], id: i});
            //}
            setImages(newImages);
            setLoading(false);
        };
        doLoad();
    }, []);

    return (
        <Layout>
            {loading ? (
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">Loading...</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {images.map(i => {
                        return (
                            <Link key={i.id} href={`/image/${i.id}`}>
                                <a className="relative border border-white border-opacity-0 hover:border-opacity-100">
                                    <div
                                        style={{
                                            paddingBottom: "100%",
                                            backgroundImage: `url(${i.thumbnailUrl})`,
                                            backgroundSize: "contain",
                                            backgroundPosition: "center center",
                                            backgroundRepeat: "no-repeat",
                                        }}
                                    />
                                    {/* <img className="w-full h-full object-fit" src={i.thumbnailUrl} alt={i.category} /> */}
                                    <div
                                        className="absolute left-0 top-0 w-full h-full flex flex-col justify-between text-center"
                                        style={{
                                            background:
                                                "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.7) 100%)",
                                        }}
                                    >
                                        <p>{dayjs(i.date).format("DD/MM/YYYY")}</p>
                                        <p>{i.category}</p>
                                    </div>
                                </a>
                            </Link>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
};

export default PhotosPage;
