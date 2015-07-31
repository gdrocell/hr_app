// Generate a random config file.

var fs = require('fs');
const DEFAULT_CONFIG = "config.json";

function main() {
	var config = {configurations: []};
	
	if(process.argv.length < 3) {
		console.log("node genconfig.js <num configs>");
		return;
	}
	
	var numConfigs = process.argv[2];
	
	for(var i = 0; i < numConfigs; i++) {
		config.configurations.push({
			name: generateName(i),
			hostname: generateHost(),
			port: generatePort(),
			username: generateUserName()
		});
	}
	
	fs.writeFile(DEFAULT_CONFIG, JSON.stringify(config), function(err) {
		if(err) {
			console.error("Error Persisting Configuration");
		}
	}); 
}

function generateName(n) {
	return "HOST" + n;
}

function generateHost() {
	return randomString(3) + "." + randomString(randomInt(5,10)) + "."
		+ randomString(3);
}

function generatePort() {
	return randomInt(1800, 1 << 16);
}

function generateUserName() {
	return randomString(randomInt(5, 12));
}

function randomString(n) {
	var randStr = "";
	for(var i = 0; i < n; i++) {
		var randAscii = randomInt(0x41, 0x5A);
		var chr = String.fromCharCode(randAscii);
		randStr += chr;
	}
	
	return randStr;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}


main();

