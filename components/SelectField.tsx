const SelectField = ({
    value,
    onChange,
    options,
    label,
    error,
    disabled,
}: {
    value: number;
    onChange: (val: number) => void;
    options: { value: number; label: string }[];
    label?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}): JSX.Element => {
    return (
        <div className="flex flex-col">
            <label className="text-white text-opacity-50 text-xs">{label || " "}</label>
            <select
                value={value}
                disabled={disabled}
                className="bg-neutral-800 text-white px-2 py-1 rounded"
                onChange={e => onChange(Number(e.target.value))}
            >
                {options.map((option, index) => (
                    <option value={option.value} key={"select_" + index + "_" + option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error ? (
                <p className="text-red-500 text-opacity-50 text-xs">{error}</p>
            ) : (
                <div className="h-4" />
            )}
        </div>
    );
};

export default SelectField;
