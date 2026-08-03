#!/bin/bash
# Script to manually deploy the admin dashboard to Vercel

echo "🚀 Deploying admin dashboard to Vercel production..."
cd admin
vercel --prod
echo "✅ Admin deployment requested successfully!"
