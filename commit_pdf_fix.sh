#!/bin/bash
cd /home/ubuntu/innova-scoring
git add .
git commit -m "Fix: Correct jsPDF type access for getNumberOfPages to fix Vercel build"
git push origin main
