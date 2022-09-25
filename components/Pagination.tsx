import React, { useMemo } from "react";

const getPageNumbers = (currentPage: number, totalPages: number, maxPages: number) => {
    const halfPages = Math.floor(maxPages / 2);
    let start = currentPage - halfPages;
    let end = currentPage + halfPages;

    if (start < 1) {
        end += 1 - start;
        start = 1;
    }

    if (end > totalPages) {
        start -= end - totalPages;
        end = totalPages;
    }

    if (start < 1) {
        start = 1;
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (pages.slice(-1)[0] !== totalPages) {
        pages[pages.length - 2] = -1;
        pages[pages.length - 1] = totalPages;
    }
    if (pages[0] !== 1) {
        pages[0] = 1;
        pages[1] = -1;
    }

    return pages;
};

const Pagination = ({
    value,
    onChange,
    totalPages,
    maxPages = 1,
    render,
}: {
    value: number;
    onChange: (val: number) => void;
    totalPages: number;
    maxPages?: number;
    render?: (index: number, pageNumber: number, selected: boolean) => JSX.Element;
}): JSX.Element => {
    const pages = useMemo(
        () => getPageNumbers(value, totalPages, maxPages),
        [value, totalPages, maxPages]
    );

    return (
        <div className="flex justify-center items-center overflow-x-hidden">
            <p className="mr-4 text-lg">Page</p>
            <ul className="flex items-center gap-2 select-none">
                {pages.map((page, i) => {
                    if (page === -1) {
                        return (
                            <li key={i} className={""}>
                                <span>...</span>
                            </li>
                        );
                    }
                    return render ? (
                        render(i, page, page === value)
                    ) : (
                        <button
                            key={i}
                            className={`rounded py-1 px-2 ${
                                value === page
                                    ? "bg-neutral-700"
                                    : "bg-primary-800 h-8 hover:bg-primary-700"
                            }`}
                            disabled={value === page}
                            onClick={() => onChange(page)}
                        >
                            {page}
                        </button>
                    );
                })}
            </ul>
        </div>
    );
};

export default Pagination;
