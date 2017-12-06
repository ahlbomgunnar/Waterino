
function CHIP_SENSOR(position, cmd) {

	this.position = position;

	this.read = (callback) => {
		cmd.run('echo "s' + this.position + '" > /dev/ttyACM0');
		cmd.get('head -1 /dev/ttyACM0', (err, data, srderr) => {
			if(!err)     {return callback(null, data)} 
			else if(err) {return callback(err)} 
			else         {return callback(srderr)}
		});
	}

}

module.exports = CHIP_SENSOR;
