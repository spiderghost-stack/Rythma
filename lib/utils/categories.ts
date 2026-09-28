import { Category } from '@/types/planning'

export const CATEGORY_COLORS: Record<Category, string> = {
  physique:  '#3b82f6',  // blue-500
  python:    '#8b5cf6',  // violet-500
  cybersec:  '#f97316',  // orange-500
  espagnol:  '#22c55e',  // green-500
  basket:    '#ef4444',  // red-500
  groupe:    '#06b6d4',  // cyan-500
  repos:     '#6b7280',  // gray-500
  personnel: '#a78bfa',  // violet-400
}

export const CATEGORY_LABELS: Record<Category, string> = {
  physique:  'Physique',
  python:    'Python',
  cybersec:  'Cybersécurité',
  espagnol:  'Espagnol',
  basket:    'Basket',
  groupe:    'Groupe PF',
  repos:     'Repos',
  personnel: 'Personnel',
}

export const CATEGORY_BG: Record<Category, string> = {
  physique:  'rgba(59,130,246,0.12)',
  python:    'rgba(139,92,246,0.12)',
  cybersec:  'rgba(249,115,22,0.12)',
  espagnol:  'rgba(34,197,94,0.12)',
  basket:    'rgba(239,68,68,0.12)',
  groupe:    'rgba(6,182,212,0.12)',
  repos:     'rgba(107,114,128,0.10)',
  personnel: 'rgba(167,139,250,0.12)',
}

export const ALL_CATEGORIES: Category[] = [
  'physique',
  'python',
  'cybersec',
  'espagnol',
  'basket',
  'groupe',
  'repos',
  'personnel',
]
