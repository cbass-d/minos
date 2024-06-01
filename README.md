## MINOS
### Mostly In-One Subnetting
Minos is a simple tool meant to facilitate the process of subnetting a network. 
With an IPv4 network addres and a mask, Minos is capable of dividing the network 
address range into the desired amount of subnets. The mask can be provided in either the
octet format (ex. 255.255.255.0) or in CIDR notation (ex \24).

![image info](./images/mask_octect_format.jpg)
![images info](./images/mask_cidr_format.jpg)

Minos provides a visual repersentation of the bits used when applying a network mask 
and when creating new subnets. 

![images info](./images/minos_bit_table.jpg)

Minos also provides the first and last host address, as well as the broadcast address of each subnet.

![images info](./images/minos_subnet_table.jpg)

### Running using Docker container
Minos can easily be ran locally using a Docker container.
Pre-requirements:
* Docker
* Docker Compose

Launching container (from minos parent directory):
```
$ docker compose up
```
Visit: http://localhost:3000 to use app

To tear down:
```
$ docker compose down
```
Port number used on host machine can be modified by making changes to `docker-compose.yaml`:
```diff
name: minos

services:
  app:
    build: .
    ports:
-      - 127.0.0.1:3000:3000
+      - 127.0.0.1:9000:3000

```
The change above modifes the port to from 3000 to 9000 on host machine

