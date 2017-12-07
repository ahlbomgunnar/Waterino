
function CHIP_MOTOR(position, cmd) {

	this.pin = (13 - position);
	this.position = position;

	this.run = (ms) => {

		cmd.run('echo "m' + this.pin + ':on" > /dev/ttyACM0');
    	console.log('$ Motor ' + this.position + ' - [ Running for ' + ms + 'ms ]')

		setTimeout(() => {
			cmd.run('echo "m' + this.pin + ':off" > /dev/ttyACM0');
    		console.log('$ Motor ' + this.position + ' - [ Finished running ]')
		}, ms);
		
	}

}

module.exports = CHIP_MOTOR;