import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SessionChatPanel } from '@/features/chat';

export function BookingChat() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Booking not found.</p>
        <Link to="/dashboard/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="-m-6 h-[calc(100vh-3.5rem)]">
      <SessionChatPanel
        bookingId={id}
        role="STUDENT"
        backTo={`/dashboard/bookings/${id}`}
      />
    </div>
  );
}
