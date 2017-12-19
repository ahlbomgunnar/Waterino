
// By Gunnar Ahlbom & Niklas Nauber @ Sigma ITC, Gothenburg, 14/11/2017
// C.H.I.P Watering Slot Handler

var CHIP_MOTOR  = require('./CHIP_MOTOR.js');
var CHIP_SENSOR = require('./CHIP_SENSOR.js');

function CHIP_MODULE(plant, position, cmd) {
	this.plant    = plant;
	this.position = position;
	this.motor    = new CHIP_MOTOR((this.position + 1), cmd);
  this.sensor   = new CHIP_SENSOR((this.position + 1), cmd);

  // Return percentage for custom sensor
	this.get_sensor_percent = (max, a) => {
	  return (100 - Math.round((a / max) * 100));
	}

  // Write a measurement to a plants humidity_measurement and remove oldest
  this.write_measurement = (_api, value) => {
  	var date = new Date();
  	// Get current date string
  	var currentdate = date.toLocaleDateString() + ', ' + date.toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"});
  	// Get sortable timestamp
  	var timestamp = date.getTime();
  	// Set new measurement
  	var measurements = _api.plants[this.position].humidity_measurements;
  	// Push new measurement to api data
  	measurements.push({value:value, timestamp:timestamp, date:currentdate});
  	// If more than 10 measurements
  	if(measurements.length > 10) {
  		// Find oldest measurement
  		var last = Math.min.apply(Math, measurements.map((i) => {return i.timestamp;}))
		  // Find measurement by timestamp
		  var obj = measurements.find((i) => {return i.timestamp === last;})
		  // Remove object by index
		  measurements.splice(measurements.indexOf(obj), 1);
  	}
  }

  this.process_value = (i, settings, callback) => {

  	// Function of both size and water amount
  	// Large x can give large value without large z
  	// Large z cannot give large value without x

  	// Function of size and water amount
  	// Provides logarithmic growth of large values only

  	// f(x)(c) = e^(0.2 * x) + x^(c / 10)

  	var x = settings.plant_size;
  	var c = settings.water_amount;
  	var h = settings.humidity_indicator * 10;

  	console.log('~ -------------- ');
  	console.log('~ Water|Module - ' + this.plant.name);
  	console.log('~ HydroMeasure - ' + i);
  	console.log('~ NeedsWaterAt - ' + h);
  	console.log('~ -------------- ');
  	console.log('~ NeedWatering - ' + (i < h));
  	
  	var eLog = Math.pow(Math.E, (0.2 * x));
  	var xLog = Math.pow(x, (c / 10));
  	var fc = eLog + xLog; fc = (Math.round(fc * 10) / 10) * 1000;
  	(i < h) ? callback(null, fc) : callback(null, 0);
  }

  this.handle = (_api, _sys, queue, callback) => {
    // this.sensor.test((err, value) => {
    this.sensor.run((err, value) => {
	    if(value) {
	    	value = this.get_sensor_percent(_sys.sensor_max, value);
	    	value ? this.write_measurement(_api, value) : callback(err);
	    	this.process_value(value, this.plant.settings, (err, motor_runtime) => {
	    		return callback(null, motor_runtime);
	    	});
	    } else return callback(err);
    });
  }
}


module.exports = CHIP_MODULE;