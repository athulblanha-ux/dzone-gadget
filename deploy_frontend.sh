#!/bin/bash
# Script to manually deploy the client frontend to Vercel

echo "🚀 Deploying client frontend to Vercel production..."
cd client
vercel --prod
echo "✅ Deployment requested successfully!"
