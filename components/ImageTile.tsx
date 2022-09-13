import dayjs from "dayjs";
import { FaEllipsisV } from "react-icons/fa";
import { useRouter } from "next/router";
import { useState } from "react";
import { NoteImage } from "lib/types";
import useAuth from "lib/hooks/useAuth";

const ImageTile = ({
    image,
    onDelete,
}: {
    image: NoteImage;
    onDelete: (id: string) => void;
}): JSX.Element => {
    const { user } = useAuth();
    const router = useRouter();

    const [menu, setMenu] = useState(false);

    return (
        <div
            className="relative border border-white border-opacity-0 hover:border-opacity-100 select-none cursor-pointer"
            onClick={() => {
                if (!menu) router.push(`/image/${image.id}`);
            }}
        >
            <div
                style={{
                    paddingBottom: "100%",
                    backgroundImage: `url(${image.thumbnailUrl})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                }}
            />
            <div
                className="absolute z-0 left-0 top-0 w-full h-full flex flex-col justify-between text-center text-sm font-bold"
                style={{
                    background:
                        "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.7) 100%)",
                }}
            >
                <p>{dayjs(image.date).format("DD/MM/YYYY")}</p>
                <p>{image.category}</p>
            </div>
            {user && (
                <div
                    className={`absolute z-10 left-0 top-0 w-full h-full bg-black flex flex-col justify-between ${
                        menu ? "bg-opacity-80" : "bg-opacity-0"
                    }`}
                >
                    <div className="flex justify-end pt-2">
                        <FaEllipsisV
                            className="cursor-pointer hover:text-blue-500"
                            onClick={e => {
                                e.stopPropagation();
                                setMenu(cur => !cur);
                            }}
                        />
                    </div>
                    {menu ? (
                        <div className="flex flex-col gap-2 px-4 py-2">
                            <button
                                className="bg-blue-800 bg-opacity-70 font-bold py-0.5 rounded"
                                onClick={() => router.push(`/edit/${image.id}`)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-800 bg-opacity-70 font-bold py-0.5 rounded"
                                onClick={() => {
                                    if (!confirm("Are you sure you want to delete this image?"))
                                        return;
                                    onDelete(image.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageTile;
