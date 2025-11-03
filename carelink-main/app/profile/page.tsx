"use client";
import { normalizeChildKeys, type ChildV2 } from "../../lib/children";
import { ChildNotesEditor } from "../../components/child/ChildNotesEditor";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Heart,
  User,
  Baby,
  FileText,
  Settings,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Shield,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
} from "lucide-react";

type SpecialDetails = {
  healthSafety?: string;
  behaviorEmotions?: string;
  routineFood?: string;
  learningActivities?: string;
  parentNotes?: string;
};

// Blank profile for new users (will be overridden by localStorage if present)
const userProfile = {
  id: 1,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  placeOfWork: "",
  workAddress: "",
  city: "",
  province: "",
  postalCode: "",
  emergencyContact1Name: "",
  emergencyContact1Phone: "",
  emergencyContact2Name: "",
  emergencyContact2Phone: "",
  profileImage: "/placeholder.svg?height=100&width=100",
  joinDate: "",
};

const childProfiles: any[] = [];

const notificationSettings = {
  applicationUpdates: false,
  messageNotifications: false,
  availabilityAlerts: false,
  marketingEmails: false,
  smsNotifications: false,
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null
  );
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("user")) {
      setUser(JSON.parse(window.localStorage.getItem("user")!));
    } else {
      setUser(null);
    }
    setAuthChecked(true);
  }, []);
  function handleLogout() {
    setUser(null);
    if (typeof window !== "undefined") window.localStorage.removeItem("user");
    router.push("/");
  }
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [editedChildren, setEditedChildren] = useState(childProfiles);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [useRemote, setUseRemote] = useState<boolean>(false);

  const [objectPhotoUrl, setObjectPhotoUrl] = useState<string | null>(null);

  const PROFILE_KEY = "profileData";
  const CHILDREN_KEY = "childrenData";
  const NOTIFY_KEY = "notifySettings";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectPhoto = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handlePhotoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("please select an image smaller than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setEditedProfile((prev) => ({ ...prev, profileImage: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const profileToSave = {
      ...editedProfile,
      joinDate: editedProfile.joinDate || new Date().toISOString(),
    };
    setEditedProfile(profileToSave);
    try {
      const currentUser =
        typeof window !== "undefined"
          ? window.localStorage.getItem("currentUser") ||
            (window.localStorage.getItem("user") &&
              JSON.parse(window.localStorage.getItem("user") as string)?.email)
          : null;
      const email = typeof currentUser === "string" ? currentUser : null;
      const hasSupabase =
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (hasSupabase && email) {
        // Save main profile
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, profile: profileToSave }),
        });
        // Save children list
        await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, children: editedChildren }),
        });
        // Save notification settings
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, notify: notifications }),
        });
      } else if (typeof window !== "undefined") {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profileToSave));
        window.localStorage.setItem(
          CHILDREN_KEY,
          JSON.stringify(editedChildren)
        );
        window.localStorage.setItem(NOTIFY_KEY, JSON.stringify(notifications));
      }
    } catch (err) {
      console.warn("保存本地数据失败", err);
    }
    setIsEditing(false);
  };

  // Load persisted data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hasSupabase =
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      setUseRemote(hasSupabase);
      const currentUser =
        window.localStorage.getItem("currentUser") ||
        (window.localStorage.getItem("user") &&
          JSON.parse(window.localStorage.getItem("user") as string)?.email);
      const email = typeof currentUser === "string" ? currentUser : null;
      if (hasSupabase && email) {
        Promise.all([
          fetch(`/api/profile?email=${encodeURIComponent(email)}`)
            .then((r) => r.json())
            .catch(() => ({})),
          fetch(`/api/children?email=${encodeURIComponent(email)}`)
            .then((r) => r.json())
            .catch(() => ({})),
          fetch(`/api/notify?email=${encodeURIComponent(email)}`)
            .then((r) => r.json())
            .catch(() => ({})),
        ])
          .then(([pResp, cResp, nResp]) => {
            const p = pResp?.profile;
            const children = cResp?.children;
            const notify = nResp?.notify;
            if (p) setEditedProfile({ ...userProfile, ...p });
            if (Array.isArray(children))
              setEditedChildren(children.map((row: any) => row.data ?? row));
            if (notify) setNotifications(notify);
            // If any missing, try local fallbacks
            if (!p) {
              const storedProfile = window.localStorage.getItem(PROFILE_KEY);
              if (storedProfile)
                try {
                  setEditedProfile(JSON.parse(storedProfile));
                } catch {}
            }
            if (!Array.isArray(children)) {
              const storedChildren = window.localStorage.getItem(CHILDREN_KEY);
              if (storedChildren)
                try {
                  setEditedChildren(JSON.parse(storedChildren));
                } catch {}
            }
            if (!notify) {
              const storedNotify = window.localStorage.getItem(NOTIFY_KEY);
              if (storedNotify)
                try {
                  setNotifications(JSON.parse(storedNotify));
                } catch {}
            }
          })
          .catch(() => {
            // fallback local entirely
            const storedProfile = window.localStorage.getItem(PROFILE_KEY);
            const storedChildren = window.localStorage.getItem(CHILDREN_KEY);
            const storedNotify = window.localStorage.getItem(NOTIFY_KEY);
            if (storedProfile)
              try {
                setEditedProfile(JSON.parse(storedProfile));
              } catch {}
            if (storedChildren)
              try {
                setEditedChildren(JSON.parse(storedChildren));
              } catch {}
            if (storedNotify)
              try {
                setNotifications(JSON.parse(storedNotify));
              } catch {}
          });
      } else {
        const storedProfile = window.localStorage.getItem(PROFILE_KEY);
        const storedChildren = window.localStorage.getItem(CHILDREN_KEY);
        const storedNotify = window.localStorage.getItem(NOTIFY_KEY);
        if (storedProfile) {
          try {
            setEditedProfile(JSON.parse(storedProfile));
          } catch {}
        }
        if (storedChildren) {
          try {
            setEditedChildren(JSON.parse(storedChildren));
          } catch {}
        }
        if (storedNotify) {
          try {
            setNotifications(JSON.parse(storedNotify));
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Failed to read local data", err);
    }
  }, []);

  const handleAddChild = () => {
    const newChild = {
      id: editedChildren.length + 1,
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      ageGroup: "",
      allergies: "",
      medicalConditions: "",
      specialNeeds: "",
      currentProvider: "",
      profileImage: "/placeholder.svg?height=80&width=80",
      documents: [] as any[],
    };
    setEditedChildren([...editedChildren, newChild]);
  };

  const handleUpdateChild = (childId: number, field: string, value: string) => {
    setEditedChildren(
      editedChildren.map((child) =>
        child.id === childId ? { ...child, [field]: value } : child
      )
    );
  };

  const handleDeleteChild = (childId: number) => {
    setEditedChildren(editedChildren.filter((child) => child.id !== childId));
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "medical":
        return "🏥";
      case "legal":
        return "📋";
      case "image":
        return "🖼️";
      case "pdf":
        return "📑";
      default:
        return "📄";
    }
  };

  const inferDocType = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext) return "other";
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx", "rtf"].includes(ext)) return "legal";
    return "other";
  };

  const handleUploadDocs = (childId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newDocs = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).slice(2),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString(),
        type: inferDocType(file),
        objectUrl: url,
        fileRef: file,
      };
    });
    setEditedChildren(
      editedChildren.map((c) =>
        c.id === childId ? { ...c, documents: [...c.documents, ...newDocs] } : c
      )
    );
  };

  const handleDeleteDoc = (childId: number, docId: string) => {
    setEditedChildren(
      editedChildren.map((c) => {
        if (c.id !== childId) return c;
        const doc = c.documents.find((d: any) => d.id === docId);
        if (doc?.objectUrl) URL.revokeObjectURL(doc.objectUrl);
        return {
          ...c,
          documents: c.documents.filter((d: any) => d.id !== docId),
        };
      })
    );
  };

  const handleDownloadDoc = (doc: any) => {
    const link = document.createElement("a");
    link.href = doc.objectUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const NumberBadge = ({ n }: { n: number }) => (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold mr-2 align-middle">
      {n}
    </span>
  );
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div
                className="cursor-pointer"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.localStorage.getItem("user")
                  ) {
                    router.push("/search");
                  } else {
                    router.push("/login");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src="/CareLink%20logo4.png"
                    alt="CareLink"
                    className="h-8 w-auto"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder-logo.png";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {/* Auth guard (client-only) */}
        {authChecked && !user && (
          <div className="max-w-xl mx-auto text-center p-6 border rounded-lg bg-white shadow-sm">
            <p className="mb-4">Please log in to view your profile.</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        )}
        {/* Profile Actions */}
        {user !== null && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm py-4 px-4 flex justify-center z-40">
            {isEditing ? (
              <div className="flex gap-3 w-full max-w-md">
                <Button
                  variant="outline"
                  className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSaveProfile}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 w-full max-w-md">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar
                  className="w-24 h-24 cursor-pointer"
                  onClick={isEditing ? handleSelectPhoto : undefined}
                  title={isEditing ? "Click to change photo" : undefined}
                >
                  <AvatarImage
                    src={editedProfile.profileImage || "/placeholder.svg"}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl">
                    {(editedProfile.firstName || "U").charAt(0)}
                    {(editedProfile.lastName || "N").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">
                    {editedProfile.firstName} {editedProfile.lastName}
                  </h1>
                  <p className="text-muted-foreground">{editedProfile.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-white text-gray-700 border-gray-200"
                    >
                      Parent
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Member since{" "}
                      {editedProfile.joinDate
                        ? new Date(editedProfile.joinDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    type="button"
                    onClick={handleSelectPhoto}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-200 rounded-md p-1">
              <TabsTrigger
                value="personal"
                className="flex items-center text-foreground hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="children"
                className="flex items-center text-foreground hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                <Baby className="w-4 h-4 mr-2" />
                Children
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center text-foreground hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center text-foreground hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Your primary contact details for providers to reach you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedProfile.firstName}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            firstName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedProfile.lastName}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            lastName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editedProfile.phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Home Address</Label>
                    <Input
                      id="address"
                      value={editedProfile.address}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editedProfile.city}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            city: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Select
                        value={editedProfile.province || ""}
                        onValueChange={(value) =>
                          setEditedProfile({
                            ...editedProfile,
                            province: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MB">MB</SelectItem>
                          <SelectItem value="ON">ON</SelectItem>
                          <SelectItem value="BC">BC</SelectItem>
                          <SelectItem value="AB">AB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={editedProfile.postalCode}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            postalCode: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="placeOfWork">Place of Work</Label>
                      <Input
                        id="placeOfWork"
                        value={editedProfile.placeOfWork}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            placeOfWork: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workAddress">Work Address</Label>
                      <Input
                        id="workAddress"
                        value={editedProfile.workAddress}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            workAddress: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>
                    Priority contacts in case of emergency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact1Name">
                        Priority #1 Name
                      </Label>
                      <Input
                        id="emergencyContact1Name"
                        value={editedProfile.emergencyContact1Name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact1Name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact1Phone">
                        Priority #1 Phone
                      </Label>
                      <Input
                        id="emergencyContact1Phone"
                        value={editedProfile.emergencyContact1Phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact1Phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact2Name">
                        Priority #2 Name
                      </Label>
                      <Input
                        id="emergencyContact2Name"
                        value={editedProfile.emergencyContact2Name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact2Name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact2Phone">
                        Priority #2 Phone
                      </Label>
                      <Input
                        id="emergencyContact2Phone"
                        value={editedProfile.emergencyContact2Phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact2Phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Children Tab */}
            <TabsContent value="children" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    Child Profiles
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage information about your children
                  </p>
                </div>
                <Button onClick={handleAddChild}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child
                </Button>
              </div>

              {editedChildren.map((child, idx) => (
                <Card key={child.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={child.profileImage || "/placeholder.svg"}
                            alt={child.firstName}
                          />
                          <AvatarFallback>
                            {child.firstName[0]}
                            {child.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>
                            {child.firstName} {child.lastName}
                          </CardTitle>
                          <CardDescription>
                            {child.ageGroup} • Born{" "}
                            {new Date(child.dateOfBirth).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteChild(child.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={child.firstName}
                          onChange={(e) =>
                            handleUpdateChild(
                              child.id,
                              "firstName",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={child.lastName}
                          onChange={(e) =>
                            handleUpdateChild(
                              child.id,
                              "lastName",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={child.dateOfBirth}
                          onChange={(e) =>
                            handleUpdateChild(
                              child.id,
                              "dateOfBirth",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Age Group</Label>
                        <Select
                          value={child.ageGroup}
                          onValueChange={(value) =>
                            handleUpdateChild(child.id, "ageGroup", value)
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Infant">
                              Infant (0-12 months)
                            </SelectItem>
                            <SelectItem value="Toddler">
                              Toddler (1-3 years)
                            </SelectItem>
                            <SelectItem value="Preschool">
                              Preschool (3-5 years)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Allergies</Label>
                      <Textarea
                        value={child.allergies}
                        onChange={(e) =>
                          handleUpdateChild(
                            child.id,
                            "allergies",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Medical Conditions</Label>
                      <Textarea
                        value={child.medicalConditions}
                        onChange={(e) =>
                          handleUpdateChild(
                            child.id,
                            "medicalConditions",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base">Special Details</Label>
                      {(() => {
                        const normalized = normalizeChildKeys(child as any);
                        const sd: Partial<SpecialDetails> =
                          typeof normalized.specialDetails === "object" &&
                          normalized.specialDetails !== null
                            ? (normalized.specialDetails as Partial<SpecialDetails>)
                            : {};
                        const healthSafety = sd.healthSafety ?? "";
                        const behaviorEmotions = sd.behaviorEmotions ?? "";
                        const routineFood = sd.routineFood ?? "";
                        const learningActivities = sd.learningActivities ?? "";
                        const parentNotes =
                          typeof normalized.specialDetails === "string"
                            ? normalized.specialDetails
                            : sd.parentNotes ?? "";
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm inline-flex items-center">
                                <NumberBadge n={1} /> Health & Safety
                              </Label>
                              <Textarea
                                placeholder="e.g. Peanut allergy… inhaler daily… doctor: Dr. Chen (204-555-7890)…"
                                disabled={!isEditing}
                                rows={3}
                                value={healthSafety}
                                onChange={(e) => {
                                  const next = {
                                    healthSafety: e.target.value,
                                    behaviorEmotions,
                                    routineFood,
                                    learningActivities,
                                    parentNotes,
                                  };
                                  handleUpdateChild(
                                    child.id,
                                    "specialDetails",
                                    next as any
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm inline-flex items-center">
                                <NumberBadge n={2} /> Behavior & Emotions
                              </Label>
                              <Textarea
                                placeholder="e.g. Cheerful but shy… upset when too loud… calms with music or hugs…"
                                disabled={!isEditing}
                                rows={3}
                                value={behaviorEmotions}
                                onChange={(e) => {
                                  const next = {
                                    healthSafety,
                                    behaviorEmotions: e.target.value,
                                    routineFood,
                                    learningActivities,
                                    parentNotes,
                                  };
                                  handleUpdateChild(
                                    child.id,
                                    "specialDetails",
                                    next as any
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm inline-flex items-center">
                                <NumberBadge n={3} /> Routine & Food
                              </Label>
                              <Textarea
                                placeholder="e.g. Loves pasta… dislikes spicy food… naps 12:30-2:00 PM… needs help with zippers…"
                                disabled={!isEditing}
                                rows={3}
                                value={routineFood}
                                onChange={(e) => {
                                  const next = {
                                    healthSafety,
                                    behaviorEmotions,
                                    routineFood: e.target.value,
                                    learningActivities,
                                    parentNotes,
                                  };
                                  handleUpdateChild(
                                    child.id,
                                    "specialDetails",
                                    next as any
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm inline-flex items-center">
                                <NumberBadge n={4} /> Learning & Activities
                              </Label>
                              <Textarea
                                placeholder="e.g. Enjoys drawing and singing… dislikes messy play… loves cars and animals…"
                                disabled={!isEditing}
                                rows={3}
                                value={learningActivities}
                                onChange={(e) => {
                                  const next = {
                                    healthSafety,
                                    behaviorEmotions,
                                    routineFood,
                                    learningActivities: e.target.value,
                                    parentNotes,
                                  };
                                  handleUpdateChild(
                                    child.id,
                                    "specialDetails",
                                    next as any
                                  );
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-sm inline-flex items-center">
                                <NumberBadge n={5} /> Parent Notes
                              </Label>
                              <Textarea
                                placeholder="e.g. Morning routine… comfort toy… special instructions…"
                                disabled={!isEditing}
                                rows={3}
                                value={parentNotes}
                                onChange={(e) => {
                                  const next = {
                                    healthSafety,
                                    behaviorEmotions,
                                    routineFood,
                                    learningActivities,
                                    parentNotes: e.target.value,
                                  };
                                  handleUpdateChild(
                                    child.id,
                                    "specialDetails",
                                    next as any
                                  );
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Document Library</CardTitle>
                      <CardDescription>
                        Upload and manage important documents for your children
                      </CardDescription>
                    </div>
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {editedChildren.map((child) => (
                      <div key={child.id}>
                        <h4 className="font-semibold mb-3">
                          {child.firstName} {child.lastName}
                        </h4>
                        {child.documents.length > 0 ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {child.documents.map((doc: any) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-2xl">
                                      {getDocumentIcon(doc.type)}
                                    </span>
                                    <div>
                                      <p className="font-medium">{doc.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Uploaded{" "}
                                        {new Date(
                                          doc.uploadDate
                                        ).toLocaleDateString()}{" "}
                                        • {doc.size}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDownloadDoc(doc)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteDoc(child.id, doc.id)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div>
                              <input
                                id={`upload-${child.id}`}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) =>
                                  handleUploadDocs(child.id, e.target.files)
                                }
                                disabled={!isEditing}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                disabled={!isEditing}
                                onClick={() =>
                                  document
                                    .getElementById(`upload-${child.id}`)
                                    ?.click()
                                }
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {child.documents.length ? "Add More" : "Upload"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground py-2">
                              No documents uploaded yet
                            </p>
                            <div>
                              <input
                                id={`upload-${child.id}`}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) =>
                                  handleUploadDocs(child.id, e.target.files)
                                }
                                disabled={!isEditing}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                disabled={!isEditing}
                                onClick={() =>
                                  document
                                    .getElementById(`upload-${child.id}`)
                                    ?.click()
                                }
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        )}
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive updates and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Application Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about application status changes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.applicationUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          applicationUpdates: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Message Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when providers send messages
                      </p>
                    </div>
                    <Switch
                      checked={notifications.messageNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          messageNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Availability Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerts when new spots become available
                      </p>
                    </div>
                    <Switch
                      checked={notifications.availabilityAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          availabilityAlerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates via text message
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          smsNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive tips and updates about childcare
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          marketingEmails: checked,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Change Password</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control how your information is shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow providers to see your profile information
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Share anonymized data to improve our services
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
