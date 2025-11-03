"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Clock, Heart, ArrowLeft, User, Baby, Send, CheckCircle, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { normalizeChildKeys } from "@/lib/children"

// Mock data for selected providers
const selectedProviders = [
  {
    id: 1,
    name: "Sunshine Daycare Center",
    type: "Center-based",
    rating: 4.8,
    distance: "0.3 miles",
    tuitionRange: "$800-1200/month",
    availability: "Immediate",
    image: "/bright-colorful-daycare-center-exterior.jpg",
    estimatedResponse: "2-3 business days",
  },
  {
    id: 2,
    name: "Little Learners Home Care",
    type: "Home-based",
    rating: 4.9,
    distance: "0.7 miles",
    tuitionRange: "$600-900/month",
    availability: "1-3 months",
    image: "/cozy-home-daycare-with-children-playing.jpg",
    estimatedResponse: "1-2 business days",
  },
]

export default function ApplicationPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false)
  const isLoggedIn = typeof window !== 'undefined' && !!window.localStorage.getItem('user')
  // mark checked on mount for hydration safety
  useState(() => {
    setAuthChecked(true)
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Parent Information
  const [parentInfo, setParentInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    workAddress: "",
    city: "",
    province: "",
    postalCode: "",
    emergencyContact1Name: "",
    emergencyContact1Phone: "",
    emergencyContact2Name: "",
    emergencyContact2Phone: "",
  })

  // Child Information
  const [childInfo, setChildInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    ageGroup: "",
    specialNeeds: "",
    allergies: "",
    medicalConditions: "",
    currentProvider: "",
    startDate: "",
  })

  // Application preferences
  const [preferences, setPreferences] = useState({
    schedule: "",
    additionalInfo: "",
    tourRequested: false,
    agreeToTerms: false,
  })

  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>([1, 2])

  const handleProviderToggle = (providerId: number) => {
    setSelectedProviderIds((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId],
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return parentInfo.firstName && parentInfo.lastName && parentInfo.email && parentInfo.phone && parentInfo.address
      case 2:
        return childInfo.firstName && childInfo.lastName && childInfo.dateOfBirth && childInfo.ageGroup
      case 3:
        return selectedProviderIds.length > 0 && preferences.agreeToTerms
      default:
        return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/search")}> 
              <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild><Link href="/profile">Edit Profile</Link></Button>
              {typeof window !== 'undefined' && window.localStorage.getItem('user') && (
                <Button variant="outline" onClick={() => { window.localStorage.removeItem('user'); router.push('/'); }}>Logout</Button>
              )}
            </div>
          </div>
        </nav>

        {/* Success Page */}
  <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Applications Submitted Successfully!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your applications have been sent to {selectedProviderIds.length} childcare providers.
            </p>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {selectedProviders
                    .filter((provider) => selectedProviderIds.includes(provider.id))
                    .map((provider) => (
                      <div key={provider.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={provider.image || "/placeholder.svg"}
                          alt={provider.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Expected response: {provider.estimatedResponse}
                          </p>
                        </div>
                        <Badge variant="outline">Submitted</Badge>
                      </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    You'll receive email confirmations from each provider
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Track your application status in your dashboard
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Providers may contact you to schedule tours or interviews
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => (window.location.href = "/dashboard")}>View Application Status</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/search")}>
                Find More Providers
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="cursor-pointer" onClick={() => router.push("/search")}> 
                <div className="flex items-center gap-2">
                  <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {authChecked && !isLoggedIn && (
          <div className="max-w-xl mx-auto text-center p-6 border rounded-lg bg-white shadow-sm">
            <p className="mb-4">请先登录以提交申请。</p>
            <Button onClick={() => router.push('/login')}>前往登录</Button>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">One-Click Application</h1>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
                Parent Info
              </span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
                Child Info
              </span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
                Review & Submit
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Parent Information
                    </CardTitle>
                    <CardDescription>Tell us about yourself so providers can contact you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={parentInfo.firstName}
                          onChange={(e) => setParentInfo({ ...parentInfo, firstName: e.target.value })}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={parentInfo.lastName}
                          onChange={(e) => setParentInfo({ ...parentInfo, lastName: e.target.value })}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={parentInfo.email}
                          onChange={(e) => setParentInfo({ ...parentInfo, email: e.target.value })}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={parentInfo.phone}
                          onChange={(e) => setParentInfo({ ...parentInfo, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Home Address *</Label>
                      <Input
                        id="address"
                        value={parentInfo.address}
                        onChange={(e) => setParentInfo({ ...parentInfo, address: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={parentInfo.city}
                          onChange={(e) => setParentInfo({ ...parentInfo, city: e.target.value })}
                          placeholder="Winnipeg"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="province">Province</Label>
                        <Select
                          value={parentInfo.province}
                          onValueChange={(value) => setParentInfo({ ...parentInfo, province: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Province" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MB">MB</SelectItem>
                            <SelectItem value="ON">ON</SelectItem>
                            <SelectItem value="BC">BC</SelectItem>
                            <SelectItem value="AB">AB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={parentInfo.postalCode}
                          onChange={(e) => setParentInfo({ ...parentInfo, postalCode: e.target.value })}
                          placeholder="R3C 1A1"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="workAddress">Work Address</Label>
                        <Input
                          id="workAddress"
                          value={parentInfo.workAddress}
                          onChange={(e) => setParentInfo({ ...parentInfo, workAddress: e.target.value })}
                          placeholder="Office address"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="emergencyContact1Name">Priority #1 Name</Label>
                        <Input
                          id="emergencyContact1Name"
                          value={parentInfo.emergencyContact1Name}
                          onChange={(e) => setParentInfo({ ...parentInfo, emergencyContact1Name: e.target.value })}
                          placeholder="Primary contact"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="emergencyContact1Phone">Priority #1 Phone</Label>
                        <Input
                          id="emergencyContact1Phone"
                          value={parentInfo.emergencyContact1Phone}
                          onChange={(e) => setParentInfo({ ...parentInfo, emergencyContact1Phone: e.target.value })}
                          placeholder="204-555-0000"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="emergencyContact2Name">Priority #2 Name</Label>
                        <Input
                          id="emergencyContact2Name"
                          value={parentInfo.emergencyContact2Name}
                          onChange={(e) => setParentInfo({ ...parentInfo, emergencyContact2Name: e.target.value })}
                          placeholder="Secondary contact"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="emergencyContact2Phone">Priority #2 Phone</Label>
                        <Input
                          id="emergencyContact2Phone"
                          value={parentInfo.emergencyContact2Phone}
                          onChange={(e) => setParentInfo({ ...parentInfo, emergencyContact2Phone: e.target.value })}
                          placeholder="204-555-1111"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Baby className="w-5 h-5 mr-2" />
                      Child Information
                    </CardTitle>
                    <CardDescription>Tell us about your child's needs and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="childFirstName">Child's First Name *</Label>
                        <Input
                          id="childFirstName"
                          value={childInfo.firstName}
                          onChange={(e) => setChildInfo({ ...childInfo, firstName: e.target.value })}
                          placeholder="Enter child's first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="childLastName">Child's Last Name *</Label>
                        <Input
                          id="childLastName"
                          value={childInfo.lastName}
                          onChange={(e) => setChildInfo({ ...childInfo, lastName: e.target.value })}
                          placeholder="Enter child's last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={childInfo.dateOfBirth}
                          onChange={(e) => setChildInfo({ ...childInfo, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ageGroup">Age Group *</Label>
                        <Select
                          value={childInfo.ageGroup}
                          onValueChange={(value) => setChildInfo({ ...childInfo, ageGroup: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Infant">Infant (0-12 months)</SelectItem>
                            <SelectItem value="Toddler">Toddler (1-3 years)</SelectItem>
                            <SelectItem value="Preschool">Preschool (3-5 years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="startDate">Preferred Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={childInfo.startDate}
                        onChange={(e) => setChildInfo({ ...childInfo, startDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="currentProvider">Current Childcare Provider (if any)</Label>
                      <Input
                        id="currentProvider"
                        value={childInfo.currentProvider}
                        onChange={(e) => setChildInfo({ ...childInfo, currentProvider: e.target.value })}
                        placeholder="Name of current provider"
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={childInfo.allergies}
                        onChange={(e) => setChildInfo({ ...childInfo, allergies: e.target.value })}
                        placeholder="List any food allergies or environmental allergies"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea
                        id="medicalConditions"
                        value={childInfo.medicalConditions}
                        onChange={(e) => setChildInfo({ ...childInfo, medicalConditions: e.target.value })}
                        placeholder="Any medical conditions providers should be aware of"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialNeeds">Special Needs or Accommodations</Label>
                      <Textarea
                        id="specialNeeds"
                        value={childInfo.specialNeeds}
                        onChange={(e) => setChildInfo({ ...childInfo, specialNeeds: e.target.value })}
                        placeholder="Any special needs or accommodations required"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Special Details</label>
                      <textarea
                        className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
                        placeholder="Anything important to share about your child (health, behavior, routines, learning, other notes)"
                        value={child.specialDetails || ""}
                        onChange={(e) => setChild((c: any) => ({ ...(c || {}), specialDetails: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Providers</CardTitle>
                      <CardDescription>Choose which providers to send your application to</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProviders.map((provider) => (
                          <div
                            key={provider.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedProviderIds.includes(provider.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            }`}
                            onClick={() => handleProviderToggle(provider.id)}
                          >
                            <div className="flex items-center space-x-4">
                              <Checkbox
                                checked={selectedProviderIds.includes(provider.id)}
                                onChange={() => handleProviderToggle(provider.id)}
                              />
                              <img
                                src={provider.image || "/placeholder.svg"}
                                alt={provider.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold">{provider.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {provider.distance}
                                  </span>
                                  <span className="flex items-center">
                                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                    {provider.rating}
                                  </span>
                                  <Badge className="bg-green-100 text-green-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {provider.availability}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Expected response: {provider.estimatedResponse}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="schedule">Preferred Schedule</Label>
                        <Select
                          value={preferences.schedule}
                          onValueChange={(value) => setPreferences({ ...preferences, schedule: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time (5 days/week)</SelectItem>
                            <SelectItem value="part-time">Part-time (2-3 days/week)</SelectItem>
                            <SelectItem value="flexible">Flexible schedule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea
                          id="additionalInfo"
                          value={preferences.additionalInfo}
                          onChange={(e) => setPreferences({ ...preferences, additionalInfo: e.target.value })}
                          placeholder="Any additional information you'd like providers to know"
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tourRequested"
                          checked={preferences.tourRequested}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, tourRequested: checked as boolean })
                          }
                        />
                        <Label htmlFor="tourRequested">I would like to schedule a tour before enrolling</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={preferences.agreeToTerms}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, agreeToTerms: checked as boolean })
                          }
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the terms of service and privacy policy *
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < 3 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!isStepComplete(currentStep)}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepComplete(currentStep) || isSubmitting}
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Applications
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Parent Info</span>
                      {isStepComplete(1) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Child Info</span>
                      {isStepComplete(2) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Provider Selection</span>
                      {selectedProviderIds.length > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium mb-2">Selected Providers: {selectedProviderIds.length}</p>
                    {selectedProviders
                      .filter((provider) => selectedProviderIds.includes(provider.id))
                      .map((provider) => (
                        <p key={provider.id} className="text-muted-foreground">
                          • {provider.name}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>Having trouble with your application?</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
