
function CHIP_MOTOR(position, cmd) {

	this.pin = (13 - position);
	this.position = position;

	this.run = (ms) => {

		cmd.run('echo "m' + this.position + ':on" > /dev/ttyACM0');
    	console.log('$ Motor ' + this.pin + ' - [ Running for ' + ms + 'ms ]')

		setTimeout(() => {
			cmd.run('echo "m' + this.position + ':off" > /dev/ttyACM0');
    		console.log('$ Motor ' + this.pin + ' - [ Finished running ]')
		}, ms);
		
	}

}

module.exports = CHIP_MOTOR;