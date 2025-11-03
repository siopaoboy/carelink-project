"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Clock, Heart, Filter, Search, Navigation, Users, DollarSign, CheckCircle, User, Map as MapIcon, List } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

// Map is client-only
const ClientMap = dynamic(() => import("@/components/map/ClientMap"), { ssr: false })

type Provider = {
  id: number
  name: string
  type: string
  rating: number
  reviewCount: number
  distance: string
  address: string
  phone: string
  ageGroups: string[]
  tuitionRange: string
  availability: string
  features: string[]
  description: string
  openSpots: number
  isFavorite: boolean
  lat?: number
  lng?: number
  hoursType?: 'standard'|'extended'|'half-day'
  subsidyAccepted?: boolean
}

function hashCode(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i), h |= 0
  return Math.abs(h)
}

function parseCSV(text: string): any[] {
  const rows: string[][] = []
  let cur: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++ } else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) { cur.push(cell); cell = '' }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) { if (cell !== '' || cur.length) { cur.push(cell); rows.push(cur); cur = []; cell=''} }
    else { cell += ch }
  }
  if (cell !== '' || cur.length) { cur.push(cell); rows.push(cur) }
  if (!rows.length) return []
  const headers = rows[0].map(h=>h.trim())
  return rows.slice(1).filter(r=>r.some(v=>v && v.trim())).map(r => {
    const obj: any = {}
    headers.forEach((h, idx) => obj[h] = (r[idx] || '').trim())
    return obj
  })
}

