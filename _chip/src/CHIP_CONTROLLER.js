
// By Gunnar Ahlbom & Niklas Nauber @ Sigma ITC, Gothenburg, 14/11/2017
// C.H.I.P Watering System Controller  

var fs          = require('fs');
var cmd         = require('node-cmd');
var path        = require('path');  
var fetch       = require('node-fetch');
var jsonfile    = require('jsonfile')
var CHIP_MODULE = require('./CHIP_MODULE.js');
var CHIP_QUEUE  = require('./CHIP_QUEUE.js');

process.on('unhandledRejection', (reason, p) => {return});

function CHIP_CONTROLLER() {
  
  this._api = null;
  this._sys = null;
  this.queue = new CHIP_QUEUE(8000);

  
  this.get_sensor_percent = (a) => {
  	var x = a / this._sys.sensor_max;
  	if(x <= 100) {
  		return x;
  	} else {
  		return 100;
  	}
  }
  

  this.analyze_module = (module, callback) => {
    module.sensor.read((err, data) => {
    	var percentage = this.get_sensor_percent(data);
    	if(!err) {
    		// var now = new Date();
    		// this._api.plants[module.position].humidity_measurements.push({value:percentage, date:now.format('m-d-Y h:i:s'), timestamp:now.getTime()});
    		
    		if(!percentage) {
    			console.log('$ Chip - [ No Value ] ');
    		} else {
    		    console.log('$ Chip - [ Humidity ] | [ ' +  percentage + '% ]');
    		}
    		if(percentage != null || percentage != undefined) {
    			if(percentage < 50) {
			  		return callback(null, true);
			  	} else {
			  		return callback(null, false);
			  	}
			  } else {
			  	return callback(err);
			  }
    	} else {
    		callback(err);
    		console.log('$ Chip - [ Error reading data ] \n', err);
    	}
    });
  }

  this.handle_modules = (modules, callback) => {
  	if(modules.length > 0) {
  		console.log('$ Run  - [ Iterating modules ]')
	    modules.forEach((module, index) => {
	    	this.analyze_module(module, (err, needs_watering) => {
  				console.log('| Chip - [ Module ' + module.position + ' | ' + module.plant.name + ' ]')
	    		if(!err && needs_watering) {
	    			console.log('$ Chip - [ Needs watering ]');
	   			    console.log('$ Chip - [ Pushing module to watering queue ]');
	    			this.queue.add(function() {
			    	  console.log('$ Run  - [ Handling module ' + module.position + ' ]');
			    	  module.motor.run(1000);
			      })
	    		} else if(!err && !needs_watering) {
	   			  console.log('$ Chip - [ Does NOT need watering ]');
	    		} else {
	    			callback(err);
	    		}
	    	});
	    })
	   	console.log('$ Run  - [ All modules iterated ]')
			console.log('')  	
		} else {
  		console.log('$ Run  - [ No modules avaliable to analyze ]')
  	}
		

    return callback(null, true);
  };

	this.run = () => {
		console.log('')
		console.log('$ Run  - [ Loop start ]')
		this.handle_modules(this._sys.modules, (err, success) => {
    	if(!err) {
    		if(!this.queue.queue.length) {
    			console.log('$ Run  - [ Nothing in queue - terminating loop ]')
    		} else {
    			console.log('$ Run  - [ Running queue ]')
				console.log('')
				this.queue.add(function() {
					console.log('$ Run  - [ Queue complete ] ')
				})
    			this.queue.run();
    		}
    		// this.update_api();
    	} else {
    		console.log('$ Run  - [ Module error ] \n', err)
    	}
		});
	};

	this.start = () => {
		this.init_state((err, success) => {
			if(!err) {
				this.init_cloud((err, success) => {
					if(!err) {
						this.init_modules((err, success) => {
							if(!err) {
								if(!this._sys.modules.length > 0) {
									console.log('$ Init - [ No modules were built ]')
								} else {
									console.log('$ Init - [ Modules successfully built ]')
								}
								this.init_session();
								console.log('$ Init - [ Proceeding to main functionality ]')
								this.run();
							} else {throw err} 
						});
				  } else {throw err} 
				});
			}	else {throw err} 
		});
	};

	this.stop = () => {
		console.log('$ Stop - [ Terminating runtime ]')
		clearInterval(this._sys.session);
	};

	this.init_modules = (callback) => {
		this._api.plants.forEach((plant, position) => {
			if(position >= 6) {
				console.log('$ Init - [ Module initialization failed - Unsupported amount of plants ]')
			} else {
				console.log('$ Init - [ Module ' + position + ' built | ' + plant.name + ' ]');
				this._sys.modules[position] = new CHIP_MODULE(plant, (position), cmd);
				console.log('| M    - [ dPin ' + this._sys.modules[position].motor.position + ' ]')
				console.log('| S    - [ aPin ' + this._sys.modules[position].sensor.position + ' ]')
			}	
		});
		return callback(null, true);
	};

	this.init_session = () => {
		this._sys.session = setInterval(() => {
			this.run();
		}, 30000);
		console.log('$ Init - [ Runtime session created ]')
	};

	this.init_state = (callback) => {
		this.file_read('/_SYS.json', (err, data) => {
			if(!err) {
				this._sys = data; 
				callback(null, true);
			} else {
				callback(err)
			};
		});
	};


	this.update_cloud_station = (callback) => {
		this._api.plant[n]
		fetch((this._sys.url + 'api/chip-update-station'), {
			body: JSON.stringify({
				key: this._sys.key,
				station: this._api
			}),
			method: 'POST',
			mode: 'cors',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			}
		})
	}

	this.update_cloud_message = (callback) => {
		fetch((this._sys.url + 'api/chip-message-station'), {
			body: JSON.stringify({
				key: this._sys.key
			}),
			method: 'POST',
			mode: 'cors',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			}
		})
	}

	this.update_cloud_exception = (callback) => {
		fetch((this._sys.station + 'api/chip-throw-exception'), {
			body: JSON.stringify({
				key: this._sys.key
			}),
			method: 'POST',
			mode: 'cors',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			}
		})
	}

	this.init_cloud = (callback) => {
		fetch((this._sys.url + 'api/chip-get-station'), { 
			body: JSON.stringify({ 
				key: this._sys.key 
			}), 
			method: 'POST', 
			mode: 'cors', 
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			}
		}).then((res) => {
			var status = this.handle_request_result(res);
			console.log('$ API  - [ ' + res.status + ' | ' + status + ' ]');
			if(res.status != 200) {
				this.file_read('/_API.json', (err, data) => {
					if(!err) {
						this._api = data;
						console.log('$ Init - [ Initialized from FILE ]');
						console.log('$ Sys  - [ Last update: ' + this._sys.last_update + ' ]');
						return callback(null, true);
					} else {
						return callback(err);
					};
				})
			} else {
				return res.json()
			}
		}).then((data) => {
			this.file_write('/_API.json', data, (err, success) => {
				if(!err) {
					console.log('$ Init - [ Initialized from CLOUD ]');
				  this._api = data; 
				  return callback(null, true);
				} else {
					return callback(err)
				};
			});
		}).catch(err => {
			return callback(err)
		});
	};

	this.file_write = (filePath, data, callback) => { 
		jsonfile.writeFile(path.join(__dirname, filePath), data, (err) => { 
			if(!err) {return callback(null, true);} else {return callback(err)};});}
	this.file_read = (filePath, callback) => {  
		jsonfile.readFile(path.join(__dirname, filePath), {encoding: 'utf-8'}, (err, data)  => {
			if(!err) {return callback(null, data);} else {return callback(err)};});}

	this.handle_request_result = (result) => {
		switch(result.status) {
			case 200: return 'Successful';
			case 202: return 'Accepted';
			case 204: return 'No Content';
			case 205: return 'Reset Content';
			case 206: return 'Partial Content';
			case 400: return 'Bad Request';
			case 404: return 'Not found';
			case 408: return 'Request timeout';
			case 500: return 'Internal Server Error';
			case 502: return 'Bad Gateway';
			case 503: return 'Service Unavaliable';
			case 505: return 'HTTP Version Not Supported';
			default:  return 'An unhandled error occured while requesting data from the server.';
		}
	}

}



module.exports = CHIP_CONTROLLER;