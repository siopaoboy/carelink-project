export type ChildV2 = {
  name?: string
  dob?: string
  gender?: string
  // unified
  specialDetails?: string
  // legacy (read-only)
  specialNeeds?: string
  // optional five sections (keep if you use them elsewhere)
  healthSafety?: string
  behaviorEmotions?: string
  routineFood?: string
  learningActivities?: string
  parentNotes?: string
  [k: string]: any
}

export function normalizeChildKeys<T extends Record<string, any>>(c: T): ChildV2 {
  const child: ChildV2 = { ...(c as any) }
  if (child.specialNeeds && !child.specialDetails) {
    child.specialDetails = child.specialNeeds
  }
  delete (child as any).specialNeeds
  return child
}

// Optional: if you keep five sections, move details into Parent Notes when no new fields exist
export function upgradeChildV1toV2<T extends Record<string, any>>(c: T): ChildV2 {
  const child = normalizeChildKeys(c)
  const noneNew =
    !child.healthSafety &&
    !child.behaviorEmotions &&
    !child.routineFood &&
    !child.learningActivities &&
    !child.parentNotes
  if (child.specialDetails && noneNew) {
    child.parentNotes = child.specialDetails
  }
  return child
}