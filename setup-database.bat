@echo off
echo Setting up MySQL database 'restro'...
echo Please make sure MySQL is running before proceeding.
pause

mysql -u root -pEkansh123 < create-restro-database.sql

echo.
echo Database setup complete!
echo You can now view the 'restro' database in MySQL Workbench
pause