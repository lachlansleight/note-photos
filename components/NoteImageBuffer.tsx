import { useCallback, useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import dayjs from "dayjs";
import axios from "axios";
import { NoteImage, Project } from "lib/types";
import useAuth from "lib/hooks/useAuth";
import ProjectField from "./ProjectField";
import Button from "./controls/Button";

const NoteImageBuffer = ({
    note,
    width,
    showEditor,
    align = "left",
    onEditSuccess,
}: {
    note: NoteImage;
    width: number;
    showEditor: boolean;
    align?: "left" | "right";
    onEditSuccess?: (newValue: NoteImage) => void;
}): JSX.Element => {
    const { user } = useAuth();
    const [menu, setMenu] = useState(false);
    const [value, setValue] = useState(note);
    const [isValid, setIsValid] = useState([true]);
    const isAllValid = () => isValid.reduce((a, b) => a && b, true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (note.id === value.id) return;
        setValue(note);
        setLoading(false);
    }, [note]);

    const applyChanges = useCallback(async () => {
        if (!isAllValid()) return;
        if (loading) return;
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.patch(
                `/api/image?id=${note.id}&auth=${user.token}`,
                value
            );
            console.log(response);
            if (onEditSuccess) onEditSuccess(value);
        } catch (error: any) {
            console.error(error);
        }
        setLoading(false);
    }, [loading, value, user, onEditSuccess]);

    return (
        <>
            <div>
                <div
                    className={`relative flex ${
                        align === "right" ? "justify-end" : "justify-start"
                    }`}
                    style={
                        {
                            // marginBottom: `calc(1.75rem + ${3 * value.projects.length}rem + 2rem + 0.5rem)`
                        }
                    }
                >
                    <img
                        src={note.url}
                        width={width}
                        height={Math.round(width * (note.height / note.width))}
                    />
                    {user && showEditor && (
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
                                <div className="flex justify-between items-center px-2">
                                    <div className="w-12" />
                                    <p
                                        style={{
                                            textShadow: "1px 1px 2px #000",
                                        }}
                                    >
                                        {dayjs(note.projects[0].date).format("DD MMMM YYYY")}
                                    </p>
                                    {user ? (
                                        <Button
                                            className={`${
                                                isAllValid() && !loading
                                                    ? "bg-primary-700"
                                                    : "bg-gray-500"
                                            } text-sm px-2 py-1 rounded`}
                                            onClick={() => applyChanges()}
                                            disabled={!isAllValid() || loading}
                                        >
                                            {loading ? "Loading" : "Apply"}
                                        </Button>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {user && showEditor && (
                    <div className="">
                        <div className="flex flex-col gap-2">
                            {value.projects &&
                                value.projects.map((p, i) => (
                                    <div key={i} className="flex gap-4">
                                        <ProjectField
                                            value={p}
                                            onChange={newProject => {
                                                setValue({
                                                    ...value,
                                                    projects: value.projects.map((q, j) =>
                                                        i === j ? newProject : q
                                                    ),
                                                });
                                            }}
                                            onIsValidChange={isValid => {
                                                setIsValid(cur =>
                                                    cur.map((v, j) => (i === j ? isValid : v))
                                                );
                                            }}
                                            onDeleteClicked={() => {
                                                const newProjects: Project[] = [];
                                                const newIsValid: boolean[] = [];
                                                for (let j = 0; j < value.projects.length; j++) {
                                                    if (j !== i)
                                                        newProjects.push(value.projects[j]);
                                                    if (j !== i) newIsValid.push(isValid[j]);
                                                }
                                                setValue({
                                                    ...value,
                                                    projects: newProjects,
                                                });
                                                setIsValid(newIsValid);
                                            }}
                                        />
                                    </div>
                                ))}
                            <Button
                                className="bg-neutral-600 rounded px-2 py-1 w-48"
                                onClick={() => {
                                    setValue({
                                        ...value,
                                        projects: [
                                            ...value.projects,
                                            {
                                                name: "",
                                                date:
                                                    value.projects.length > 0
                                                        ? value.projects.slice(-1)[0].date
                                                        : new Date(),
                                            },
                                        ],
                                    });
                                    setIsValid(cur => [...cur, true]);
                                }}
                            >
                                Add Project
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NoteImageBuffer;
