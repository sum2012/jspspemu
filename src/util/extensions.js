///<reference path="../../typings/promise/promise.d.ts" />
function compare(a, b) {
    if (a < b)
        return -1;
    if (a > b)
        return +1;
    return 0;
}

function identity(a) {
    return a;
}

Array.prototype.max = (function (selector) {
    var array = this;
    if (!selector)
        selector = function (a) {
            return a;
        };
    return array.reduce(function (previous, current) {
        return Math.max(previous, selector(current));
    }, selector(array[0]));
});

Array.prototype.sortBy = function (selector) {
    return this.slice(0).sort(function (a, b) {
        return compare(selector(a), selector(b));
    });
};

Array.prototype.first = (function (selector) {
    var array = this;
    if (!selector)
        selector = identity;
    for (var n = 0; n < array.length; n++)
        if (selector(array[n]))
            return array[n];
    return undefined;
});

Array.prototype.sum = (function (selector) {
    var array = this;
    if (!selector)
        selector = function (a) {
            return a;
        };
    return array.reduce(function (previous, current) {
        return previous + selector(current);
    }, 0);
});

Array.prototype.remove = function (item) {
    var array = this;
    var index = array.indexOf(item);
    if (index >= 0)
        array.splice(index, 1);
};

if (!ArrayBuffer.prototype.slice) {
    ArrayBuffer.prototype.slice = function (begin, end) {
        var that = new Uint8Array(this);
        if (end == undefined)
            end = that.length;
        var result = new ArrayBuffer(end - begin);
        var resultArray = new Uint8Array(result);
        for (var i = 0; i < resultArray.length; i++)
            resultArray[i] = that[i + begin];
        return result;
    };
}

function String_repeat(str, num) {
    return new Array(num + 1).join(str);
}

String.prototype.rstrip = function () {
    var string = this;
    return string.replace(/\s+$/, '');
};

String.prototype.contains = function (value) {
    var string = this;
    return string.indexOf(value) >= 0;
};

var ArrayBufferUtils = (function () {
    function ArrayBufferUtils() {
    }
    ArrayBufferUtils.fromUInt8Array = function (input) {
        return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
    };

    ArrayBufferUtils.concat = function (chunks) {
        var tmp = new Uint8Array(chunks.sum(function (chunk) {
            return chunk.byteLength;
        }));
        var offset = 0;
        chunks.forEach(function (chunk) {
            tmp.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
        });
        return tmp.buffer;
    };
    return ArrayBufferUtils;
})();

function setImmediate(callback) {
    setTimeout(callback, 0);
}

var Utf8 = (function () {
    function Utf8() {
    }
    Utf8.decode = function (input) {
        return decodeURIComponent(escape(input));
    };

    Utf8.encode = function (input) {
        return unescape(encodeURIComponent(input));
    };
    return Utf8;
})();

window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];

var PromiseUtils = (function () {
    function PromiseUtils() {
    }
    PromiseUtils.sequence = function (generators) {
        return new Promise(function (resolve, reject) {
            generators = generators.slice(0);
            function step() {
                if (generators.length > 0) {
                    var generator = generators.shift();
                    var promise = generator();
                    promise.then(step);
                } else {
                    resolve();
                }
            }
            step();
        });
    };

    PromiseUtils.delayAsync = function (ms) {
        return new Promise(function (resolve, reject) {
            return setTimeout(resolve, ms);
        });
    };
    return PromiseUtils;
})();

window['requestFileSystem'] = window['requestFileSystem'] || window['webkitRequestFileSystem'];

function downloadFileAsync(url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();

        request.open("GET", url, true);
        request.overrideMimeType("text/plain; charset=x-user-defined");
        request.responseType = "arraybuffer";
        request.onload = function (e) {
            var arraybuffer = request.response;

            //var data = new Uint8Array(arraybuffer);
            resolve(arraybuffer);
            //console.log(data);
            //console.log(data.length);
        };
        request.onerror = function (e) {
            reject(e.error);
        };
        request.send();
    });
}

var SortedSet = (function () {
    function SortedSet() {
        this.elements = [];
    }
    SortedSet.prototype.has = function (element) {
        return this.elements.indexOf(element) >= 0;
    };

    SortedSet.prototype.add = function (element) {
        if (!this.has(element))
            this.elements.push(element);
        return element;
    };

    Object.defineProperty(SortedSet.prototype, "length", {
        get: function () {
            return this.elements.length;
        },
        enumerable: true,
        configurable: true
    });

    SortedSet.prototype.delete = function (element) {
        this.elements.remove(element);
    };

    SortedSet.prototype.filter = function (callback) {
        return this.elements.filter(callback);
    };

    SortedSet.prototype.forEach = function (callback) {
        this.elements.slice(0).forEach(callback);
    };
    return SortedSet;
})();

var UidCollection = (function () {
    function UidCollection(lastId) {
        if (typeof lastId === "undefined") { lastId = 1; }
        this.lastId = lastId;
        this.items = {};
    }
    UidCollection.prototype.allocate = function (item) {
        var id = this.lastId++;
        this.items[id] = item;
        return id;
    };

    UidCollection.prototype.get = function (id) {
        return this.items[id];
    };

    UidCollection.prototype.remove = function (id) {
        delete this.items[id];
    };
    return UidCollection;
})();

var Signal = (function () {
    function Signal() {
        this.callbacks = new SortedSet();
    }
    Signal.prototype.add = function (callback) {
        this.callbacks.add(callback);
    };

    Signal.prototype.remove = function (callback) {
        this.callbacks.delete(callback);
    };

    Signal.prototype.once = function (callback) {
        var _this = this;
        var once = function () {
            _this.remove(once);
            callback();
        };
        this.add(once);
    };

    Signal.prototype.dispatch = function () {
        this.callbacks.forEach(function (callback) {
            callback();
        });
    };
    return Signal;
})();
//# sourceMappingURL=extensions.js.map
