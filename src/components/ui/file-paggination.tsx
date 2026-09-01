// Pagination.tsx
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const FilePagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];

        const add = (value: number | "...") => {
            if (!pages.includes(value)) {
                pages.push(value);
            }
        };

        // Always show first page
        add(1);

        // Left ellipsis
        if (currentPage > 3) add("...");

        // Current -1
        if (currentPage > 2) add(currentPage - 1);

        // Current
        if (currentPage > 1 && currentPage < totalPages) add(currentPage);

        // Current +1
        if (currentPage < totalPages - 1) add(currentPage + 1);

        // Right ellipsis
        if (currentPage < totalPages - 2) add("...");

        // Last page
        add(totalPages);

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-4">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </Button>

            <div className="flex gap-1">
                {pages.map((page, i) =>
                    page === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-gray-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={`page-${page}`}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </Button>
                    )
                )}

            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </Button>
        </div>
    );
};
