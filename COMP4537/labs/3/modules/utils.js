exports.getDate = function() {
    const now = new Date();
    return now;
}

// Formats strings with the given arguments
exports.formatString = function(str, ...args) {
    return str.replace(/%s/g, function() {
        return args.shift();
    });
}