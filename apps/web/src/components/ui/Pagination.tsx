import { Button } from './Button'

type PaginationProps = {
    page: number
    limit: number
    total: number
    hasNextPage: boolean
    hasPrevPage: boolean
    onPageChange: (page: number) => void
}

export function Pagination({ page, limit, total, hasNextPage, hasPrevPage, onPageChange, }: PaginationProps) {
    const totalPages = Math.max(Math.ceil(total / limit), 1)

    return (
        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4">
            <p className="text-sm text-stone-500">
                Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPage}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}