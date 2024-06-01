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

