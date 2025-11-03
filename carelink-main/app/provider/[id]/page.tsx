"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Star,
  Clock,
  Heart,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
  Camera,
  Shield,
  Award,
  Home,
  Car,
  Utensils,
  BookOpen,
  Music,
} from "lucide-react"

// Mock provider data
const providerData = {
  id: 1,
  name: "Sunshine Daycare Center",
  type: "Center-based",
  rating: 4.8,
  reviewCount: 127,
  distance: "0.3 miles",
  address: "123 Oak Street, Springfield, IL 62701",
  phone: "(555) 123-4567",
  email: "info@sunshinedaycare.com",
  ageGroups: ["Infant", "Toddler", "Preschool"],
  tuitionRange: "$800-1200/month",
  availability: "Immediate",
  openSpots: 3,
  isFavorite: false,
  description:
    "Sunshine Daycare Center has been serving the Springfield community for over 15 years. We provide a warm, nurturing environment where children learn and grow through play-based activities and structured learning programs.",
  features: ["Licensed", "Background Checked", "Meals Included", "STEM Programs", "Outdoor Playground"],
  hours: {
    monday: "7:00 AM - 6:00 PM",
    tuesday: "7:00 AM - 6:00 PM",
    wednesday: "7:00 AM - 6:00 PM",
    thursday: "7:00 AM - 6:00 PM",
    friday: "7:00 AM - 6:00 PM",
    saturday: "Closed",
    sunday: "Closed",
  },
  photos: [
    "/bright-colorful-daycare-center-exterior.jpg",
    "/modern-daycare-center-with-playground.jpg",
    "/cozy-home-daycare-with-children-playing.jpg",
    "/family-home-daycare-with-toys-and-books.jpg",
  ],
  amenities: [
    { icon: Shield, label: "Licensed & Insured" },
    { icon: Utensils, label: "Nutritious Meals" },
    { icon: Car, label: "Parking Available" },
    { icon: BookOpen, label: "Educational Programs" },
    { icon: Music, label: "Music & Arts" },
    { icon: Home, label: "Safe Environment" },
  ],
  staff: [
    {
      name: "Sarah Johnson",
      role: "Director",
      experience: "15 years",
      education: "M.Ed. Early Childhood",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Maria Garcia",
      role: "Lead Teacher",
      experience: "8 years",
      education: "B.A. Child Development",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Jennifer Smith",
      role: "Assistant Teacher",
      experience: "5 years",
      education: "A.A. Early Childhood",
      image: "/placeholder.svg?height=80&width=80",
    },
  ],
  reviews: [
    {
      id: 1,
      author: "Emily R.",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Absolutely love Sunshine Daycare! My daughter has been there for 2 years and has learned so much. The staff is caring and professional.",
      helpful: 12,
    },
    {
      id: 2,
      author: "Michael T.",
      rating: 5,
      date: "1 month ago",
      comment:
        "Great communication with parents. They send daily updates and photos. The facility is clean and well-maintained.",
      helpful: 8,
    },
    {
      id: 3,
      author: "Lisa M.",
      rating: 4,
      date: "2 months ago",
      comment:
        "Good daycare overall. My son enjoys going there. Only wish they had more outdoor activities during winter.",
      helpful: 5,
    },
  ],
  availability_calendar: [
    { date: "2024-01-15", spots: 2, ageGroup: "Toddler" },
    { date: "2024-01-22", spots: 1, ageGroup: "Preschool" },
    { date: "2024-02-01", spots: 3, ageGroup: "Infant" },
  ],
}

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(providerData.isFavorite)

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleMessage = () => {
    window.location.href = "/messages"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="cursor-pointer" onClick={() => window.location.href='/' }>
                <div className="flex items-center gap-2">
                  <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={toggleFavorite}>
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="outline" onClick={handleMessage}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={providerData.photos[currentPhotoIndex] || "/placeholder.svg"}
                  alt={providerData.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Camera className="w-4 h-4 mr-1" />
                  {currentPhotoIndex + 1} / {providerData.photos.length}
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {providerData.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentPhotoIndex ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{providerData.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {providerData.distance}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {providerData.rating} ({providerData.reviewCount} reviews)
                      </span>
                    </div>
                    <p className="text-muted-foreground">{providerData.address}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {providerData.availability}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{providerData.openSpots} spots available</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{providerData.type}</Badge>
                    {providerData.ageGroups.map((age) => (
                      <Badge key={age} variant="outline">
                        {age}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-foreground leading-relaxed">{providerData.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {providerData.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <amenity.icon className="w-4 h-4 text-primary" />
                        <span>{amenity.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {providerData.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hours of Operation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(providerData.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}</span>
                          <span className="text-muted-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Our Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {providerData.staff.map((member, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.experience} experience • {member.education}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Availability</CardTitle>
                    <CardDescription>Real-time open spots by age group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {providerData.availability_calendar.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{new Date(slot.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">{slot.ageGroup} group</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{slot.spots} spots available</p>
                            <Button size="sm" className="mt-2">
                              Apply for this date
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Parent Reviews</CardTitle>
                    <CardDescription>{providerData.reviewCount} reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {providerData.reviews.map((review) => (
                        <div key={review.id}>
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarFallback>{review.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium">{review.author}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                              <p className="text-foreground mb-2">{review.comment}</p>
                              <p className="text-sm text-muted-foreground">
                                {review.helpful} people found this helpful
                              </p>
                            </div>
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{providerData.phone}</p>
                        <p className="text-sm text-muted-foreground">Call for immediate assistance</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{providerData.email}</p>
                        <p className="text-sm text-muted-foreground">Email for general inquiries</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{providerData.address}</p>
                        <p className="text-sm text-muted-foreground">Visit us for a tour</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleMessage}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Tour
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tuition Range</span>
                  <span className="font-medium">{providerData.tuitionRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Spots</span>
                  <span className="font-medium text-green-600">{providerData.openSpots} spots</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Age Groups</span>
                  <span className="font-medium">{providerData.ageGroups.join(", ")}</span>
                </div>
                <Separator />
                <Button className="w-full" size="lg">
                  Apply Now
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Add to Application List
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety & Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm">State Licensed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Background Checked Staff</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-sm">CPR/First Aid Certified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Fully Insured</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
