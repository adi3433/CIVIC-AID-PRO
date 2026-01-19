@echo off
git remote remove origin
git remote add origin https://github.com/adi3433/CIVIC-AID-PRO.git
git add .
git commit -m "Migrate to CIVIC-AID-PRO"
git branch -M main
git push -u origin main
