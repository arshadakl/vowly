import { describe, expect, it } from 'vitest'
import {
  TEMPLATE_DEFINITIONS,
  TEMPLATE_IDS,
  invitationUpdateSchema,
  templateCustomizationSchema,
  templateIdSchema,
} from './index'

describe('wedding template contracts', () => {
  it('registers 25 unique active wedding templates without retired IDs', () => {
    expect(TEMPLATE_IDS).toHaveLength(25)
    expect(new Set(TEMPLATE_IDS).size).toBe(25)
    expect(TEMPLATE_IDS).not.toContain('floral')
    expect(TEMPLATE_IDS).not.toContain('olive-grove')
  })

  it('allows an editor invitation to clear its selected template', () => {
    expect(invitationUpdateSchema.parse({ template: null }).template).toBeNull()
    expect(templateIdSchema.safeParse('olive-grove').success).toBe(false)
  })

  it('keeps the reference gallery image assigned to each template', () => {
    expect(TEMPLATE_DEFINITIONS.every((template) => template.backgroundImage.length > 0)).toBe(true)
    expect(
      TEMPLATE_DEFINITIONS.find((template) => template.id === 'jasmine-garland-south')
        ?.backgroundImage,
    ).toBe('https://i.pinimg.com/1200x/67/e1/59/67e1596c45e1a0b3229b8830a297a1a7.jpg')
  })

  it('applies safe customization defaults and enforces global text size', () => {
    const customization = templateCustomizationSchema.parse({})
    expect(customization.fontFamily).toBe('cinzel')
    expect(customization.fontSize).toBe(14)
    expect(customization.showEvents).toBe(true)
    expect(templateCustomizationSchema.safeParse({ fontSize: 27 }).success).toBe(false)
  })
})
