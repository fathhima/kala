export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayFailureResponse {
  error: {
    code: string
    description: string
    source: string
    step: string
    reason: string
    metadata: {
      order_id: string
      payment_id: string
    }
  }
}

export interface RazorpayCheckoutOptions {
  key: string
  amount?: number
  currency?: string
  name: string
  description?: string
  image?: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    backdropclose?: boolean
  }
  retry?: {
    enabled?: boolean
    max_count?: number
  }
  handler: (response: RazorpaySuccessResponse) => void
  onFailure?: (response: RazorpayFailureResponse) => void
}

let scriptLoadingPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as any).Razorpay) return Promise.resolve(true)
  if (scriptLoadingPromise) return scriptLoadingPromise

  scriptLoadingPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptLoadingPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return scriptLoadingPromise
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<void> {
  const isLoaded = await loadRazorpayScript()
  if (!isLoaded) {
    throw new Error(
      'Unable to load Razorpay payment gateway. Please check your internet connection.',
    )
  }

  const RazorpayConstructor = (window as any).Razorpay
  if (!RazorpayConstructor) {
    throw new Error('Razorpay SDK is not available.')
  }

  const { onFailure, retry, ...razorpayConfig } = options

  const instance = new RazorpayConstructor({
    ...razorpayConfig,
    retry: {
      enabled: retry?.enabled ?? false,
      max_count: retry?.max_count,
    },
    theme: {
      color: options.theme?.color || '#D97706',
    },
  })

  if (onFailure) {
    instance.on('payment.failed', (response: RazorpayFailureResponse) => {
      try {
        instance.close()
      } catch {
        // ignore if already closed
      }
      onFailure(response)
    })
  }

  instance.open()
}

