import { MessageSquareQuote, Star } from 'lucide-react';
import { useState } from 'react';
import type { ReviewDto } from '@/api';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { useMyReviewsQuery } from '@/features/review';
import { cn } from '@/lib/utils';

export function Reviews() {
  const [page, setPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);

  const { data, isLoading, isError } = useMyReviewsQuery({
    page,
    limit: 10,
    rating: selectedRating,
  });

  const reviews = data?.items ?? [];
  const summary = data?.summary;
  const meta = data?.meta;

  const avg = summary?.averageRating ?? 0;
  const total = summary?.totalReviews ?? 0;
  const distribution = summary?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Student Reviews</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Feedback and ratings from your completed sessions
          </p>
        </div>

        {selectedRating !== undefined && (
          <button
            type="button"
            onClick={() => {
              setSelectedRating(undefined);
              setPage(1);
            }}
            className="self-start sm:self-auto text-xs font-medium text-kala-terracotta hover:underline flex items-center gap-1"
          >
            Clear filter ({selectedRating} stars)
          </button>
        )}
      </div>

      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="text-center md:border-r md:border-stone-100 md:pr-8 shrink-0">
            <div className="text-5xl font-extrabold text-kala-brown">
              {avg > 0 ? avg.toFixed(1) : '—'}
            </div>
            <div className="flex gap-1 justify-center mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.round(avg)
                      ? 'text-kala-amber fill-kala-amber'
                      : 'text-stone-200 fill-stone-200'
                  }
                />
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2 font-medium">
              {total} review{total !== 1 ? 's' : ''} total
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star as keyof typeof distribution] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              const isSelected = selectedRating === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setSelectedRating(isSelected ? undefined : star);
                    setPage(1);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 group text-left px-2 py-1 rounded-lg transition-colors',
                    isSelected ? 'bg-amber-50' : 'hover:bg-stone-50',
                  )}
                >
                  <span className="text-xs font-semibold text-stone-600 w-3">{star}</span>
                  <Star size={12} className="text-kala-amber fill-kala-amber shrink-0" />
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-kala-amber rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-400 w-8 text-right font-medium">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-400">
          <Spinner className="h-8 w-8" />
          <p className="text-sm">Loading reviews…</p>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center text-sm text-red-500">
          Failed to load reviews. Please try again.
        </Card>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {reviews.map((review: ReviewDto) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {meta && meta.total > meta.limit && (
            <Card className="overflow-hidden">
              <Pagination
                page={meta.page}
                limit={meta.limit}
                total={meta.total}
                hasNextPage={meta.page < meta.totalPages}
                hasPrevPage={meta.page > 1}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </Card>
          )}
        </div>
      ) : (
        <Card className="text-center py-16 px-4">
          <MessageSquareQuote size={40} className="text-stone-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-stone-700">No reviews yet</p>
          <p className="text-sm text-stone-400 mt-1 max-w-sm mx-auto">
            {selectedRating !== undefined
              ? `No reviews found with ${selectedRating} star rating.`
              : 'Complete live sessions with students to start receiving ratings and feedback.'}
          </p>
        </Card>
      )}
    </div>
  );
}
