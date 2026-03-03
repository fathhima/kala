import { Navigate, Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, ExternalLink, MapPin, XCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatPrice } from '../../lib/utils'
import { useAdminStore } from '../../stores/adminStore'

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>()
  const { applications, approvedApplicationIds, rejectedApplicationIds, approveApplication, rejectApplication } = useAdminStore()
  const application = applications.find((item) => item.id === id)

  if (!application) {
    return <Navigate to="/admin/applications" replace />
  }

  const reviewStatus = approvedApplicationIds.includes(application.id)
    ? 'APPROVED'
    : rejectedApplicationIds.includes(application.id)
      ? 'REJECTED'
      : 'PENDING'

  const images = application.portfolioItems.filter((item) => item.type !== 'video')
  const videos = application.portfolioItems.filter((item) => item.type === 'video')

  return (
    <div className="space-y-6">
      <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft size={15} /> Back to applications
      </Link>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={application.user.name} src={application.user.avatarUrl} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-kala-brown">{application.user.name}</h1>
              <p className="text-sm text-stone-500">{application.user.email}</p>
              <div className="mt-2">
                <Badge variant={reviewStatus === 'APPROVED' ? 'success' : reviewStatus === 'REJECTED' ? 'error' : 'warning'}>
                  {reviewStatus}
                </Badge>
              </div>
              {application.location && (
                <p className="text-xs text-stone-400 mt-1 inline-flex items-center gap-1">
                  <MapPin size={12} /> {application.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => approveApplication(application.id)}
              disabled={reviewStatus === 'APPROVED'}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={15} /> {reviewStatus === 'APPROVED' ? 'Approved' : 'Approve'}
            </Button>
            <Button
              onClick={() => rejectApplication(application.id)}
              disabled={reviewStatus === 'REJECTED'}
              variant="destructive"
              className="gap-2"
            >
              <XCircle size={15} /> {reviewStatus === 'REJECTED' ? 'Rejected' : 'Reject'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-800">Application Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">Application ID</p>
            <p className="font-medium text-stone-700 break-all">{application.id}</p>
          </div>
          <div>
            <p className="text-stone-400">Requested Pricing</p>
            <p className="font-semibold text-kala-terracotta">{formatPrice(application.pricing)}/session</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-stone-400">Skills</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {application.skills.map((skill) => (
                <Badge key={skill.id}>{skill.name}</Badge>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-stone-400">Bio</p>
            <p className="text-stone-700 leading-relaxed mt-1">{application.bio}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-stone-400">Instagram</p>
            {application.instagramUrl ? (
              <a
                href={application.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-kala-terracotta hover:underline mt-1"
              >
                {application.instagramUrl} <ExternalLink size={14} />
              </a>
            ) : (
              <p className="text-stone-500 mt-1">Not provided</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-800">Portfolio Images</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((item) => (
              <div key={item.id} className="rounded-xl overflow-hidden border border-stone-100">
                <img src={item.imageUrl} alt={item.caption || 'Portfolio image'} className="w-full h-44 object-cover" />
                {item.caption && <p className="text-xs text-stone-500 p-2">{item.caption}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No images uploaded.</p>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-800">Portfolio Videos</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map((item) => (
              <div key={item.id} className="rounded-xl overflow-hidden border border-stone-100">
                <img src={item.imageUrl} alt={item.caption || 'Portfolio video preview'} className="w-full h-44 object-cover" />
                <div className="p-2 space-y-1">
                  <Badge variant="warning">Video</Badge>
                  {item.caption && <p className="text-xs text-stone-500">{item.caption}</p>}
                  {item.videoUrl && (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-kala-terracotta hover:underline inline-flex items-center gap-1"
                    >
                      Open video <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No videos uploaded.</p>
        )}
      </Card>
    </div>
  )
}
