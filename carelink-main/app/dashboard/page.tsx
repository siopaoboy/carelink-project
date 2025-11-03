"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getCurrentUserEmail, getUser, createVerifyToken, logout as authLogout, setVerified } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import {
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageCircle,
  Calendar,
  MapPin,
  Star,
  Users,
  Bell,
  Filter,
  Eye,
  Trash2,
  RotateCcw,
  Search,
  Navigation,
} from "lucide-react"
// Client-only Map component (same as search page usage)
const ClientMap = dynamic(() => import("@/components/map/ClientMap"), { ssr: false })

// Mock data for applications
const applications = [
  {
    id: 1,
    providerId: 1,
    providerName: "Sunshine Daycare Center",
    providerImage: "/bright-colorful-daycare-center-exterior.jpg",
    status: "in-review",
    submittedDate: "2024-01-15",
    lastUpdate: "2024-01-16",
    estimatedResponse: "2-3 business days",
    distance: "0.3 miles",
    rating: 4.8,
    tuitionRange: "$800-1200/month",
    timeline: [
      { status: "submitted", date: "2024-01-15", time: "10:30 AM", completed: true },
      { status: "in-review", date: "2024-01-16", time: "2:15 PM", completed: true },
      { status: "interview", date: "", time: "", completed: false },
      { status: "decision", date: "", time: "", completed: false },
    ],
    notes: "Application submitted successfully. Provider has confirmed receipt and is reviewing.",
    nextSteps: "Wait for provider to schedule interview or request additional information.",
  },
  {
    id: 2,
    providerId: 2,
    providerName: "Little Learners Home Care",
    providerImage: "/cozy-home-daycare-with-children-playing.jpg",
    status: "waitlisted",
    submittedDate: "2024-01-14",
    lastUpdate: "2024-01-17",
    estimatedResponse: "1-2 business days",
    distance: "0.7 miles",
    rating: 4.9,
    tuitionRange: "$600-900/month",
    timeline: [
      { status: "submitted", date: "2024-01-14", time: "9:00 AM", completed: true },
      { status: "in-review", date: "2024-01-14", time: "11:30 AM", completed: true },
      { status: "interview", date: "2024-01-16", time: "3:00 PM", completed: true },
      { status: "waitlisted", date: "2024-01-17", time: "10:00 AM", completed: true },
    ],
    notes: "Interview completed. Currently on waitlist - position #2. Provider expects opening in March.",
    nextSteps: "Stay in contact with provider. Consider backup options.",
    waitlistPosition: 2,
  },
  {
    id: 3,
    providerId: 3,
    providerName: "Rainbow Kids Academy",
    providerImage: "/modern-daycare-center-with-playground.jpg",
    status: "accepted",
    submittedDate: "2024-01-12",
    lastUpdate: "2024-01-18",
    estimatedResponse: "3-5 business days",
    distance: "1.2 miles",
    rating: 4.7,
    tuitionRange: "$900-1400/month",
    timeline: [
      { status: "submitted", date: "2024-01-12", time: "2:00 PM", completed: true },
      { status: "in-review", date: "2024-01-13", time: "9:00 AM", completed: true },
      { status: "interview", date: "2024-01-15", time: "1:00 PM", completed: true },
      { status: "accepted", date: "2024-01-18", time: "11:00 AM", completed: true },
    ],
    notes: "Congratulations! Your application has been accepted. Enrollment paperwork required.",
    nextSteps: "Complete enrollment forms and schedule start date.",
    startDate: "2024-02-01",
  },
  {
    id: 4,
    providerId: 4,
    providerName: "Cozy Corner Family Care",
    providerImage: "/family-home-daycare-with-toys-and-books.jpg",
    status: "rejected",
    submittedDate: "2024-01-10",
    lastUpdate: "2024-01-16",
    estimatedResponse: "2-4 business days",
    distance: "0.9 miles",
    rating: 4.6,
    tuitionRange: "$700-1000/month",
    timeline: [
      { status: "submitted", date: "2024-01-10", time: "4:00 PM", completed: true },
      { status: "in-review", date: "2024-01-11", time: "10:00 AM", completed: true },
      { status: "rejected", date: "2024-01-16", time: "3:30 PM", completed: true },
    ],
    notes: "Application not selected. Provider cited age group mismatch as reason.",
    nextSteps: "Consider reapplying when child reaches appropriate age group.",
    rejectionReason: "Age group mismatch - currently only accepting infants",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-blue-100 text-blue-800"
    case "in-review":
      return "bg-yellow-100 text-yellow-800"
    case "waitlisted":
      return "bg-orange-100 text-orange-800"
    case "accepted":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "submitted":
      return <Clock className="w-4 h-4" />
    case "in-review":
      return <Eye className="w-4 h-4" />
    case "waitlisted":
      return <AlertCircle className="w-4 h-4" />
    case "accepted":
      return <CheckCircle className="w-4 h-4" />
    case "rejected":
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "submitted":
      return "Submitted"
    case "in-review":
      return "In Review"
    case "waitlisted":
      return "Waitlisted"
    case "accepted":
      return "Accepted"
    case "rejected":
      return "Not Selected"
    default:
      return status
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{email: string, name: string} | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (async () => {
        const email = getCurrentUserEmail();
        if (email) {
          setUser({ email, name: email.split('@')[0] });
          // Prefer Supabase session for verified status
          const { data } = await supabase.auth.getSession();
          const supaVerified = !!data.session?.user?.email_confirmed_at;
          if (supaVerified) {
            setVerified(email, true);
          } else {
            const rec = getUser(email);
            if (!rec?.verified) {
              const token = createVerifyToken(email);
              router.replace(`/verify-sent?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
              return;
            }
          }
        }
        setAuthChecked(true);
      })();
    } else {
      setAuthChecked(true);
    }
  }, [router]);
  function handleLogout() {
    setUser(null);
    authLogout();
    router.push("/");
  }
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)
  // Step C: dashboard search hero
  const [locationQuery, setLocationQuery] = useState("")
  const [coords, setCoords] = useState<{lat:number,lng:number}|null>(null)
  const [showMap, setShowMap] = useState(true)
  const [radius, setRadius] = useState("5km")
  const [ageGroup, setAgeGroup] = useState("all")
  const [hours, setHours] = useState("any")
  const [subsidy, setSubsidy] = useState(false)

  const filteredApplications = applications.filter((app) => selectedStatus === "all" || app.status === selectedStatus)

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter((app) => app.status === "submitted").length,
    "in-review": applications.filter((app) => app.status === "in-review").length,
    waitlisted: applications.filter((app) => app.status === "waitlisted").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  const getTimelineProgress = (timeline: any[]) => {
    const completedSteps = timeline.filter((step) => step.completed).length
    return (completedSteps / timeline.length) * 100
  }

  const activeCount = applications.filter(a => a.status !== 'rejected').length

  function useCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      setCoords({ lat: latitude, lng: longitude })
      setLocationQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
    })
  }

  function goSearch() {
    const params = new URLSearchParams()
    if (locationQuery) params.set('q', locationQuery)
    if (radius) params.set('r', radius)
    if (ageGroup !== 'all') params.set('age', ageGroup)
    if (hours !== 'any') params.set('hours', hours)
    if (subsidy) params.set('subsidy', '1')
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => {
              if (typeof window !== 'undefined' && window.localStorage.getItem('user')) {
                router.push('/search')
              } else {
                router.push('/login')
              }
            }}>
              <div className="flex items-center gap-2">
                <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={() => {
                if (typeof window !== 'undefined' && window.localStorage.getItem('currentUser')) {
                  const email = window.localStorage.getItem('currentUser')!
                  const users = JSON.parse(window.localStorage.getItem('users') || '{}')
                  const rec = users[email]
                  if (rec?.role === 'Provider') router.push('/provider/dashboard')
                  else router.push('/profile')
                } else {
                  router.push('/login')
                }
              }}>
                <Users className="w-4 h-4 mr-2" />
                Profile
              </Button>
              {user && (
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Step C: Search hero */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Find openings near you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Enter a location" value={locationQuery} onChange={(e)=>setLocationQuery(e.target.value)} className="pl-10" />
                </div>
                <Button variant="outline" size="icon" onClick={useCurrentLocation} title="Use current location">
                  <Navigation className="w-4 h-4" />
                </Button>
                <Button className="bg-primary text-primary-foreground" onClick={goSearch}>Find openings near me</Button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Radius</span>
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3km">3 km</SelectItem>
                      <SelectItem value="5km">5 km</SelectItem>
                      <SelectItem value="10km">10 km</SelectItem>
                      <SelectItem value="20km">20 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Age</span>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Infant">Infant</SelectItem>
                      <SelectItem value="Toddler">Toddler</SelectItem>
                      <SelectItem value="Preschool">Preschool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Hours</span>
                  <Select value={hours} onValueChange={setHours}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                      <SelectItem value="half-day">Half-day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={subsidy} onChange={e=>setSubsidy(e.target.checked)} /> Subsidy accepted
                </label>
                <div className="ml-auto">
                  <Button variant="outline" onClick={()=>setShowMap(!showMap)}>{showMap? 'Show list' : 'Show map'}</Button>
                </div>
              </div>
              {showMap ? (
                <div className="rounded border p-2">
                  <ClientMap
                    height={220}
                    markers={coords?[{ id: 'me', position: coords, label: 'You', color: '#2563eb' }]:[]}
                    onMarkerClick={()=>{}}
                  />
                </div>
              ) : (
                <div className="rounded border p-4 text-sm text-muted-foreground">List view will show nearby providers. Use Search to see full results.</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle>My applications</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{activeCount}</div>
              <p className="text-muted-foreground mb-3 text-sm">active applications</p>
              <Button variant="outline" onClick={()=>router.push('/dashboard')}>Open dashboard</Button>
            </CardContent>
          </Card>
        </div>
        {/* Auth guard */}
        {authChecked && !user && (
          <div className="max-w-xl mx-auto text-center p-6 border rounded-lg bg-white shadow-sm">
            <p className="mb-4">请先登录以查看申请仪表盘。</p>
            <Button onClick={() => router.push('/login')}>前往登录</Button>
          </div>
        )}
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Application Dashboard</h1>
              <p className="text-muted-foreground">Track your childcare applications and their progress</p>
            </div>
            <Button onClick={() => (window.location.href = "/search")}>Find More Providers</Button>
          </div>

          {/* Status Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus("all")}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{statusCounts.all}</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus("in-review")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts["in-review"]}</div>
                <div className="text-sm text-muted-foreground">In Review</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus("waitlisted")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{statusCounts.waitlisted}</div>
                <div className="text-sm text-muted-foreground">Waitlisted</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus("accepted")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus("rejected")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
                <div className="text-sm text-muted-foreground">Not Selected</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus("submitted")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.submitted}</div>
                <div className="text-sm text-muted-foreground">Submitted</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Applications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications ({statusCounts.all})</SelectItem>
                    <SelectItem value="submitted">Submitted ({statusCounts.submitted})</SelectItem>
                    <SelectItem value="in-review">In Review ({statusCounts["in-review"]})</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted ({statusCounts.waitlisted})</SelectItem>
                    <SelectItem value="accepted">Accepted ({statusCounts.accepted})</SelectItem>
                    <SelectItem value="rejected">Not Selected ({statusCounts.rejected})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>

          {/* Applications List */}
          <div className="grid gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-48 h-32 md:h-auto">
                    <img
                      src={application.providerImage || "/placeholder.svg"}
                      alt={application.providerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{application.providerName}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {application.distance}
                            </span>
                            <span className="flex items-center">
                              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                              {application.rating}
                            </span>
                            <span>{application.tuitionRange}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{getStatusLabel(application.status)}</span>
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated {new Date(application.lastUpdate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Timeline Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Application Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {application.timeline.filter((step) => step.completed).length} of{" "}
                              {application.timeline.length} steps
                            </span>
                          </div>
                          <Progress value={getTimelineProgress(application.timeline)} className="h-2" />
                        </div>

                        {/* Timeline Steps */}
                        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                          {application.timeline.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 min-w-fit">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  step.completed
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium capitalize">{step.status.replace("-", " ")}</p>
                                {step.date && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(step.date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {index < application.timeline.length - 1 && <div className="w-8 h-px bg-border mx-2" />}
                            </div>
                          ))}
                        </div>

                        {/* Status-specific Information */}
                        {application.status === "waitlisted" && application.waitlistPosition && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-orange-800">
                              Waitlist Position: #{application.waitlistPosition}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              You're #{application.waitlistPosition} in line. We'll notify you when a spot opens.
                            </p>
                          </div>
                        )}

                        {application.status === "accepted" && application.startDate && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-800">
                              Congratulations! Start Date: {new Date(application.startDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Complete enrollment paperwork to secure your spot.
                            </p>
                          </div>
                        )}

                        {application.status === "rejected" && application.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-red-800">Reason: {application.rejectionReason}</p>
                            <p className="text-xs text-red-600 mt-1">Consider other providers or reapply later.</p>
                          </div>
                        )}

                        {/* Notes and Next Steps */}
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm mb-2">
                            <strong>Notes:</strong> {application.notes}
                          </p>
                          <p className="text-sm">
                            <strong>Next Steps:</strong> {application.nextSteps}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = `/provider/${application.providerId}`)}
                          >
                            View Provider
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/messages")}>
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          {application.status === "accepted" && (
                            <Button size="sm">
                              <Calendar className="w-4 h-4 mr-1" />
                              Complete Enrollment
                            </Button>
                          )}
                          {application.status === "rejected" && (
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Reapply
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedStatus === "all"
                  ? "You haven't submitted any applications yet."
                  : `No applications with status "${getStatusLabel(selectedStatus)}".`}
              </p>
              <Button onClick={() => (window.location.href = "/search")}>Find Providers</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
