/** Public OpenAPI 3.0 contract for third-party integrators. Served at GET /api/v1/openapi.json */
export const DOVA_OPENAPI = {
  openapi: '3.0.3',
  info: {
    title: 'DOVA Marketplace API',
    version: '1.0.0',
    description:
      'REST API for the DOVA food-supply marketplace (Nigeria, NGN, Paystack). All JSON routes are under /api/v1.',
    contact: { name: 'DOVA', url: 'https://dova.dntech.id' },
  },
  servers: [
    { url: 'https://api.dova.dntech.id/api/v1', description: 'Production' },
    { url: 'http://localhost:3000/api/v1', description: 'Local' },
  ],
  tags: [
    { name: 'Discovery' },
    { name: 'Catalog' },
    { name: 'Auth' },
    { name: 'Cart' },
    { name: 'Orders' },
    { name: 'Payments' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['Discovery'],
        summary: 'API index',
        responses: { '200': { description: 'Service metadata and OpenAPI URL' } },
      },
    },
    '/health': {
      get: {
        tags: ['Discovery'],
        summary: 'Liveness',
        responses: { '200': { description: '{ status, service }' } },
      },
    },
    '/openapi.json': {
      get: {
        tags: ['Discovery'],
        summary: 'This OpenAPI document',
        responses: { '200': { description: 'OpenAPI 3.0 JSON' } },
      },
    },
    '/categories': {
      get: {
        tags: ['Catalog'],
        summary: 'List product categories',
        responses: { '200': { description: 'Array of { id, name }' } },
      },
    },
    '/products': {
      get: {
        tags: ['Catalog'],
        summary: 'List in-stock products',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: '{ data, pagination }' } },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Catalog'],
        summary: 'Product detail',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product' }, '404': { description: 'Not found' } },
      },
    },
    '/auth/send-registration-code': {
      post: {
        tags: ['Auth'],
        summary: 'Email a 6-digit registration OTP',
        responses: { '200': { description: 'Code sent' }, '400': { description: 'Invalid or duplicate email' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create customer account (requires OTP)',
        responses: { '201': { description: 'Session (Nest may return 200)' }, '400': { description: 'Validation or OTP' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login; returns accessToken and refreshToken',
        responses: { '200': { description: 'Session' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate access token',
        responses: { '200': { description: 'New session' }, '401': { description: 'Invalid refresh' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'User' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Current cart',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: '{ items, total }' } },
      },
    },
    '/cart/add': {
      post: {
        tags: ['Cart'],
        summary: 'Add line item',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Updated cart' }, '400': { description: 'Validation' } },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List my orders',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Order array' } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create order from cart',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Order' }, '400': { description: 'Min order or empty cart' } },
      },
    },
    '/payments/initialize': {
      post: {
        tags: ['Payments'],
        summary: 'Start Paystack (or mock) checkout',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: '{ authorization_url, reference, mode }' } },
      },
    },
    '/payments/verify': {
      get: {
        tags: ['Payments'],
        summary: 'Confirm payment by reference',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'reference', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Paid or pending' }, '400': { description: 'Failed' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
} as const;
