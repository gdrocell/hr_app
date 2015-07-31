// Configuration.js

var fs = require('fs');

var config = {};

/* Default Config */
const DEFAULT_CONFIG = "config.json";

/**
 * Constructor
 */
function Configuration() {

	fs.readFile(DEFAULT_CONFIG, "utf8", function(err, data){
		try {
			config = JSON.parse(data);
		}
		catch(e) {
			console.error("Error Loading Configuration From File ", e);
		}		
	});
}

/** 
 * Create a host configuration
 * name - alternative host name
 * hostname - host name
 * port - port
 * username - username
 */
Configuration.prototype.create = function(name, hostname, port, username) {
	if(!this.contains(name)) {
		config.configurations.push({
			"name" : name,
			"hostname": hostname,
			"port": port,
			"username": username
		});
		this.persist();
	}
};


/**
 * Delete a configuration by name.
 * name - name of configuration to delete.
 * hostname - hostname of configuration to delete
 * port - port of configuration to delete
 * username - username of configuration to delete.
 */
Configuration.prototype.delete = function(name, hostname, port, username) {
	for(var i = 0; i < config.configurations.length; i++) {
		var hostConfig = config.configurations[i];
		
		if(hostConfig.name == name) {
			config.configurations.splice(i, 1);
			break;
		}
	}
	
	this.persist();
};

/**
 * Return all the configurations.
 */
Configuration.prototype.retrieve = function() {
	return config.configurations;
};

/**
 * Updates a configuration by name.
 */
Configuration.prototype.update = function(nameKey, name, hostname, port, username) {
	for(var i = 0; i < config.configurations.length; i++) {
		var hostConfig = config.configurations[i];
		
		if(hostConfig.name == nameKey) {
			
			hostConfig.name = name;
			hostConfig.hostname = hostname;
			hostConfig.port = port;
			hostConfig.username = username;
		}
	}
	
	this.persist();
};


Configuration.prototype.contains = function(name) {
	for(var hostConfig in config.configurations) {
		if(hostConfig.name == name) {
			return true;
		}
	}
	return false;
}

Configuration.prototype.page = function(index, count) {
	var page = [];
	
	var j = 0;
	var countIndex = index + count;
	
	for(var i = index; i < countIndex && i < config.configurations.length; i++) {
		page[j++] = config.configurations[i];
	}

	return page;
}

Configuration.prototype.sort = function(attr) {
	if(attr == "name" || attr == "hostname" || attr == "port" || attr == "username") {
		var compareTo = function(a,b) {
			var val;
			
			if(a == undefined || b == undefined) {
				return val;
			}
			
			if(a[attr] == b[attr]) {
				val = 0;
			}
			else {
				val = a[attr] < b[attr] ? -1 : 1;
			}
			
			return val;
			
		};
		
		config.configurations.sort(compareTo);
	}
}

Configuration.prototype.persist = function() {
	fs.writeFile(DEFAULT_CONFIG, JSON.stringify(config), function(err) {
		if(err) {
			console.error("Error Persisting Configuration");
		}
	}); 
}

module.exports = Configuration;


