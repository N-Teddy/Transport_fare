# Document Photo Module

The Document Photo module provides comprehensive document management with file upload, processing, verification, and queue management using RabbitMQ. It handles document storage, processing workflows, and verification processes for the transport fare system.

## Features

### Document Management
- **File Upload**: Single and multiple document uploads with validation
- **File Storage**: Local file system storage with organized directory structure
- **Document Types**: Support for various document types (driver license, CNI, vehicle photos, etc.)
- **Metadata Management**: Flexible metadata storage for document properties
- **File Download**: Secure document file downloads

### Processing & Verification
- **Queue-based Processing**: RabbitMQ integration for asynchronous document processing
- **Priority Processing**: Configurable processing priorities (1-10)
- **Batch Operations**: Bulk processing and verification of documents
- **Status Tracking**: Real-time processing and verification status updates
- **Verification Workflow**: Document verification with comments and rejection reasons

### Queue Management
- **RabbitMQ Integration**: Reliable message queuing for document processing
- **Multiple Queues**: Separate queues for upload, processing, and verification
- **Queue Monitoring**: Queue status and health monitoring
- **Message Persistence**: Durable messages with TTL and priority support

### Statistics & Analytics
- **Document Statistics**: Comprehensive analytics on document uploads and verifications
- **Processing Metrics**: Processing time and success rate tracking
- **Verification Analytics**: Verification status distribution and trends
- **Export Functionality**: Document data export in various formats

## API Endpoints

### File Upload

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| POST | `/documents/upload` | Upload single document | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| POST | `/documents/upload/multiple` | Upload multiple documents | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |

### Document Processing

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| POST | `/documents/process` | Process single document | ADMIN, GOVERNMENT_OFFICIAL |
| POST | `/documents/process/batch` | Process multiple documents | ADMIN, GOVERNMENT_OFFICIAL |
| PATCH | `/documents/process/status` | Update processing status | ADMIN, GOVERNMENT_OFFICIAL |

### Document Verification

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| POST | `/documents/verify` | Verify single document | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| POST | `/documents/verify/batch` | Verify multiple documents | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |

### Document Management

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| GET | `/documents` | Get all documents with filtering | All authenticated users |
| GET | `/documents/:id` | Get document by ID | All authenticated users |
| GET | `/documents/:id/download` | Download document file | All authenticated users |
| PATCH | `/documents/:id` | Update document | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| DELETE | `/documents/:id` | Delete document | ADMIN, GOVERNMENT_OFFICIAL |
| DELETE | `/documents/batch` | Delete multiple documents | ADMIN, GOVERNMENT_OFFICIAL |

### Statistics & Monitoring

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| GET | `/documents/statistics` | Get document statistics | All authenticated users |
| GET | `/documents/queue/status` | Get queue status | ADMIN, GOVERNMENT_OFFICIAL |
| POST | `/documents/export` | Export documents | ADMIN, GOVERNMENT_OFFICIAL |

## Usage Examples

### Upload Single Document
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@driver_license.jpg" \
  -F "entityType=driver" \
  -F "entityId=1" \
  -F "documentType=driver_license" \
  -F "priority=5" \
  -F "metadata={\"expiry_date\": \"2025-12-31\"}"
```

### Process Document
```bash
curl -X POST http://localhost:3000/documents/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "processingOptions": {
      "extract_text": true,
      "validate_format": true
    }
  }'
```

### Verify Document
```bash
curl -X POST http://localhost:3000/documents/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "verificationStatus": "approved",
    "comments": "Document verified successfully. All information is correct."
  }'
```

## Configuration

### Environment Variables
```env
# File Upload Configuration
MAX_UPLOAD_SIZE=5242880 # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Storage Configuration
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads
PUBLIC_STORAGE_PATH=/public

# RabbitMQ Configuration
RABBITMQ_URI=amqp://localhost:5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_VHOST=/
RABBITMQ_HEARTBEAT=60
RABBITMQ_RECONNECT_TIME=5
```

## Testing

Test the document module endpoints using Swagger UI at `/api` or use the provided curl examples above. Ensure you have:
- Proper authentication and authorization tokens
- RabbitMQ server running
- Sufficient disk space for file uploads
- Valid entity IDs for testing