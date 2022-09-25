import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "components/layout/Layout";
import { NoteImage } from "lib/types";
import ImageTile from "components/ImageTile";
import useAuth from "lib/hooks/useAuth";
import Pagination from "components/Pagination";
import SelectField from "components/SelectField";
import NoteImageLoader from "components/NoteImageLoader";
import useDimensions from "lib/hooks/useDimensions";

const PhotosPage = (): JSX.Element => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<NoteImage[]>([]);
    const [filteredImages, setFilteredImages] = useState<NoteImage[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState("");
    const [showingGrid, setShowingGrid] = useState(false);
    const { width } = useDimensions();
    const [page, setPage] = useState(0);

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
            setCategories(
                newImages.reduce((acc, image) => {
                    if (acc.indexOf(image.category) === -1) {
                        acc.push(image.category);
                    }
                    return acc;
                }, [])
            );
            setImages(newImages);
            setPage(Math.ceil(newImages.length / 2));
            setLoading(false);
        };
        doLoad();
    }, []);

    useEffect(() => {
        const newFilteredImages = images.filter(
            image => filterCategory === "" || image.category === filterCategory
        );
        setFilteredImages(newFilteredImages);
        setPage(Math.ceil(newFilteredImages.length / 2));
    }, [images, filterCategory]);

    const deleteImage = useCallback(
        (id: string) => {
            const doDelete = async () => {
                if (!user) return;
                await axios.delete(`/api/image?id=${id}&auth=${user.token}`);
            };
            if (!user) return;
            setImages(
                images
                    .filter(i => i.id !== id)
                    .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
            );
            doDelete();
        },
        [user]
    );

    const categorySelectOptions = useMemo(() => {
        const options: { value: number; label: string }[] = [];
        options.push({ value: -1, label: `All (${images.length} notes)` });
        categories
            .sort(
                (a, b) =>
                    images.filter(image => image.category === b).length -
                    images.filter(image => image.category === a).length
            )
            .forEach((category, i) => {
                options.push({
                    value: i,
                    label: `${category} (${
                        images.filter(image => image.category === category).length
                    } notes)`,
                });
            });
        return options;
    }, [images, categories]);

    console.log(width);

    return (
        <Layout>
            {loading ? (
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">Loading...</p>
                </div>
            ) : filteredImages.length > 0 ? (
                <div>
                    <SelectField
                        label="Category"
                        value={categories.indexOf(filterCategory)}
                        options={categorySelectOptions}
                        onChange={val => setFilterCategory(val === -1 ? "" : categories[val])}
                    />
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        <NoteImageLoader note={filteredImages[page * 2 - 2]} width={500} />
                        {filteredImages.length > page * 2 - 1 ? (
                            <NoteImageLoader note={filteredImages[page * 2 - 1]} width={500} />
                        ) : (
                            <div />
                        )}
                    </div>
                    <Pagination
                        value={page}
                        onChange={val => setPage(val)}
                        totalPages={Math.ceil(filteredImages.length / 2)}
                        maxPages={width < 600 ? 7 : Math.floor(7 + (width - 650) / 150)}
                        render={
                            width > 650
                                ? (index, pageNumber, selected) => (
                                      <div
                                          key={`page-${index}`}
                                          className={`grid place-items-center relative cursor-pointer rounded ${
                                              selected
                                                  ? "border-2 border-primary-500"
                                                  : "cursor-pointer"
                                          }`}
                                          onClick={() => setPage(pageNumber)}
                                          style={{
                                              width: "5rem",
                                              height: "6.6666rem",
                                          }}
                                      >
                                          <img
                                              src={filteredImages[pageNumber * 2 - 2].thumbnailUrl}
                                              width={100}
                                              height={133}
                                              className="absolute left-0 top-0 z-0 w-full h-full"
                                          />
                                          <p className="absolute left-0 top-0 grid place-items-center w-full h-full text-sm font-bold z-10">
                                              <span className="bg-neutral-800 bg-opacity-30 rounded py-1">
                                                  {pageNumber * 2 - 1} - {pageNumber * 2}
                                              </span>
                                          </p>
                                      </div>
                                  )
                                : undefined
                        }
                    />
                    {/* <NoteFixup notes={images} /> */}
                    <p className="mt-8 text-xl mb-2">
                        Grid{" "}
                        <span
                            onClick={() => setShowingGrid(cur => !cur)}
                            className="bg-primary-800 rounded px-2 py-1"
                        >
                            {showingGrid ? "-" : "+"}
                        </span>
                    </p>
                    {showingGrid && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {images.map(i => (
                                <ImageTile key={i.id} image={i} onDelete={deleteImage} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                //     {images.map(i => (
                //         <ImageTile key={i.id} image={i} onDelete={deleteImage} />
                //     ))}

                // </div>
                <div className="h-48 grid place-items-center w-full">
                    <p className="text-4xl">No images yet!</p>
                </div>
            )}
        </Layout>
    );
};

export default PhotosPage;
