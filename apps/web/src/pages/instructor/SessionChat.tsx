import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SessionChatPanel } from '@/features/chat';

export function InstructorSessionChat() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Session not found.</p>
        <Link to="/instructor/sessions">
          <Button variant="outline">Back to Sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="-m-6 h-[calc(100vh-3.5rem)]">
      <SessionChatPanel
        bookingId={id}
        role="INSTRUCTOR"
        backTo={`/instructor/sessions/${id}`}
      />
    </div>
  );
}
