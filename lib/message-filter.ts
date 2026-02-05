// Content filter to prevent sharing personal contact information

const EMAIL_REGEX = /[\w\.-]+@[\w\.-]+\.\w+/gi
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g
const URL_REGEX = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi

export function filterPersonalInfo(content: string): {
  filtered: string
  containsBlockedContent: boolean
  blockedItems: string[]
} {
  const blockedItems: string[] = []
  let filtered = content

  // Detect and block email addresses
  const emails = content.match(EMAIL_REGEX)
  if (emails) {
    blockedItems.push(...emails)
    filtered = filtered.replace(EMAIL_REGEX, '[Contact information blocked]')
  }

  // Detect and block phone numbers
  const phones = content.match(PHONE_REGEX)
  if (phones) {
    // Filter out false positives (like years, IDs)
    const validPhones = phones.filter(
      phone => phone.length >= 10 && !phone.match(/^\d{4}$/) && !phone.match(/^\d{5,}$/)
    )
    if (validPhones.length > 0) {
      blockedItems.push(...validPhones)
      filtered = filtered.replace(PHONE_REGEX, '[Contact information blocked]')
    }
  }

  // Detect and block URLs (except if they're from known safe domains)
  const urls = content.match(URL_REGEX)
  if (urls) {
    // Allow certain safe domains
    const safeDomains = ['shadikhanabadi.com', 'localhost']
    const unsafeUrls = urls.filter(url => {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
      return !safeDomains.some(safe => domain.includes(safe))
    })
    if (unsafeUrls.length > 0) {
      blockedItems.push(...unsafeUrls)
      filtered = filtered.replace(URL_REGEX, (match) => {
        const domain = new URL(match.startsWith('http') ? match : `https://${match}`).hostname
        if (safeDomains.some(safe => domain.includes(safe))) {
          return match
        }
        return '[External link blocked]'
      })
    }
  }

  return {
    filtered,
    containsBlockedContent: blockedItems.length > 0,
    blockedItems,
  }
}