import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface AnimationOptions {
  /** Stagger delay between elements in ms */
  staggerDelay?: number
  /** Base animation duration in ms */
  duration?: number
  /** Y offset for fade-up animation in px */
  yOffset?: number
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean
}

/**
 * Provides viewport-triggered reveal animations for template sections.
 * Equivalent to Framer Motion's whileInView with staggered children.
 */
export function useTemplateAnimation(
  containerRef: Ref<HTMLElement | null>,
  options: AnimationOptions = {},
) {
  const {
    staggerDelay = 70,
    duration = 700,
    yOffset = 22,
    respectReducedMotion = true,
  } = options

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Show all elements immediately
      containerRef.value.querySelectorAll('.tpl-reveal').forEach((el) => {
        ;(el as HTMLElement).style.opacity = '1'
        ;(el as HTMLElement).style.transform = 'none'
      })
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const delay = parseInt(el.dataset.delay || '0', 10)
          el.style.transitionDelay = `${delay}ms`
          el.classList.add('is-visible')
          observer?.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '-40px' },
    )

    containerRef.value.querySelectorAll('.tpl-reveal').forEach((el, i) => {
      const htmlEl = el as HTMLElement
      htmlEl.dataset.delay = String(i * staggerDelay)
      htmlEl.style.setProperty('--tpl-y', `${yOffset}px`)
      htmlEl.style.setProperty('--tpl-duration', `${duration}ms`)
      observer?.observe(htmlEl)
    })
  })

  onBeforeUnmount(() => observer?.disconnect())
}
