import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { NoteImage } from "lib/types";
import useAuth from "lib/hooks/useAuth";

const NoteImageBuffer = ({ note, width }: { note: NoteImage; width: number }): JSX.Element => {
    const { user } = useAuth();
    const [menu, setMenu] = useState(false);

    return (
        <div className="relative">
            <img
                src={note.url}
                width={width}
                height={Math.round(width * (note.height / note.width))}
            />
            {user && (
                <div
                    className={`absolute z-20 left-0 top-0 w-full h-full bg-black flex flex-col justify-between ${
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
};

export default NoteImageBuffer;
