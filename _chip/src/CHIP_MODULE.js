
// By Gunnar Ahlbom & Niklas Nauber @ Sigma ITC, Gothenburg, 14/11/2017
// C.H.I.P Watering Slot Handler

var CHIP_MOTOR  = require('./CHIP_MOTOR.js');
var CHIP_SENSOR = require('./CHIP_SENSOR.js');

function CHIP_MODULE(plant, position, cmd) {
	this.plant    = plant;
	this.position = position + 1;
	this.motor    = new CHIP_MOTOR(this.position, cmd);
    this.sensor   = new CHIP_SENSOR(this.position, cmd);
}


module.exports = CHIP_MODULE;