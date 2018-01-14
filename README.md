# Docker Command Line



### Create MySQL Server
```
docker run --name mysql_db_server -e MYSQL_ROOT_PASSWORD=1234 -d mysql
docker run --name phpmyadmin -d --link mysql_db_server:db -p 8080:80 phpmyadmin/phpmyadmin
```