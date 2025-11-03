"use client"

import * as React from "react"
import type { ChildV2 } from "../../lib/children"

type Props = {
  child: ChildV2
  onChange: (patch: Partial<ChildV2>) => void
  disabled?: boolean
}

export function ChildNotesEditor({ child, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">1) Health & Safety</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
          placeholder="e.g., Peanut allergy, takes inhaler daily, doctor: Dr. Chen (204-555-7890)"
          value={child.healthSafety || ""}
          onChange={(e) => onChange({ healthSafety: e.target.value })}
          rows={3}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">2) Behavior & Emotions</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
          placeholder="e.g., Cheerful but shy, upset when too loud, calms with music or hugs"
          value={child.behaviorEmotions || ""}
          onChange={(e) => onChange({ behaviorEmotions: e.target.value })}
          rows={3}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">3) Routine & Food</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
          placeholder="e.g., Loves pasta, dislikes spicy food, naps 12:30–2:00 PM, needs help with zippers"
          value={child.routineFood || ""}
          onChange={(e) => onChange({ routineFood: e.target.value })}
          rows={3}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">4) Learning & Activities</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
          placeholder="e.g., Enjoys drawing and singing, dislikes messy play, loves cars and animals"
          value={child.learningActivities || ""}
          onChange={(e) => onChange({ learningActivities: e.target.value })}
          rows={3}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">5) Parent Notes</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
          placeholder="e.g., Morning routine, comfort toy, special instructions"
          value={child.parentNotes || ""}
          onChange={(e) => onChange({ parentNotes: e.target.value })}
          rows={3}
          disabled={disabled}
        />
      </div>
    </div>
  )
}