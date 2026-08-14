import mongoose from 'mongoose'

/**
 * SiteSchema.js
 *
 * The *structure* for a dynamic tenant — a tree of sections/fields
 * describing what's editable on that tenant's site. A tenant is
 * "dynamic" simply by having one of these documents; tenants without
 * one (demo-dental, test-qa, ...) keep using the fixed SiteContent
 * model untouched.
 *
 * Nested field definitions (inside a `list` field's `fields` array)
 * are stored as Mixed since Mongoose subdocuments can't self-reference
 * recursively — Mixed is the pragmatic native-Mongo escape hatch for a
 * shape we deliberately don't know ahead of time. A `list` field can
 * itself contain another `list` field, which is how a category-of-items
 * shape (e.g. services grouped under categories) gets represented with
 * no separate "group" type.
 */

const SectionSchema = new mongoose.Schema({
  id:     { type: String, required: true },
  label:  { type: String, required: true },
  icon:   { type: String, default: 'document' },
  tone:   { type: String, default: 'accent' },
  fields: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { _id: false })

const SiteSchemaSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  siteSlug: { type: String, required: true, unique: true },
  sections: { type: [SectionSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.SiteSchema ||
  mongoose.model('SiteSchema', SiteSchemaSchema)