export default function SearchPage() {
  const router = useRouter();
  const [user, setUser] = useState<{email: string, name: string} | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('user')) {
      setUser(JSON.parse(window.localStorage.getItem('user')!));
    }
  }, []);
  function handleLogout() {
    setUser(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem('user');
    router.push("/");
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [selectedRadius, setSelectedRadius] = useState("all")
  const [selectedHours, setSelectedHours] = useState<'any'|'standard'|'extended'|'half-day'>("any")
  const [selectedSubsidy, setSelectedSubsidy] = useState<'any'|'yes'|'no'>('any')
  const [providers, setProviders] = useState<Provider[]>([])
  const [viewMode, setViewMode] = useState<'map-list'|'list'>("map-list")
  const [coords, setCoords] = useState<{lat:number,lng:number}|null>(null)
  useEffect(() => {
    // Load CSV from public and map to provider shape, preserving mock fields for missing data
    fetch('/data/childcare_results.csv').then(res=>res.text()).then(text => {
      const rows = parseCSV(text)
      const mapped: Provider[] = rows.map((r, idx) => {
        const name = r['entries_name'] || 'Unknown Provider'
        const address = (r['entries_address'] || '').replace(/\n/g, ', ')
        const phone = (r['entries_phone'] || '').replace(/^\((\d{3})\)\s*(\d{3})-(\d{4})$/, '+1 $1 $2 $3')
        const agesStr = r['entries_agesOfCare'] || ''
  const ageGroups = agesStr.split(/\s*,\s*/).map((a: string) => a.replace('Nursery/Preschool','Preschool')).filter(Boolean)
        const v1 = parseInt(r['entries_vacancies0to2']||'0')||0
        const v2 = parseInt(r['entries_vacancies2to6']||'0')||0
        const v3 = parseInt(r['entries_vacancies6to12']||'0')||0
        const openSpots = v1+v2+v3
        const availability = openSpots>0 ? 'Immediate' : '3+ months'
        const h = hashCode(name)
        const rating = 4 + ((h % 95) / 100) // 4.00 - 4.95
        const reviewCount = 5 + (h % 80)
  const features = ['Licensed'].concat(((h%2)===0)?['Inclusive']:[]).concat(((h%3)===0)?['Outdoor Play']:[])
  const hoursType: 'standard'|'extended'|'half-day' = (h % 3 === 0) ? 'extended' : (h % 3 === 1) ? 'standard' : 'half-day'
  const subsidyAccepted = (h % 4) === 0
  let type: string
  if (/home|family/i.test(name+address)) type = 'Home-based'
  else if (/co-?op|cooperative/i.test(name)) type = 'Co-op Center'
  else if (/nursery|preschool/i.test(name)) type = 'Nursery School'
  else type = 'Center-based'
        return {
          id: idx+1,
          name,
          type,
          rating: Math.round(rating*10)/10,
          reviewCount,
          distance: '—',
          address,
          phone,
          ageGroups: ageGroups.length?ageGroups:["Preschool"],
          tuitionRange: '$600-1200/month',
          availability,
          features,
          description: 'Trusted childcare provider offering quality care and early learning.',
          openSpots,
          isFavorite: false,
          hoursType,
          subsidyAccepted,
        } as Provider
      })
      setProviders(mapped)
    }).catch(()=>{})
  }, [])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    window.addEventListener("error", handleResizeObserverError)
    return () => window.removeEventListener("error", handleResizeObserverError)
  }, [])

  const toggleFavorite = (id: number) => {
    setProviders(
      providers.map((provider) => (provider.id === id ? { ...provider, isFavorite: !provider.isFavorite } : provider)),
    )
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAge = selectedAgeGroup === "all" || provider.ageGroups.includes(selectedAgeGroup)
    const matchesType = selectedType === "all" || provider.type === selectedType
    const matchesAvailability = selectedAvailability === "all" || provider.availability === selectedAvailability
    const matchesHours = selectedHours === 'any' || provider.hoursType === selectedHours
  const matchesSubsidy = selectedSubsidy === 'any' || (selectedSubsidy === 'yes' ? !!provider.subsidyAccepted : !provider.subsidyAccepted)
    const matchesRadius = (() => {
      if (selectedRadius === 'all') return true
      const km = parseFloat((provider.distance || '').replace(/[^0-9.]/g, ''))
      const limit = parseFloat(selectedRadius)
      if (isNaN(km) || isNaN(limit)) return true
      return km <= limit
    })()

    return matchesSearch && matchesAge && matchesType && matchesAvailability && matchesHours && matchesSubsidy && matchesRadius
  })

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Immediate":
        return "bg-green-100 text-green-800"
      case "1-3 months":
        return "bg-yellow-100 text-yellow-800"
      case "3+ months":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMarkerHexByAvailability = (availability: string) => {
    // 需求：红点=满额需等待6个月以上，绿点=可申请，黄点=等待1-6个月
    // 现有数据为 Immediate / 1-3 months / 3+ months，映射如下：
    if (availability === "Immediate") return "#16a34a" // 绿
    if (availability.includes("3+")) return "#dc2626" // 6+ 月（红）
    if (availability.includes("month")) return "#eab308" // 1-6 月（黄）
    return "#6b7280"
  }

  function useCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      setCoords({ lat: latitude, lng: longitude })
      setSearchQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div
              className="cursor-pointer"
              onClick={() => {
                if (typeof window !== 'undefined' && window.localStorage.getItem('user')) {
                  router.push('/search')
                } else {
                  router.push('/login')
                }
              }}
            >
              <div className="flex items-center gap-2">
                <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto"
                  onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.localStorage.getItem('currentUser')) {
                    const email = window.localStorage.getItem('currentUser')!
                    const users = JSON.parse(window.localStorage.getItem('users') || '{}')
                    const rec = users[email]
                    if (rec?.role === 'Provider') router.push('/provider/dashboard')
                    else router.push('/dashboard')
                  } else {
                    router.push('/login')
                  }
                }}
                title="Profile"
                className="text-primary hover:text-primary"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, address, or postal code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" title="Use current location" onClick={useCurrentLocation}>
              <Navigation className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="ml-auto hidden md:flex items-center gap-2">
              <Button variant={viewMode==='map-list'?"default":"outline"} size="sm" onClick={()=>setViewMode('map-list')}>
                <MapIcon className="w-4 h-4 mr-1" /> Map + List
              </Button>
              <Button variant={viewMode==='list'?"default":"outline"} size="sm" onClick={()=>setViewMode('list')}>
                <List className="w-4 h-4 mr-1" /> List Only
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className={`transition-all duration-200 overflow-hidden ${showFilters ? "max-h-[28rem] mt-4" : "max-h-0"}`}>
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age Group</label>
                  <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="All ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ages</SelectItem>
                      <SelectItem value="Infant">Infant (0-12 months)</SelectItem>
                      <SelectItem value="Toddler">Toddler (1-3 years)</SelectItem>
                      <SelectItem value="Preschool">Preschool (3-5 years)</SelectItem>
                      <SelectItem value="School Age">School Age (5-12 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Facility Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="Home-based">Home-based</SelectItem>
                      <SelectItem value="Center-based">Center-based</SelectItem>
                      <SelectItem value="Nursery School">Nursery School</SelectItem>
                      <SelectItem value="Co-op Center">Co-op Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any availability</SelectItem>
                      <SelectItem value="Immediate">Immediate</SelectItem>
                      <SelectItem value="1-3 months">1-3 months</SelectItem>
                      <SelectItem value="3+ months">3+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Radius</label>
                  <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="2">2 km</SelectItem>
                      <SelectItem value="3">3 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="8">8 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hours</label>
                  <Select value={selectedHours} onValueChange={(v)=>setSelectedHours(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                      <SelectItem value="half-day">Half-day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subsidy</label>
                  <Select value={selectedSubsidy} onValueChange={(v)=>setSelectedSubsidy(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="yes">Accepted</SelectItem>
                      <SelectItem value="no">Not accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <main className="container mx-auto px-4 py-6">
        {viewMode === 'map-list' && (
          <div className="bg-white rounded-lg shadow-sm p-3 mb-6">
            <ClientMap
              height={260}
              markers={filteredProviders
                .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
                .map(p => ({
                  id: p.id,
                  position: { lat: p.lat as number, lng: p.lng as number },
                  label: `${p.name} · ${p.availability}`,
                  color: getMarkerHexByAvailability(p.availability),
                }))}
              onMarkerClick={(id) => {
                if (id) router.push(`/provider/${id}`)
              }}
            />
            <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#16a34a' }} />
                <span>immediate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#eab308' }} />
                <span>1-6 months wait</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#dc2626' }} />
                <span>6+ months wait</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Childcare Providers Near You</h1>
            <p className="text-muted-foreground">{filteredProviders.length} providers found in Springfield</p>
          </div>
          <Select defaultValue="distance">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Sort by Distance</SelectItem>
              <SelectItem value="rating">Sort by Rating</SelectItem>
              <SelectItem value="price">Sort by Price</SelectItem>
              <SelectItem value="availability">Sort by Availability</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Provider Cards */}
  <div className="grid gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-border">
              <div className="md:flex">
                {/* 图片已移除 */}
                <div className="flex-1 min-w-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl mb-1 truncate">{provider.name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            {provider.distance}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            {provider.rating} ({provider.reviewCount} reviews)
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{provider.address}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(provider.id)}
                        className="text-muted-foreground hover:text-red-500 flex-shrink-0"
                      >
                        <Heart className={`w-5 h-5 ${provider.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">{provider.description}</CardDescription>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{provider.type}</Badge>
                        {provider.ageGroups.map((age) => (
                          <Badge key={age} variant="outline">
                            {age}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {provider.tuitionRange}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {provider.openSpots} spots available
                          </span>
                        </div>
                        <Badge className={getAvailabilityColor(provider.availability)}>
                          <Clock className="w-3 h-3 mr-1" />
                          {provider.availability}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {feature}
                          </span>
                        ))}
                        {provider.subsidyAccepted && (
                          <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3 mr-1" /> Subsidy accepted
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => (window.location.href = `/provider/${provider.id}`)}
                        >
                          View Details
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Apply Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more options.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedAgeGroup("all")
                setSelectedType("all")
                setSelectedAvailability("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
