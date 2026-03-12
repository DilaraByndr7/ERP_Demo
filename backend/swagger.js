import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP Backend API',
      version: '1.0.0',
      description: 'ERP Demo Backend API Dokümantasyonu',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        CariAccount: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            code: { type: 'string', example: 'CARI-001' },
            name: { type: 'string', example: 'ABC İnşaat A.Ş.' },
            type: { type: 'string', enum: ['İşveren', 'Taşeron', 'Tedarikçi'] },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            taxNo: { type: 'string' },
            taxOffice: { type: 'string' },
            balance: { type: 'number', minimum: 0 },
            balanceType: { type: 'string', enum: ['Borç', 'Alacak'] },
            isRisky: { type: 'boolean' },
            dueDate: { type: 'string', format: 'date' },
            nextPaymentDate: { type: 'string', format: 'date' },
            nextPaymentAmount: { type: 'number', minimum: 0 },
            notes: { type: 'string' },
            documents: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
            transactions: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            uploadDate: { type: 'string', format: 'date' },
            fileUrl: { type: 'string' },
            fileSize: { type: 'number' },
            originalName: { type: 'string' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            date: { type: 'string', format: 'date' },
            amount: { type: 'number' },
            status: { type: 'string' },
            description: { type: 'string' },
            reference: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  
  apis: ['./routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)
