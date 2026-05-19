# HomeFinder Backend

This project now includes a simple Node.js backend that:

- serves the existing `index.html`
- exposes REST APIs for property listings and buyer inquiries
- stores application data in Amazon DynamoDB
- is designed to run cleanly on an Ubuntu EC2 instance

## Stack

- Node.js
- Express
- AWS SDK v3
- DynamoDB

## API Routes

- `GET /api/health` - health check
- `GET /api/listings` - list all properties
- `GET /api/listings/:id` - fetch one property
- `POST /api/listings` - create a property
- `DELETE /api/listings/:id` - delete a property
- `POST /api/inquiries` - create a buyer inquiry
- `GET /api/inquiries/listing/:listingId` - list inquiries for one property

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set your AWS region and DynamoDB table names
3. On EC2, prefer attaching an IAM role instead of storing access keys in `.env`

Example:

```env
PORT=3000
AWS_REGION=ap-south-1
AWS_DYNAMODB_LISTINGS_TABLE=homefinder-listings
AWS_DYNAMODB_INQUIRIES_TABLE=homefinder-inquiries
CORS_ORIGIN=*
```

## Local Run

```bash
npm install
npm start
```

The app will start on `http://localhost:3000`.

## DynamoDB Table Creation

After `npm install`, run:

```bash
node scripts/create-dynamodb-tables.js
```

This creates:

- a listings table keyed by `id`
- an inquiries table keyed by `id`
- a GSI named `listingId-createdAt-index` for looking up inquiries by listing

## EC2 Deployment Notes

Recommended Ubuntu steps:

```bash
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Then:

```bash
git clone <your-repo-url>
cd Homefinder
npm install
cp .env.example .env
node scripts/create-dynamodb-tables.js
npm start
```

For production, use a process manager such as PM2:

```bash
sudo npm install -g pm2
pm2 start src/server.js --name homefinder-api
pm2 save
pm2 startup
```

## Nginx Reverse Proxy

Example Nginx config:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Sample Request

Create a listing:

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern 2BHK Apartment",
    "type": "Apartment",
    "price": 6400000,
    "location": "Whitefield, Bengaluru",
    "beds": 2,
    "baths": 2,
    "area": 1180,
    "status": "active",
    "agent": "Priya Sharma",
    "agentInit": "PS",
    "desc": "Close to tech parks and metro access.",
    "photos": []
  }'
```

Create an inquiry:

```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "replace-with-listing-id",
    "name": "Arjun Kumar",
    "email": "arjun@example.com",
    "phone": "+91-9999999999",
    "message": "I would like to schedule a site visit."
  }'
```
