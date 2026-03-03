import { mockReviews } from '../../lib/mock'
import { useInstructorStore } from '../../stores/instructorStore'
import { ReviewCard } from '../../components/shared/ReviewCard'
import { Star } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export function Reviews() {
  const { profile } = useInstructorStore()
  const reviews = mockReviews.filter((r) => r.instructorId === profile?.id)
  const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-kala-brown">Reviews</h1>

      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-kala-brown">{avg > 0 ? avg.toFixed(1) : '—'}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(avg) ? 'text-kala-amber fill-kala-amber' : 'text-stone-200 fill-stone-200'} />
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-stone-500 w-4">{star}</span>
                  <Star size={11} className="text-kala-amber fill-kala-amber shrink-0" />
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-kala-amber rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-stone-400 w-6">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <Star size={40} className="text-stone-200 mx-auto mb-3" />
          <p className="text-stone-500">No reviews yet. Complete sessions to receive reviews.</p>
        </div>
      )}
    </div>
  )
}
