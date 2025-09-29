'use client';

interface PaginationProps {
    currentPageIndex: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
    onPageSizeChange: (pageSize: number) => void;
    onPageIndexChange: (pageIndex: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    onFirstPage: () => void;
    onLastPage: () => void;
    pageSizeOptions: number[];
    isGrid?: boolean;
}

export default function Pagination({
    currentPageIndex,
    pageSize,
    totalRows,
    totalPages,
    canPreviousPage,
    canNextPage,
    onPageSizeChange,
    onPageIndexChange,
    onPreviousPage,
    onNextPage,
    onFirstPage,
    onLastPage,
    pageSizeOptions,
    isGrid = false,
}: PaginationProps) {
    return (
        <div className="flex flex-col gap-4 bg-neutral-900 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
                <div className="hidden text-sm text-white md:block">
                    Showing {Math.min(pageSize, totalRows)} of {totalRows} rows
                </div>

                <div className="hidden flex-row items-center gap-1 md:flex">
                    <header className="">
                        {isGrid ? 'Cards per page:' : 'Rows per page:'}
                    </header>
                    <select
                        value={pageSize}
                        onChange={(e) =>
                            onPageSizeChange(parseInt(e.target.value))
                        }
                        className="rounded-md bg-neutral-800/60 px-4 py-2 text-sm text-white"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-row items-center gap-5">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1">
                            Page:
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={currentPageIndex + 1}
                                onChange={(e) => {
                                    const page = e.target.value
                                        ? Number(e.target.value) - 1
                                        : 0;
                                    onPageIndexChange(page);
                                }}
                                className="rounded-md bg-neutral-800/60 py-2 pl-3 text-center text-sm text-white"
                            />
                        </div>
                        <span className="flex items-center gap-1">
                            of {totalPages}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className=""
                            onClick={onFirstPage}
                            disabled={!canPreviousPage}
                        >
                            {'<<'}
                        </button>
                        <button
                            className=""
                            onClick={onPreviousPage}
                            disabled={!canPreviousPage}
                        >
                            {'<'}
                        </button>
                        <button
                            className=""
                            onClick={onNextPage}
                            disabled={!canNextPage}
                        >
                            {'>'}
                        </button>
                        <button
                            className=""
                            onClick={onLastPage}
                            disabled={!canNextPage}
                        >
                            {'>>'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
