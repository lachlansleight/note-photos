import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Head from "next/head";
import Layout from "components/layout/Layout";
import { ImageHasCategory, NoteImage } from "lib/types";
// import ImageTile from "components/ImageTile";
// import useAuth from "lib/hooks/useAuth";
import Pagination from "components/Pagination";
import SelectField from "components/SelectField";
import useDimensions from "lib/hooks/useDimensions";
import CalendarView from "components/CalendarView";
import NoteImageBuffer from "components/NoteImageBuffer";

const PhotosPage = (): JSX.Element => {
    // const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<NoteImage[]>([]);
    const [filteredImages, setFilteredImages] = useState<NoteImage[]>([]);
    const [filterCategory, setFilterCategory] = useState("");
    // const [showingGrid, setShowingGrid] = useState(false);
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
            console.log({ newImages });
            setImages(newImages);
            setPage(Math.ceil(newImages.length / 2));
            setLoading(false);
        };
        doLoad();
    }, []);

    const categories = useMemo(() => {
        return images.reduce((acc: string[], image) => {
            for (let i = 0; i < image.projects.length; i++) {
                if (acc.indexOf(image.projects[i].name) === -1) {
                    acc.push(image.projects[i].name);
                }
            }
            return acc;
        }, []);
    }, [images]);

    useEffect(() => {
        const newFilteredImages = images.filter(
            image => filterCategory === "" || ImageHasCategory(image, filterCategory)
        );
        setFilteredImages(cur => {
            if (cur.length !== newFilteredImages.length) {
                setPage(Math.ceil(newFilteredImages.length / 2));
            }
            return newFilteredImages;
        });
    }, [images, filterCategory]);

    // const deleteImage = useCallback(
    //     (id: string) => {
    //         const doDelete = async () => {
    //             if (!user) return;
    //             await axios.delete(`/api/image?id=${id}&auth=${user.token}`);
    //         };
    //         if (!user) return;
    //         setImages(
    //             images
    //                 .filter(i => i.id !== id)
    //                 .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
    //         );
    //         doDelete();
    //     },
    //     [user]
    // );

    const categorySelectOptions = useMemo(() => {
        const options: { value: number; label: string }[] = [];
        options.push({ value: -1, label: `All (${images.length} notes)` });
        categories
            .sort(
                (a, b) =>
                    images.filter(image => ImageHasCategory(image, b)).length -
                    images.filter(image => ImageHasCategory(image, a)).length
            )
            .forEach((category, i) => {
                options.push({
                    value: i,
                    label: `${category} (${
                        images.filter(image => ImageHasCategory(image, category)).length
                    } notes)`,
                });
            });
        return options;
    }, [images, categories]);

    const goToPageOf = useCallback(
        (date: Date) => {
            const d = dayjs(date);
            let targetPage = -1;
            for (let i = 0; i < filteredImages.length; i += 2) {
                for (let j = 0; j < filteredImages[i].projects.length; j++) {
                    if (dayjs(filteredImages[i].projects[j].date).isSame(d, "day")) {
                        targetPage = Math.ceil(i / 2);
                        break;
                    }
                    if (targetPage >= 0) break;
                }
                if (i >= filteredImages.length - 1) continue;
                for (let j = 0; j < filteredImages[i + 1].projects.length; j++) {
                    if (dayjs(filteredImages[i + 1].projects[j].date).isSame(d, "day")) {
                        targetPage = Math.ceil((i + 1) / 2);
                        break;
                    }
                    if (targetPage >= 0) break;
                }
            }
            setPage(targetPage);
        },
        [filteredImages]
    );

    const allDates = useMemo(() => {
        const dates: { date: Date }[] = [];
        filteredImages.forEach(image => {
            image.projects.forEach(project => {
                dates.push({ date: project.date });
            });
        });
        return dates;
    }, [filteredImages]);

    return (
        <Layout>
            {loading ? (
                <div className="grid place-items-center h-48">
                    <p className="text-4xl">Loading...</p>
                </div>
            ) : filteredImages.length > 0 ? (
                <div>
                    <Head>
                        {(page - 1) * 2 - 2 > 0 && (
                            <link
                                rel="preload"
                                as="image"
                                href={filteredImages[(page - 1) * 2 - 2].url}
                            />
                        )}
                        {(page - 1) * 2 - 1 > 0 && (
                            <link
                                rel="preload"
                                as="image"
                                href={filteredImages[(page - 1) * 2 - 1].url}
                            />
                        )}
                        {filteredImages.length > (page + 1) * 2 - 2 && (
                            <link
                                rel="preload"
                                as="image"
                                href={filteredImages[(page + 1) * 2 - 2].url}
                            />
                        )}
                        {filteredImages.length > (page + 1) * 2 - 1 && (
                            <link
                                rel="preload"
                                as="image"
                                href={filteredImages[(page + 1) * 2 - 1].url}
                            />
                        )}
                    </Head>
                    <SelectField
                        label="Category"
                        value={categories.indexOf(filterCategory)}
                        options={categorySelectOptions}
                        onChange={val => setFilterCategory(val === -1 ? "" : categories[val])}
                    />
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        <NoteImageBuffer
                            note={filteredImages[page * 2 - 2]}
                            width={500}
                            onEditSuccess={v => {
                                setImages(cur => cur.map(i => (i.id === v.id ? v : i)));
                                setFilteredImages(cur => cur.map(i => (i.id === v.id ? v : i)));
                            }}
                        />
                        {filteredImages.length > page * 2 - 1 ? (
                            <NoteImageBuffer
                                note={filteredImages[page * 2 - 1]}
                                width={500}
                                onEditSuccess={v => {
                                    setImages(cur => cur.map(i => (i.id === v.id ? v : i)));
                                    setFilteredImages(cur => cur.map(i => (i.id === v.id ? v : i)));
                                }}
                            />
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

                    <div className="flex-col justify-center hidden md:flex">
                        <CalendarView year={2022} values={allDates} onDayClick={goToPageOf} />
                        <CalendarView year={2021} values={allDates} onDayClick={goToPageOf} />
                        <CalendarView year={2020} values={allDates} onDayClick={goToPageOf} />
                        <CalendarView year={2019} values={allDates} onDayClick={goToPageOf} />
                    </div>

                    {/* <NoteFixup notes={images} /> */}
                    {/* <p className="mt-8 text-xl mb-2">
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
                    )} */}
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
