#!/bin/bash
# Script to run the add_drift_category database migration

echo "Inserting/updating 'Drift RC' category in the database..."
node scratch/add_drift_category.js
echo "Migration completed!"
