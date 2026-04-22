// Content moderation utility for client-side validation

const BLOCKED_PATTERNS = {
  profanity: [
    /\bf+u+c+k+/i,
    /\bs+h+i+t+/i,
    /\bb+i+t+c+h+/i,
    /\ba+s+s+h+o+l+e+/i,
    /\bc+u+n+t+/i,
    /\bd+a+m+n+/i,
    /\bh+e+l+l+/i,
    /\bc+r+a+p+/i,
    /\bp+i+s+s+/i,
    /\bb+a+s+t+a+r+d+/i,
    /\bd+i+c+k+/i,
    /\bc+o+c+k+/i,
    /\bp+u+s+s+y+/i,
  ],
  adult: [
    /\bporn/i,
    /\bxxx/i,
    /\bsex(ual)?\s+(content|service|app)/i,
    /\badult\s+content/i,
    /\bescort/i,
    /\bprostitut/i,
    /\berotic/i,
    /\bnude/i,
    /\bnaked/i,
    /\bcamgirl/i,
    /\bonlyfans/i,
    /\bdating\s+app/i,
    /\bhookup/i,
  ],
  hate: [
    /\bn+i+g+g+e+r+/i,
    /\bn+i+g+g+a+/i,
    /\bf+a+g+g+o+t+/i,
    /\bk+i+k+e+/i,
    /\bs+p+i+c+/i,
    /\bc+h+i+n+k+/i,
    /\bg+o+o+k+/i,
    /\br+e+t+a+r+d+/i,
    /\bhate\s+(speech|group)/i,
  ],
  violence: [
    /\bbomb/i,
    /\bexplosive/i,
    /\bweapon/i,
    /\bgun/i,
    /\bkill/i,
    /\bmurder/i,
    /\bterror/i,
    /\bassassin/i,
    /\bsuicide/i,
    /\bself[- ]harm/i,
  ],
  illegal: [
    /\bhack(ing)?\s+(tool|app|service)/i,
    /\bmalware/i,
    /\bransomware/i,
    /\bcrack(ing)?/i,
    /\bpirat(e|ing)/i,
    /\bsteal\s+(credential|password|data)/i,
    /\bfraud/i,
    /\bscam/i,
    /\bdrug\s+(trafficking|dealing)/i,
    /\bdarket/i,
  ],
}

export function validateContent(text) {
  const normalized = text.toLowerCase().trim()

  // Check each category
  for (const [category, patterns] of Object.entries(BLOCKED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return {
          allowed: false,
          category,
          message: getBlockMessage(category),
        }
      }
    }
  }

  return { allowed: true }
}

function getBlockMessage(category) {
  const messages = {
    profanity: 'Input blocked: please remove profanity and try again.',
    adult: 'Input blocked: adult content is not allowed.',
    hate: 'Input blocked: hate speech is not allowed.',
    violence: 'Input blocked: violent content is not allowed.',
    illegal: 'Input blocked: illegal content is not allowed.',
  }
  return messages[category] || 'Input blocked: disallowed content detected.'
}
