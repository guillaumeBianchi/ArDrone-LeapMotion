---
```     
       __     __  __  __      __  __          __       __            __  ___    __  
   /\ |__)   |  \|__)/  \|\ ||_  |__     |   |_   /\  |__|  __  |\/|/  \  |  | /  \ |\ |
  /--\| \ .  |__/| \ \__/| \||__  __|    |__ |__ /--\ |         |  |\__/  |  | \__/ | \|
  
```
---

HOW TO SET-UP :

	1- Set up your router (WPA + password).

	2- Get the IP of the drone. (default : 192.168.1.1) and into script/install, change DRONEIP for the IP of your drone.

	3- Connect to the wifi of your ardrone and execute script/install:
		-Now you can connect your drone to your own wifi: script/connect "<essid>" -p "<password>" -a <new_droneip> -d <current_droneip> (new_droneip should be in your network).
		-For more information about how to connect a drone to his own wifi go into ardrone-wpa2-master/README

	4- Do step 2 and 3 for each drone you have then connect your computer to your wifi. You should be able to ping them.
	
	5- Finally connect your leap motion to your computer and run main.js.

HOW TO USE :

	- Put your both hands above the leap motion (If there are no hands the drone stop).
	- Swipe a hand allow a drone to take off (One hand = one drone).
	- keyTap to land the drone.
	- Differents moves: 
		o) Moving the hand forward : ahead
		o) Moving the hand backward : behind
		o) Moving the hand above : up
		o) Moving the hand bellow : down
		o) Leaning the hand: right/left


------------------------
''''''''''''''''''''''''

	HAVE FUN	

''''''''''''''''''''''''
------------------------
