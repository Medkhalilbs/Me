export function getProficiencyPct(level: string): number {
  switch (level.toLowerCase()) {
    case 'native': return 100
    case 'fluent': return 90
    case 'professional': return 75
    case 'intermediate': return 55
    case 'basic': return 35
    default: return 50
  }
}

export function formatProficiency(level: string): string {
  switch (level.toLowerCase()) {
    case 'native': return 'Native Speaker'
    case 'fluent': return 'Fluent'
    case 'professional': return 'Professional Working'
    case 'intermediate': return 'Intermediate'
    case 'basic': return 'Elementary'
    default: return level.charAt(0).toUpperCase() + level.slice(1)
  }
}
