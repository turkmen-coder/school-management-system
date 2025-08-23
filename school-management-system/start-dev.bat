@echo off
echo Starting School Management System Development Environment...
echo.

echo [1/4] Checking dependencies...
call pnpm install --frozen-lockfile

echo.
echo [2/4] Generating Prisma Client...
cd packages\persistence
call npx prisma generate
cd ..\..

echo.
echo [3/4] Building packages...
call pnpm run build --filter="!@school/monitoring"

echo.
echo [4/4] Starting development servers...
start "API Gateway" cmd /k "cd apps\api-gateway && pnpm run start:dev"
timeout /t 2 /nobreak >nul
start "Admin Web" cmd /k "cd apps\admin-web && pnpm run dev"
timeout /t 2 /nobreak >nul
start "IAM Service" cmd /k "cd services\iam && pnpm run start:dev"
timeout /t 2 /nobreak >nul
start "CRM Service" cmd /k "cd services\crm && pnpm run start:dev"
timeout /t 2 /nobreak >nul
start "Billing Service" cmd /k "cd services\billing && pnpm run start:dev"
timeout /t 2 /nobreak >nul
start "Payments Service" cmd /k "cd services\payments && pnpm run start:dev"

echo.
echo ========================================
echo   School Management System is starting!
echo ========================================
echo.
echo Services will be available at:
echo   - API Gateway:    http://localhost:3000
echo   - Admin Web:      http://localhost:3010
echo   - IAM Service:    http://localhost:3001
echo   - CRM Service:    http://localhost:3002
echo   - Billing:        http://localhost:3003
echo   - Payments:       http://localhost:3004
echo.
echo Press any key to exit this window...
pause >nul