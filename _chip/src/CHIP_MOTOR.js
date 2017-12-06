
function CHIP_MOTOR(position, cmd) {

	this.position = (13 - position);

	this.run = (ms) => {

		cmd.run('echo "m' + this.position + ':on" > /dev/ttyACM0');
    	console.log('$ Motor ' + this.position + ' - [ Running for ' + ms + 'ms ]')

		setTimeout(() => {
			cmd.run('echo "m' + this.position + ':off" > /dev/ttyACM0');
    		console.log('$ Motor ' + this.position + ' - [ Finished running ]')
		}, ms);
		
	}

}

module.exports = CHIP_MOTOR;