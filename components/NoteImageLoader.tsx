import { useEffect, useState } from "react";
import { FaEllipsisV, FaSync } from "react-icons/fa";
import { NoteImage } from "lib/types";
import useAuth from "lib/hooks/useAuth";

const NoteImageLoader = ({ note, width }: { note: NoteImage; width: number }): JSX.Element => {
    const { user } = useAuth();

    const [menu, setMenu] = useState(false);

    const [phase, setPhase] = useState<"none" | "thumbnail" | "full">("none");
    useEffect(() => {
        setPhase("none");
    }, [note]);

    if (phase === "none") {
        return (
            <div>
                <div className="grid place-items-center relative" style={{ aspectRatio: "3 / 4" }}>
                    <FaSync className="text-4xl animate-spin text-white" />
                    <img
                        src={note.url}
                        width={width}
                        height={Math.round(width * (note.height / note.width))}
                        className="absolute left-0 top-0 hidden"
                        onLoad={() => setPhase("full")}
                    />
                </div>
            </div>
        );
    } else {
        return (
            <div className="relative">
                <img
                    src={note.url}
                    width={width}
                    height={Math.round(width * (note.height / note.width))}
                />
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
                                <a
                                    href={`/edit/${note.id}`}
                                    className="bg-blue-800 bg-opacity-70 font-bold py-0.5 rounded grid place-items-center"
                                >
                                    Edit
                                </a>
                            </div>
                        ) : (
                            <div />
                        )}
                    </div>
                )}
            </div>
        );
    }
};

export default NoteImageLoader;
