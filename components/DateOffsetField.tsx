import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useCallback, useMemo } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

dayjs.extend(customParseFormat);

const DateOffsetField = ({
    className,
    label,
    value,
    onChange,
}: {
    className?: string;
    label: string;
    value: string;
    onChange?: (value: string) => void;
    type?: string;
}): JSX.Element => {
    const isValid = useMemo(() => {
        return dayjs(value, "DD/MM/YYYY").isValid();
    }, [value]);

    const decrement = useCallback(() => {
        if (!onChange) return;
        onChange(dayjs(value, "DD/MM/YYYY").subtract(1, "day").startOf("day").format("DD/MM/YYYY"));
    }, [value, onChange]);

    const increment = useCallback(() => {
        if (!onChange) return;
        onChange(dayjs(value, "DD/MM/YYYY").add(1, "day").startOf("day").format("DD/MM/YYYY"));
    }, [value, onChange]);

    return (
        <div className={`w-full flex flex-col ${className}`}>
            <label className="w-24 text-xs">{label}</label>
            <div className="flex flex-grow justify-between gap-1">
                <button
                    disabled={!isValid}
                    className={`${
                        isValid ? "bg-neutral-700 text-white" : "bg-neutral-800 text-neutral-600"
                    } rounded grid place-items-center w-6 h-8 text-xl`}
                    onClick={decrement}
                >
                    <div className="flex flex-col items-center">
                        <MdKeyboardArrowLeft />
                    </div>
                </button>
                <input
                    type="text"
                    className="flex-grow bg-neutral-700 rounded px-2 py-1"
                    value={value}
                    onChange={e => {
                        if (onChange) onChange(e.target.value);
                    }}
                />
                <button
                    disabled={!isValid}
                    className={`${
                        isValid ? "bg-neutral-700 text-white" : "bg-neutral-800 text-neutral-600"
                    } rounded grid place-items-center w-6 h-8 text-xl`}
                    onClick={increment}
                >
                    <div className="flex flex-col items-center">
                        <MdKeyboardArrowRight />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default DateOffsetField;
