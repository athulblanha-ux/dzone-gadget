#!/bin/bash
# Script to manually deploy the client frontend to Vercel

echo "🚀 Deploying client frontend to Vercel production..."
cd client
npx -y vercel --prod
echo "✅ Deployment requested successfully!"
