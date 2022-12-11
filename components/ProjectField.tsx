import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { Project } from "lib/types";
import Button from "./controls/Button";
import TextField from "./controls/TextField";
import DateOffsetField from "./DateOffsetField";

const ProjectField = ({
    value,
    onChange,
    onIsValidChange,
    onDeleteClicked,
}: {
    value: Project;
    onChange: (newVal: Project) => void;
    onIsValidChange: (val: boolean) => void;
    onDeleteClicked: () => void;
}): JSX.Element => {
    const [nameString, setNameString] = useState(value.name);
    const [dateString, setDateString] = useState(dayjs(value.date).format("DD/MM/YYYY"));

    useEffect(() => {
        if (value.name !== nameString) setNameString(value.name);
        if (value.date !== dayjs(dateString, "DD/MM/YYYY").toDate())
            setDateString(dayjs(value.date).format("DD/MM/YYYY"));
    }, [value]);

    useEffect(() => {
        if (nameString === value.name && dateString === dayjs(value.date).format("DD/MM/YYYY"))
            return;

        const isValid = dayjs(dateString, "DD/MM/YYYY").isValid();
        if (isValid) {
            onChange({
                ...value,
                name: nameString,
                date: dayjs(dateString, "DD/MM/YYYY").startOf("day").toDate(),
            });
        }
        onIsValidChange(isValid);
    }, [dateString, nameString]);

    return (
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <TextField
                label="Name"
                value={nameString}
                placeholder={"Unsorted"}
                onChange={setNameString}
            />
            <DateOffsetField label="Date" value={dateString} onChange={setDateString} />
            <Button
                className="bg-neutral-700 grid place-items-center md:mt-4 rounded px-3 py-1"
                onClick={onDeleteClicked}
            >
                X
            </Button>
        </div>
    );
};

export default ProjectField;
