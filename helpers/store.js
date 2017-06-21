function Store () {

        this.storage = {};
};

Store.prototype.set = function ( key, value ) {

        this.storage[ key ] = value;
};

Store.prototype.get = function ( key ) {

        return this.storage[ key ];
}

module.exports = new Store();
