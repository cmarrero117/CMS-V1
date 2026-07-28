import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import connectDB from '../../../lib/db'
import Tenant from '../../../lib/models/Tenant'
import SiteContent from '../../../lib/models/SiteContent'

// GET /api/admin/reset-site-content?slug=demo-dental
// Admin-only. Wipes all content fields for the given slug back to blank,
// so the site renders empty instead of another tenant's data.
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { slug } = req.query
  if (!slug) return res.status(400).json({ error: 'Missing ?slug= parameter' })

  await connectDB()

  const tenant = await Tenant.findOne({ slug }).lean()
  if (!tenant) return res.status(404).json({ error: `No tenant found for slug: ${slug}` })

  const result = await SiteContent.findOneAndUpdate(
    { siteSlug: slug, tenantId: tenant._id },
    {
      $set: {
        businessName:    tenant.name || '',
        navSubtitle:     '',
        heroHeadline:    '',
        heroSubheadline: '',
        heroCtaText:     '',
        heroCtaUrl:      '',
        aboutText:       '',
        stat1Number: '', stat1Label: '',
        stat2Number: '', stat2Label: '',
        stat3Number: '', stat3Label: '',
        stat4Number: '', stat4Label: '',
        services:        [],
        teamMembers:     [],
        testimonials:    [],
        contactPhone:    '',
        contactEmail:    '',
        contactAddress:  '',
        logoUrl:         '',
        heroImageUrl:    '',
        seoTitle:        '',
        seoDescription:  '',
        seoKeywords:     '',
        updatedAt:       new Date(),
      }
    },
    { upsert: true, new: true }
  )

  return res.status(200).json({
    message: `SiteContent for "${slug}" has been reset to blank.`,
    doc: { siteSlug: result.siteSlug, businessName: result.businessName },
  })
}
