import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

const CalendarView = ({
    year,
    values = [],
    onDayClick,
}: {
    year: number;
    values?: {
        date: Date;
    }[];
    onDayClick?: (day: Date) => void;
}): JSX.Element => {
    const maxDay = useMemo(() => {
        return dayjs().year(year).endOf("year").endOf("week");
    }, [year]);
    const minDay = useMemo(() => {
        return dayjs().year(year).startOf("year").startOf("week");
    }, [year]);
    const dayCount = useMemo(() => {
        return maxDay.diff(minDay, "days") + 1;
    }, [minDay, maxDay]);

    const getMonthOffset = useCallback(
        (month: number) => {
            let md = dayjs(minDay);
            for (let i = 0; i < 54; i++) {
                md = md.add(1, "week");
                if (md.month() === month) return i;
            }
            return 0;
        },
        [minDay]
    );

    return (
        // <div className="grid grid-cols-4">
        //     {Array.from({length: 12}).map((_, i) => {
        //         const month = dayjs(minDay).add(i, "month");
        //         const daysInMonth = month.daysInMonth();
        //         const firstDayOfMonth = month.startOf("month").startOf("day");
        //         const lastDayOfMonth = month.endOf("month").startOf("day");
        //         const firstDayOfGrid = firstDayOfMonth.startOf("week");
        //         const lastDayOfGrid = lastDayOfMonth.endOf("week");
        //         const daysInGrid = lastDayOfGrid.diff(firstDayOfGrid, "day") + 1;
        //         return (
        //             <div key={i} className="grid grid-cols-7">
        //                 {Array.from({length: daysInGrid}).map((_, j) => {
        //                     const day = dayjs(firstDayOfGrid).add(j, "day");
        //                     const isCurrentMonth = day.isAfter(firstDayOfMonth.subtract(1, "day")) && day.isBefore(lastDayOfMonth.add(1, "day"));
        //                     return (
        //                         <div key={j} className="flex justify-center items-center">
        //                             <div className="w-8 h-8 flex justify-center items-center">
        //                                 {isCurrentMonth ? day.format("D") : ""}
        //                             </div>
        //                         </div>
        //                     )
        //                 })}
        //             </div>
        //         )
        //     })}
        // </div>
        <div className="my-4 mx-auto">
            <h3 className="ml-3.5 my-0">{year}</h3>
            <div className="flex gap-1">
                <div className="text-xs text-neutral-400 text-center flex flex-col gap-0.5 pt-3.5">
                    <span className="h-3">M</span>
                    <span className="h-3">T</span>
                    <span className="h-3">W</span>
                    <span className="h-3">T</span>
                    <span className="h-3">F</span>
                    <span className="h-3">S</span>
                    <span className="h-3">S</span>
                </div>
                <div>
                    <div className="text-xs relative h-4 text-neutral-400">
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    0
                                )} + 0.125rem * ${getMonthOffset(0) - 1})`,
                            }}
                        >
                            Jan
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    1
                                )} + 0.125rem * ${getMonthOffset(1) - 1})`,
                            }}
                        >
                            Feb
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    2
                                )} + 0.125rem * ${getMonthOffset(2) - 1})`,
                            }}
                        >
                            Mar
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    3
                                )} + 0.125rem * ${getMonthOffset(3) - 1})`,
                            }}
                        >
                            Apr
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    4
                                )} + 0.125rem * ${getMonthOffset(4) - 1})`,
                            }}
                        >
                            May
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    5
                                )} + 0.125rem * ${getMonthOffset(5) - 1})`,
                            }}
                        >
                            Jun
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    6
                                )} + 0.125rem * ${getMonthOffset(6) - 1})`,
                            }}
                        >
                            Jul
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    7
                                )} + 0.125rem * ${getMonthOffset(7) - 1})`,
                            }}
                        >
                            Aug
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    8
                                )} + 0.125rem * ${getMonthOffset(8) - 1})`,
                            }}
                        >
                            Sep
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    9
                                )} + 0.125rem * ${getMonthOffset(9) - 1})`,
                            }}
                        >
                            Oct
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    10
                                )} + 0.125rem * ${getMonthOffset(10) - 1})`,
                            }}
                        >
                            Nov
                        </span>
                        <span
                            className="absolute"
                            style={{
                                left: `calc(0.175rem + 0.75rem * ${getMonthOffset(
                                    11
                                )} + 0.125rem * ${getMonthOffset(11) - 1})`,
                            }}
                        >
                            Dec
                        </span>
                    </div>
                    <div
                        className="flex flex-col flex-wrap gap-0.5"
                        style={{
                            height: "calc(0.75rem * 7 + 0.125rem * 6)",
                            width: "calc(0.75rem * 53 + 0.125rem * 52)",
                        }}
                    >
                        {Array.from({ length: dayCount }).map((_, i) => {
                            const day = dayjs(minDay).add(i, "day");
                            const dateValues = values.filter(v => dayjs(v.date).isSame(day, "day"));
                            const tier =
                                dateValues.length < 3
                                    ? 0
                                    : dateValues.length > 4
                                    ? 3
                                    : dateValues.length === 3
                                    ? 1
                                    : 2;
                            const opacity = tier === 0 ? dateValues.length / 3 : 1;
                            return (
                                <div
                                    key={i}
                                    className={`w-3 h-3 bg-neutral-800 border-white border-opacity-40 ${
                                        dateValues.length > 0
                                            ? "cursor-pointer hover:bg-neutral-700 hover:border"
                                            : ""
                                    }`}
                                    title={`${day.format("DD MMMM YY")}${
                                        dateValues.length > 0 ? ` - ${dateValues.length} pages` : ""
                                    }`}
                                    onClick={() => {
                                        if (onDayClick && dateValues.length > 0)
                                            onDayClick(day.toDate());
                                    }}
                                >
                                    <div
                                        className={`w-full h-full ${
                                            tier === 0
                                                ? "bg-indigo-600"
                                                : tier === 1
                                                ? "bg-violet-500"
                                                : tier === 2
                                                ? "bg-pink-400"
                                                : "bg-pink-500"
                                        }`}
                                        style={{
                                            opacity: opacity,
                                        }}
                                    />
                                    {/* {day.format("D/MM")} */}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
