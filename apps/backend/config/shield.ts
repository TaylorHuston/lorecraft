import { defineConfig } from '@adonisjs/shield'
import type { CsrfOptions } from '@adonisjs/shield/types'

export const browserCsrfOptions = {
  enabled: true,
  exceptRoutes: [],
  enableXsrfCookie: true,
  methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
} satisfies CsrfOptions

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more.
   */
  csp: {
    /**
     * Enable the Content-Security-Policy header.
     */
    enabled: false,

    /**
     * Per-resource CSP directives.
     */
    directives: {},

    /**
     * Report violations without blocking resources.
     */
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more.
   */
  csrf: {
    /**
     * Enable CSRF token verification for state-changing requests.
     */
    enabled: false,

    /**
     * Route patterns to exclude from CSRF checks.
     * Useful for external webhooks or API endpoints.
     */
    exceptRoutes: browserCsrfOptions.exceptRoutes,

    /**
     * Expose an encrypted XSRF-TOKEN cookie for frontend HTTP clients.
     */
    enableXsrfCookie: browserCsrfOptions.enableXsrfCookie,

    /**
     * HTTP methods protected by CSRF validation.
     */
    methods: browserCsrfOptions.methods,
  },

  /**
   * Control how your website should be embedded inside
   * iframes.
   */
  xFrame: {
    /**
     * Enable the X-Frame-Options header.
     */
    enabled: true,

    /**
     * Block all framing attempts. Default value is DENY.
     */
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS.
   */
  hsts: {
    /**
     * Enable the Strict-Transport-Security header.
     */
    enabled: true,

    /**
     * HSTS policy duration remembered by browsers.
     */
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing content types and rely only
   * on the response content-type header.
   */
  contentTypeSniffing: {
    /**
     * Enable X-Content-Type-Options: nosniff.
     */
    enabled: true,
  },
})

export default shieldConfig
