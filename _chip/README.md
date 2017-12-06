
Sigma ITC Autonomous Plant Watering
===================================
### An IOT Pocket C.H.I.P project for your plants
#### By Niklas Nauber & Gunnar Ahlbom at Sigma ITC, Gothenburg
A Pocket C.H.I.P program to handle plant watering, so you don't have to!
Together with a nice application, user database and a genetic algorithm, we hope to create a completely autonomous system for keeping your plants sufficiently hydrated.

This is the C.H.I.P sub-directory. More information and a detailed overview can be found a folder up.

## Table of content
- 1.0 Environment
- 2.0 Dependencies
- 3.0 Application
	- 3.1 Startup
	- 3.2 System Control
	- 3.3 Watering Handler


### 1.0 Environment

#### Next Thing Co. Pocket C.H.I.P
JavaScript 'Node' environment v7.10.1 for debian kernel 4.3.

#### Lightrays
Migrating from Heroku to Lightrays. (Current cloud address on Heroku)[https://sigma-itc-watering.herokuapp.com]


### 2.0 Dependencies

#### npm
- express v4.16.2
- node-fetch v1.7.3
- jsonfile v4.0.0
- path v0.12.7

##### Linux only
- chip-io v2.1.1
- johnny-five v0.11.7

#### native
- fs v7.10.1


### 3.0 Application

#### Start

First, **make sure you have git and node installed on your C.H.I.P**, then clone this repository with
```bat
$ git clone https://github.com/ahlbomgunnar/C.H.I.P-Automated-Watering.git
```
Enter the cloned folder
```bat
$ cd C.H.I.P-Automated-Watering
```
Then to install the dependencies and run the program, type these commands into the commandline 
```bat
$ npm install
$ npm start
```
This starts an express server through node and runs instanced SYSTEM_CONTROL with cloud-fetched data. Ctrl + Shift + C to stop runtime.


### 3.1 SYSTEM_CONTROL.js

#### Usage & functionality
Construct to control virtual 'module slots' which keep track of your plants status and distribute water through the use a motor controlled by the Pocket C.H.I.P's native GPIOs.

##### Runtime
Functions labeled 'runtime' are only used during runtime to perform the main functionality of the application.
This includes, and is not limited to, analyzing and/or handling module I/O and matching data values.

##### Other
Other functions will be added shortly

A generic system control module, without any clutter is shown below.
```javascript

function SYSTEM_CONTROL(board) {
	
	this.system_state; // Contains a key for connecting to a user,  
	this.cloud_state;

	this.start = () => {
		// Initializes system, cloud, watering modules and creates 'runtime' loop session with setInterval
	}

	this.runtime = () => {
		// Loop for handling main functionality
	}

	this.init_modules = () => {
		// For each plant in the cloud state, initialize new watering module. Maximum of 3 modules since GPIO numbers are limited to 6.
		this.system_state.system_slots[position] = new WATERING_MODULE(position);
	}
}

module.exports = SYSTEM_CONTROL;

```

Data is loaded and saved from system data json files and cloud data is fetched from a database user, who has the chip initialized on their account.


### 3.2 WATERING_MODULE

#### Usage & functionality
Construct to control a motor and sensor via the Pocket C.H.I.P GPIOs

A generic watering module, without any clutter is shown below.
```javascript

function WATERING_MODULE(position) {
	
	this.motor = new five.Motor(positon)
	this.sensor = new five.Sensor(position + 3)
	// Example position x = 2 => Motor gpio = pin 2 & sensor gpio = pin 5

	this.get_value = () => {
		// Return sensor value
	}

	this.water = () => {
		// Give power to the motor for a short while
	}

}

module.exports = WATERING_MODULE;

```



More comming soon...

Last updated - 21/11/2017
