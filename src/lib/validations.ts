import { z } from 'zod'

export const BookCreateSchema = z.object({
  isbn: z.string().optional().nullable(),
  isbn13: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  year: z.number().int().min(1000).max(2200).optional().nullable(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(['want_to_read', 'reading', 'read']).default('want_to_read'),
  locationId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
})

export const BookUpdateSchema = BookCreateSchema.partial()

export const NoteCreateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['note', 'quote']).default('note'),
  pageNumber: z.number().int().positive().optional().nullable(),
})

export const NoteUpdateSchema = NoteCreateSchema.partial()

export const LocationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  room: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
})

export const LocationUpdateSchema = LocationCreateSchema.partial()

export const TagCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#10b981'),
})

export const TagUpdateSchema = TagCreateSchema.partial()
