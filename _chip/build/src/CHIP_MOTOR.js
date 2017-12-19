
function CHIP_MOTOR(position, cmd) {

	this.pin = (13 - position);
	this.position = position;

	this.test = (ms) => {
		console.log('& Motor ' + this.position + ' run test. Running for ' + ms + 'ms');
		setTimeout(() => {
			console.log('& Motor ' + this.position + ' stopping test');
		}, ms);
	};

	this.run = (ms) => {
    console.log('& Motor ' + this.position + ', pin ' + this.pin + ' - [ Running for ' + ms + 'ms ]');
		cmd.run('echo "m' + this.pin + ':on" > /dev/ttyACM0');
		setTimeout(() => {
			cmd.run('echo "m' + this.pin + ':off" > /dev/ttyACM0');
    	console.log('& Motor ' + this.position + ', pin ' + this.pin + ' - [ Finished running ]');
		}, ms);
	};
};

module.exports = CHIP_MOTOR;