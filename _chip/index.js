
// CHIP_Watering_Handler by Niklas Nauber and Gunnar Ahlbom
// All rights reserved 11/09-17

var CHIP_CONTROLLER = require('./src/CHIP_CONTROLLER.js'); 

var app = require("express")(); 
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => {
	var Waterino = new CHIP_CONTROLLER();
    Waterino.start();
});


