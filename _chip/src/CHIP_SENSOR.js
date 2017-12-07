
function CHIP_SENSOR(position, cmd) {

	this.position = position;

	this.read = (callback) => {
		cmd.run('echo "s' + this.position + ':read" > /dev/ttyACM0');
		setTimeout(() => {
			cmd.get('head -1 /dev/ttyACM0', (err, data, srderr) => {
				if(!err)     {return callback(null, data)} 
				else if(err) {return callback(err)} 
				else         {return callback(srderr)}
			});
		}, 2000);
		
	}

}

module.exports = CHIP_SENSOR;
