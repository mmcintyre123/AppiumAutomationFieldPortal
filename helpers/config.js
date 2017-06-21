'use strict';

let singleton = {
	set: function(options) {
		for (let i in options) {
			this[i] = options[i];
		}
	}
}
module.exports = singleton;