
// By Gunnar Ahlbom & Niklas Nauber @ Sigma ITC, Gothenburg, 14/11/2017
// C.H.I.P Watering System Controller  

// Node-specific dependencies
var fs          = require('fs');
var cmd         = require('node-cmd');
var path        = require('path');  
var fetch       = require('node-fetch');
var jsonfile    = require('jsonfile');

// Custom modules
var CHIP_QUEUE  = require('./CHIP_QUEUE.js');
var CHIP_MODULE = require('./CHIP_MODULE.js');

// Process rejection simplifier
process.on('unhandledRejection', (reason, p) => {return (reason, p)});


function CHIP_CONTROLLER() {

	// Api Data  
  this._api = null;
  // System-specific data
  this._sys = null;
  // Loop speed
  this.interval = 20000;
  // Custom queue component
  this.queue = new CHIP_QUEUE(20000);

  this.handle_modules = (modules, callback) => {
	  modules.forEach((module, index) => {
	    module.handle(this._api, this._sys, this.queue, (err, motor_runtime) => {
	    	if(!err) {
	    		if(motor_runtime > 0) {
	    			console.log('$ Modl - Pushing motor runtime to queue');
	    			this.queue.add(() => module.motor.run(motor_runtime));
	    		}
	    		if((index + 1) == this._sys.modules.length) {
	    			return callback(null, true);
	    		};
	    	} else {
	    		return callback(err);
	    	};
	    });
	  });
  };

  this.api_status = (callback) => {
  	var update = false;
  	update ? callback(null, 1) : callback(null, 0);
  };

  this.restart = () => {
  	this.setTimeout(() => {
  		this.start();
  	}, this._sys.session._repeat);
  	this.stop();
  };

	this.run = () => {
		/*
		this.api_status((err, update) => {
			if(update != null && update != undefined) {
				if(update) console.log('Update avaliable');
				// return this.restart(update);
				else console.log('No update avaliable');
			};
		});
	
		*/
	
		console.log('\n$ [ Run ] - Start');
		if(this._sys.modules.length > 0) {
		  this.handle_modules(this._sys.modules, (err, done) => {
				if(done && !err) {
					if(this.queue.store.length) {this.queue.run();};
					this.update_cloud(this._api);
					console.log('$ [ Run ] - Complete');
				} else throw err;
			});
		};
	};

	this.start = (data) => {
		if(data) {
			this.init_modules((err, done) => {
				if(done && !err) {
					console.log('$ Init - Modules successfully built');
					this.init_session();
					this.run();
				} else throw err;
			});
		} else {
			this.init_state((err, done) => {
				if(done && !err) {
					this.init_cloud(date, (err, done) => {
						if(done && !err) {
							this.init_modules((err, done) => {
								if(done && !err) {
									console.log('$ Init - Modules successfully built');
									this.init_session();
									this.run();
								} else throw err;
							});
					  } else throw err;
					});
				}	else throw err;
			});
		}
		
	};

	this.stop = () => {
		console.log('$ Stop - Terminating runtime');
		clearInterval(this._sys.session);
	};

	this.init_modules = (callback) => {
		this._api.plants.forEach((plant, position) => {
			console.log('$ Init - Building module ' + (position + 1) + ', motor at digPin ' + (13 - position) + ', sensor at anlPin ' + position);
			(position <= 6) ? this._sys.modules[position] = new CHIP_MODULE(plant, (position), cmd) : callback(new Error('Position ' + position + ' not allowed.'));
		});
		return callback(null, true);
	};

	// Create interval session depending on system default
	this.init_session = () => {
		var interval;
		this._sys.modules.length ? (interval = (this.interval * 2) * this._sys.modules.length + 2000) : interval = (this.interval * 2) + 1000;
		this._sys.session = setInterval(() => {this.run();}, interval);
		console.log('$ Sess - Interval length: ' + interval + 'ms');
	};

	// Load file state
	this.init_state = (callback) => {
		this.file_read('/_SYS.json', (err, data) => {
			if(!err) {
				this._sys = data; 
				return callback(null, true);
			} else {
				return callback(err)
			};
		});
	};
	
	this.api_call = (sub_url, data, callback) => {
		fetch((this._sys.url + sub_url), {
			body: JSON.stringify(data),
			method: 'POST',
			mode: 'cors',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			}
		}).then((res) => {
			return res.json();
		}).then((data) => {
			return callback(null, data);
		}).catch((err) => {
			return callback(err);
		});
	};

	// Send updated station to api
	this.update_cloud = (data, callback) => {
		this.api_call('api/chip-update-station', {key:this._sys.key, station:data}, (err, success) => {
			(!err && success) ? callback(null, true) : callback(err);
		});
	};

	/*

	// Send message to station api
	this.update_cloud_message = (data, callback) => {
		this.api_call('api/chip-update-station', {key:this._sys.key, msg:data}, (err, success) => {
			(!err && success) ? callback(null, true) : callback(err);
		})
	}

	// Send exception to station api
	this.update_cloud_exception = (data, callback) => {
		this.api_call('api/chip-update-station', {key:this._sys.key, exception:data}, (err, success) => {
			(!err && success) ? callback(null, true) : callback(err);
		})
	}

	*/

	// Load cloud into system state
	this.init_cloud = (date, callback) => {
		this.api_call('api/chip-get-station', {key:this._sys.key}, (err, data) => {
			if(data) {
				console.log('$ Init - Cloud initialized from API');
				console.log('$ Data - Last api update: ' + this._sys.last_update);
				this._api = data;
			  this.save_api((err, success) => {
			  	if(success) {
			  		this._sys.last_update = date.toLocaleDateString() + ', ' + date.toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"});
					  this.save_sys((err, success) => { success ? callback(null, true) : callback(err); });
			  	} else return callback(err);
			  });
			} else if(!err) {
				console.log('$ Data - Last api update: ' + this._sys.last_update);
				this.load_api((err, success) => { success ? callback(null, true) : callback(err); });
			} else return callback(err);
		});
	};

	this.save_sys = (callback) => {
		this.file_write('/_SYS.json', this._sys, (err, data) => {
			if(!err) {
				return callback(null, true);
			} else {
				return callback(err);
			};
		});
	}

	this.save_api = (callback) => {
		this.file_write('/_API.json', this._api, (err, success) => {
			(!err && success) ? callback(null, true) : callback(err);
		});
	}

	this.load_api = (callback) => {
		this.file_write('/_API.json', (err, data) => {
			if(!err && data) {
				this._api = data;
				callback(null, true);
			} else { 
				callback(err);
			}
		});
	}

	// Read from json file
	this.file_write = (filePath, data, callback) => {
		jsonfile.writeFile(path.join(__dirname, filePath), data, (err) => {
			if(!err) {
				return callback(null, true);
			} else {
				callback(err);
			}
		});
	}

	// Write to json file
	this.file_read = (filePath, callback) => {  
		jsonfile.readFile(path.join(__dirname, filePath), {encoding: 'utf-8'}, (err, data)  => {
			if(!err && data) {
				return callback(null, data);
			} else {
				callback(err);
			}
		});
	}

}



module.exports = CHIP_CONTROLLER;