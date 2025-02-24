// Arian's fork of struct-fu ported to browser JS.
// https://github.com/ariankordi/struct-fu

/**
 * A library for defining structs to convert between JSON and binary.
 * Supports numbers, bytes, strings, and bitfields.
 * Compatible with browsers down to Safari 5.1.
 *
 * @namespace
 */
var _ = {};

// Add ECMA262-5 method binding if not supported natively
// https://github.com/ReactNativeNews/react-native-newsletter/blob/93016f62af32d97cc009f991d4f7c3c7155a4f26/ie.js#L8
if (!('bind' in Function.prototype)) {
    Function.prototype.bind = function (owner) {
        var that = this;
        if (arguments.length <= 1) {
            return function () {
                return that.apply(owner, arguments);
            };
        } else {
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return that.apply(owner, arguments.length === 0 ? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}


/**
 * Creates a new buffer backed by an ArrayBuffer.
 *
 * @param {number} size - The size of the buffer in bytes.
 * @returns {Uint8Array} A new Uint8Array of the specified size.
 */
function newBuffer(size) {
    return new Uint8Array(new ArrayBuffer(size));
}

/**
 * Extends an object with properties from subsequent objects.
 *
 * @param {Object} obj - The target object to extend.
 * @returns {Object} The extended object.
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.forEach(function (ext) {
        Object.keys(ext).forEach(function (key) {
            obj[key] = ext[key];
        });
    });
    return obj;
}

/**
 * Adds a bitfield's size to the current cursor.
 *
 * @param {Object} ctr - The current cursor with bytes and bits.
 * @param {Object} f - The field to add.
 * @returns {Object} The updated cursor.
 */
function addField(ctr, f) {
    if ('width' in f) {
        ctr.bits = (ctr.bits || 0) + f.width;
        while (ctr.bits > 7) {
            ctr.bytes += 1;
            ctr.bits -= 8;
        }
    } else if (!ctr.bits) {
        ctr.bytes += f.size;
    } else {
        throw Error("Improperly aligned bitfield before field: "+f.name);
    }
    return ctr;
}

/**
 * Converts a field into an array field if a count is provided.
 *
 * @param {Object} f - The field to arrayize.
 * @param {number} count - The number of elements in the array.
 * @returns {Object} The arrayized field.
 */
function arrayizeField(f, count) {
    var f2 = (typeof count === 'number') ? extend({
        name: f.name,
        field: f,
        /**
         * Unpacks an array of values from bytes.
         *
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {Array} The unpacked array of values.
         */
        valueFromBytes: function (buf, off) {
            off || (off = {bytes:0, bits:0});
            var arr = new Array(count);
            for (var idx = 0, len = arr.length; idx < len; idx += 1) {
                arr[idx] = f.valueFromBytes(buf, off);
            }
            return arr;
        },
        /**
         * Packs an array of values into bytes.
         *
         * @param {Array} arr - The array of values to pack.
         * @param {ArrayBuffer|Uint8Array} [buf] - The buffer to write to.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
         */
        bytesFromValue: function (arr, buf, off) {
            arr || (arr = new Array(count));
            buf || (buf = newBuffer(this.size));
            off || (off = {bytes:0, bits:0});
            for (var idx = 0, len = Math.min(arr.length, count); idx < len; idx += 1) {
                f.bytesFromValue(arr[idx], buf, off);
            }
            while (idx++ < count) addField(off, f);
            return buf;
        }
    }, ('width' in f) ? {width: f.width * count} : {size: f.size * count}) : f;
    f2.pack = f2.bytesFromValue;
    f2.unpack = f2.valueFromBytes;
    return f2;
}

/*
 * Defines a new structure with the given fields.
 *
 * @param {string} [name] - The name of the structure.
 * @param {Array} fields - The array of field definitions.
 * @param {number} [count] - The number of structures in an array.
 * @returns {Object} The defined structure with pack and unpack methods.
 */
_.struct = function (name, fields, count) {
    if (typeof name !== 'string') {
        count = fields;
        fields = name;
        name = null;
    }

    var _size = {bytes:0, bits:0},
        _padsById = Object.create(null),
        fieldsObj = fields.reduce(function (obj, f) {
            if ('_padTo' in f) {
                // HACK: we really should just make local copy of *all* fields
                f._id || (f._id = 'id' + Math.random().toFixed(20).slice(2)); // WORKAROUND: https://github.com/tessel/runtime/issues/716
                var _f = _padsById[f._id] = (_size.bits) ? {
                    width: 8*(f._padTo - _size.bytes) - _size.bits
                } : {
                    size: f._padTo - _size.bytes
                };
                if ((_f.width !== undefined && _f.width < 0) || (_f.size !== undefined && _f.size < 0)) {
                    var xtraMsg = (_size.bits) ? (" and " + _size.bits + " bits") : '';
                    throw Error("Invalid .padTo(" + f._padTo + ") field, struct is already " + _size.bytes + " byte(s)" + xtraMsg + "!");
                }
                f = _f;
            }
            else if (f._hoistFields) {
                Object.keys(f._hoistFields).forEach(function (name) {
                    var _f = Object.create(f._hoistFields[name]);
                    if ('width' in _f) {
                        _f.offset = { bytes: _f.offset.bytes + _size.bytes, bits: _f.offset.bits };
                    } else {
                        _f.offset += _size.bytes;
                    }
                    obj[name] = _f;
                });
            }
            else if (f.name) {
                f = Object.create(f);           // local overrides
                f.offset = ('width' in f) ? {bytes:_size.bytes,bits:_size.bits} : _size.bytes,
                obj[f.name] = f;
            }
            addField(_size, f);
            return obj;
        }, {});
    if (_size.bits) throw Error("Improperly aligned bitfield at end of struct: "+name);

    return arrayizeField({
        /**
         * Unpacks a structure from bytes.
         *
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {Object} The unpacked structure.
         */
        valueFromBytes: function (buf, off) {
            off || (off = {bytes:0, bits:0});
            var obj = {};
            fields.forEach(function (f) {
                if ('_padTo' in f) return addField(off, _padsById[f._id]);

                var value = f.valueFromBytes(buf, off);
                if (f.name) obj[f.name] = value;
                else if (typeof value === 'object') extend(obj, value);
            });
            return obj;
        },
        /**
         * Packs a structure into bytes.
         *
         * @param {Object} obj - The object containing values to pack.
         * @param {ArrayBuffer|Uint8Array} [buf] - The buffer to write to.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
         */
        bytesFromValue: function (obj, buf, off) {
            obj || (obj = {});
            buf || (buf = newBuffer(this.size));
            off || (off = {bytes:0, bits:0});
            fields.forEach(function (f) {
                if ('_padTo' in f) return addField(off, _padsById[f._id]);

                var value = (f.name) ? obj[f.name] : obj;
                f.bytesFromValue(value, buf, off);
            });
            return buf;
        },
        _hoistFields: (!name) ? fieldsObj : null,
        fields: fieldsObj,
        size: _size.bytes,
        name: name
    }, count);
};

/**
 * Reads a truncated unsigned 32-bit integer from a buffer. Used in valueFromBytes for bitfields.
 *
 * @param {ArrayBuffer|Uint8Array} buffer - The buffer to read from.
 * @param {number} offset - The byte offset to start reading.
 * @param {boolean} littleEndian - Indicates whether to read little-endian.
 * @returns {number} The read unsigned 32-bit integer.
 */
function truncatedReadUInt32(buffer, offset, littleEndian) {
    var bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    var availableBytes = bytes.length - offset;
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    if (availableBytes >= 4) {
        return view.getUint32(offset, littleEndian);
    } else if (availableBytes === 3) {
        var first = view.getUint16(offset, littleEndian);
        var second = view.getUint8(offset + 2);
        return littleEndian
            ? ((second << 16) + first) >>> 0
            : ((first << 8) + second) << 8 >>> 0;
    } else if (availableBytes === 2) {
        return view.getUint16(offset, littleEndian) << (littleEndian ? 0 : 16) >>> 0;
    } else if (availableBytes === 1) {
        return view.getUint8(offset) << (littleEndian ? 0 : 24) >>> 0;
    } else {
        return 0x0;
    }
}

/**
 * Writes a truncated unsigned 32-bit integer to a buffer. Used in bytesFromValue for bitfields.
 *
 * @param {ArrayBuffer|Uint8Array} buffer - The buffer to write to.
 * @param {number} offset - The byte offset to start writing.
 * @param {number} data - The unsigned 32-bit integer to write.
 * @param {boolean} littleEndian - Indicates whether to write little-endian.
 */
function truncatedWriteUInt32(buffer, offset, data, littleEndian) {
    var bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    var availableBytes = bytes.length - offset;
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    if (availableBytes >= 4) {
        view.setUint32(offset, data, littleEndian);
    } else if (availableBytes === 3) {
        if (littleEndian) {
            view.setUint8(offset, data & 0xff);
            view.setUint16(offset + 1, data >>> 8, littleEndian);
        } else {
            view.setUint16(offset, data >>> 16, littleEndian);
            view.setUint8(offset + 2, (data >>> 8) & 0xff);
        }
    } else if (availableBytes === 2) {
        view.setUint16(offset, littleEndian ? data & 0xffff : data >>> 16, littleEndian);
    } else if (availableBytes === 1) {
        view.setUint8(offset, littleEndian ? data & 0xff : data >>> 24);
    }
}

/**
 * Defines a padding field up to the specified offset.
 *
 * @param {number} off - The byte offset to pad to.
 * @returns {Object} The padding field definition.
 */
_.padTo = function (off) {
    return {_padTo:off};
};


// NOTE: bitfields must be embedded in a struct (C/C++ share this limitation)

var FULL = 0xFFFFFFFF;

/**
 * Defines a big-endian bitfield within a structure.
 *
 * @param {string} name - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Object} The defined bitfield.
 */
function bitfield(name, width, count) {
    var littleEndian = false; // Passed to truncatedRead/WriteUInt32

    width || (width = 1);
    // NOTE: width limitation is so all values will align *within* a 4-byte word
    if (width > 24) throw Error("Bitfields support a maximum width of 24 bits.");
    var impl = this,
        mask = FULL >>> (32 - width);
    return arrayizeField({
        /**
         * Unpacks a bitfield value from bytes.
         *
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {number} The unpacked bitfield value.
         */
        valueFromBytes: function (buf, off) {
            off || (off = {bytes:0, bits:0});
            var end = (off.bits || 0) + width,
                word = truncatedReadUInt32(buf, off.bytes, littleEndian) || 0,
                over = word >>> (32 - end);
            addField(off, this);
            return impl.b2v.call(this, over & mask);
        },
        /**
         * Packs a bitfield value into bytes.
         *
         * @param {number} val - The value to pack.
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to write to.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
         */
        bytesFromValue: function (val, buf, off) {
            val = impl.v2b.call(this, val || 0);
            off || (off = {bytes:0, bits:0});
            var end = (off.bits || 0) + width,
                word = truncatedReadUInt32(buf, off.bytes, littleEndian) || 0,
                zero = mask << (32 - end),
                over = (val & mask) << (32 - end);
            word &= ~zero;
            word |= over;
            word >>>= 0;      // WORKAROUND: https:thub.com/tessel/runtime/issues/644
            truncatedWriteUInt32(buf, off.bytes, word, littleEndian);
            addField(off, this);
            return buf;
        },
        width: width,
        name: name
    }, count);
}


/**
 * Defines a little-endian bitfield within a structure.
 * This is meant to read and write bitfields inline with the behavior of GCC.
 *
 * @param {string} name - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Object} The defined bitfield.
 */
function bitfieldLE(name, width, count) {
    width || (width = 1);
    if (width > 24) throw Error("Bitfields support a maximum width of 24 bits.");

    // The default bitfield type uses "top bits" of a 32-bit read.
    // We define a new "cbitLE" approach that uses the lower bits first.
    var impl = this,
        mask = (0xFFFFFFFF >>> (32 - width)) >>> 0; // Mask of (width) bits

    return arrayizeField({
        /**
         * Unpacks a bitfield value from bytes.
         *
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {number} The unpacked bitfield value.
         */
        valueFromBytes: function(buf, off) {
            off || (off = {bytes:0, bits:0});

            // Read 32 bits from the buffer in "true" little-endian
            // (so bytes[0] is the lowest-order bits in that 32)
            var word = truncatedReadUInt32(buf, off.bytes, true) >>> 0;

            // The field bits we want are from "off.bits" up through
            // "off.bits + width - 1" in that 32. That means:
            var shift = off.bits;  // how many bits already used in that 32
            var result = (word >>> shift) & mask;

            // Move offset forward by 'width' bits
            addField(off, this);

            return impl.b2v.call(this, result);
        },

        /**
         * Packs a bitfield value into bytes.
         *
         * @param {number} val - The value to pack.
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to write to.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
         */
        bytesFromValue: function(val, buf, off) {
            off || (off = {bytes:0, bits:0});

            // read existing 32 bits
            var word = truncatedReadUInt32(buf, off.bytes, true) >>> 0;

            var shift = off.bits;
            // Clear out the bits in "mask << shift"
            var clearMask = ~(mask << shift) >>> 0;
            word &= clearMask;

            var toStore = (impl.v2b.call(this, val) & mask) << shift;
            word |= (toStore >>> 0);

            truncatedWriteUInt32(buf, off.bytes, word >>> 0, true);

            addField(off, this);
            return buf;
        },

        width: width,
        name: name
    }, count);
}

_.bool = function (name, count) {
    return bitfield.call({
        /**
         * Converts a bitfield to a boolean.
         *
         * @param {number} b - The bitfield value.
         * @returns {boolean} The boolean representation.
         */
        b2v: function (b) { return Boolean(b); },
        /**
         * Converts a boolean to a bitfield.
         *
         * @param {boolean} v - The boolean value.
         * @returns {number} The bitfield representation.
         */
        v2b: function (v) { return (v) ? FULL : 0; }
    }, name, 1, count);

};

_.ubit = bitfield.bind({
    /**
     * Converts a bitfield to a value.
     *
     * @param {number} b - The bitfield value.
     * @returns {number} The numeric value.
     */
    b2v: function (b) { return b; },
    /**
     * Converts a value to a bitfield.
     *
     * @param {number} v - The numeric value.
     * @returns {number} The bitfield representation.
     */
    v2b: function (v) { return v; }
});

/**
 * Defines a little-endian bitfield.
 *
 * @param {string} name - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Object} The defined little-endian bitfield.
 */
_.ubitLE = bitfieldLE.bind({
    /**
     * Converts a bitfield to a little-endian value.
     *
     * @param {number} b - The bitfield value.
     * @returns {number} The little-endian numeric value.
     */
    b2v: function (b) { return b; },
    /**
     * Converts a little-endian value to a bitfield.
     *
     * @param {number} v - The little-endian numeric value.
     * @returns {number} The bitfield representation.
     */
    v2b: function (v) { return v; }
});

/**
 * Defines a signed bitfield.
 *
 * @param {string} name - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Object} The defined signed bitfield.
 */
_.sbit = bitfield.bind({        // TODO: handle sign bit…
    /**
     * Converts a bitfield to a signed value.
     *
     * @param {number} b - The bitfield value.
     * @returns {number} The signed numeric value.
     */
    b2v: function (b) {
        var m = 1 << (this.width-1),
            s = b & m;
        return (s) ? -(b &= ~m) : b;
    },
    /**
     * Converts a signed value to a bitfield.
     *
     * @param {number} v - The signed numeric value.
     * @returns {number} The bitfield representation.
     */
    v2b: function (v) {
        var m = 1 << (this.width-1),
            s = (v < 0);
        return (s) ? (-v | m) : v;
    }
});

/**
 * Defines a byte-based field within a structure.
 *
 * @param {string|number} name - The name of the bytefield or its size if name is omitted.
 * @param {number} [size=1] - The size of the bytefield in bytes.
 * @param {number} [count] - The number of bytefields in an array.
 * @returns {Object} The defined bytefield.
 */
function bytefield(name, size, count) {
    if (typeof name !== 'string') {
        count = size;
        size = name;
        name = null;
    }
    size = (typeof size === 'number') ? size : 1;
    var impl = this;
    return arrayizeField({
        /**
         * Unpacks a bytefield from bytes.
         *
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {Uint8Array} The unpacked bytefield.
         */
        valueFromBytes: function (buf, off) {
            off || (off = {bytes:0, bits:0});
            var bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
            var val = bytes.subarray(off.bytes, off.bytes + this.size);
            addField(off, this);
            return impl.b2v.call(this, val);
            //return impl.b2v.call(this, val.buffer.slice(val.byteOffset, val.byteOffset + val.byteLength)); // Returns ArrayBuffer usually
        },
        /**
         * Packs a bytefield into bytes.
         *
         * @param {ArrayBuffer|Uint8Array} val - The value to pack.
         * @param {ArrayBuffer|Uint8Array} [buf] - The buffer to write to.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
         */
        bytesFromValue: function (val, buf, off) {
            buf || (buf = newBuffer(this.size));
            off || (off = { bytes: 0, bits: 0 });
            var bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
            var blk = bytes.subarray(off.bytes, off.bytes + this.size);
            impl.vTb.call(this, val, blk);
            addField(off, this);
            return buf;
        },
        size: size,
        name: name
    }, count);
}

/**
 * Swaps adjacent byte pairs in a buffer.
 * http://stackoverflow.com/a/7460958/72637
 *
 * @param {Uint8Array} fromBuffer - The source buffer.
 * @param {Uint8Array} [toBuffer] - The destination buffer. If not provided, fromBuffer is modified.
 * @returns {Uint8Array} The buffer with swapped byte pairs.
 */
function swapBytesPairs(fromBuffer, toBuffer) {
    toBuffer = toBuffer || fromBuffer;
    var l = fromBuffer.length;
    for (var i = 1; i < l; i += 2) {
        var a = fromBuffer[i - 1];
        toBuffer[i - 1] = fromBuffer[i];
        toBuffer[i] = a;
    }
    return toBuffer;
}

_.byte = bytefield.bind({
    /**
     * Converts bytes to a value.
     *
     * @param {ArrayBuffer|Uint8Array} b - The bytes to convert.
     * @returns {ArrayBuffer|Uint8Array} The byte value.
     */
    b2v: function (b) { return b; },
    /**
     * Converts a value to bytes.
     *
     * @param {ArrayBuffer|Uint8Array} v - The value to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v, b) { if (!v) return 0; b.set(new Uint8Array(v)); return v.byteLength; }
});

_.char = bytefield.bind({
    /**
     * Converts bytes to a UTF-8 string.
     *
     * @param {ArrayBuffer|Uint8Array} b - The bytes to convert.
     * @returns {string} The resulting string.
     */
    b2v: function (b) {
        var decoder;
        if (typeof TextDecoder !== 'undefined') {
            decoder = new TextDecoder('utf-8');
        } else {
            var TextDecoder = function() { };
            TextDecoder.prototype.decode = function(buffer) {
                var bytes = new Uint8Array(buffer);
                var str = '';
                for (var i = 0; i < bytes.length; i ++) {
                    str += String.fromCharCode(bytes[i]);
                }
                return str;
            };
            decoder = new TextDecoder();
        }
        var v = decoder.decode(b);
        var z = v.indexOf('\0');
        return (~z) ? v.slice(0, z) : v;
    },
    /**
     * Converts a string to UTF-8 bytes.
     *
     * @param {string} v - The string to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v,b) {
        v || (v = '');
        var encoder;
        if (typeof TextEncoder !== 'undefined') {
            encoder = new TextEncoder('utf-8');
        } else {
            var TextEncoder = function() { };
            TextEncoder.prototype.encode = function (str) {
                var bytes = new Uint8Array(str.length);
                for (var i = 0; i < str.length; i++) {
                    bytes[i] = str.charCodeAt(i);
                }
                return bytes;
            };
            encoder = new TextEncoder();
        }
        var encoded = encoder.encode(v);
        for (var i = 0; i < encoded.length && i < b.length; i++) {
            b[i] = encoded[i];
        }
        return encoded.length;
    }
});

_.char16le = bytefield.bind({
    /**
     * Converts bytes to a UTF-16LE string.
     *
     * @param {ArrayBuffer|Uint8Array} b - The bytes to convert.
     * @returns {string} The resulting string.
     */
    b2v: function (b) {
        var decoder;
        if (typeof TextDecoder !== 'undefined') {
            decoder = new TextDecoder('utf-16le');
        } else {
            var TextDecoder = function() { };
            TextDecoder.prototype.decode = function(buffer) {
                var bytes = new Uint8Array(buffer);
                var str = '';
                for (var i = 0; i < bytes.length; i += 2) {
                    var charCode = bytes[i] | (bytes[i + 1] << 8);
                    str += String.fromCharCode(charCode);
                }
                return str;
            };
            decoder = new TextDecoder();
        }
        var v = decoder.decode(b);
        var z = v.indexOf('\0');
        return (~z) ? v.slice(0, z) : v;
    },
    /**
     * Converts a string to UTF-16LE bytes.
     *
     * @param {string} v - The string to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v,b) {
        v || (v = '');
        var bytesWritten = 0;
        for (var i = 0; i < v.length && bytesWritten + 1 < b.length; i++) {
            var charCode = v.charCodeAt(i);
            b[bytesWritten++] = charCode & 0xFF;
            b[bytesWritten++] = (charCode >> 8) & 0xFF;
        }
        return bytesWritten;
    }
});

_.char16be = bytefield.bind({
    /**
     * Converts bytes to a UTF-16BE string.
     *
     * @param {ArrayBuffer|Uint8Array} b - The bytes to convert.
     * @returns {string} The resulting string.
     */
    b2v: function (b) {
        var temp = new Uint8Array(b);
        swapBytesPairs(temp);
        var decoder;
        if (typeof TextDecoder !== 'undefined') {
            decoder = new TextDecoder('utf-16le');
        } else {
            var TextDecoder = function() { };
            TextDecoder.prototype.decode = function(buffer) {
                var bytes = new Uint8Array(buffer);
                var str = '';
                for (var i = 0; i < bytes.length; i += 2) {
                    var charCode = bytes[i] | (bytes[i + 1] << 8);
                    str += String.fromCharCode(charCode);
                }
                return str;
            };
            decoder = new TextDecoder();
        }
        var v = decoder.decode(temp.buffer);
        var z = v.indexOf('\0');
        return (~z) ? v.slice(0, z) : v;
    },
    /**
     * Converts a string to UTF-16BE bytes.
     *
     * @param {string} v - The string to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v,b) {
        v || (v = '');
        var temp = new Uint8Array(b.length);
        var bytesWritten = 0;
        for (var i = 0; i < v.length && bytesWritten + 1 < temp.length; i++) {
            var charCode = v.charCodeAt(i);
            temp[bytesWritten++] = charCode & 0xFF;
            temp[bytesWritten++] = (charCode >> 8) & 0xFF;
        }
        swapBytesPairs(temp, b);
        return bytesWritten;
    }
});

/**
 * Defines a standard field with specific read and write methods.
 *
 * @param {string} sig - The signature indicating the type. This is assumed to be available in the DataView API as DataView.(get/set)(sig), e.g. "Uint32" is valid because DataView.getUint32() is a valid method
 * @param {number} size - The size of the field in bytes.
 * @param {boolean} littleEndian - Indicates whether or not the field is little endian.
 * @returns {Function} A function to create the standard field.
 */
function standardField(sig, size, littleEndian) {
    var read = 'get' + sig,
        dump = 'set' + sig;
    size || (size = +sig.match(/\d+/)[0] / 8);
    return function (name, count) {
        if (typeof name !== 'string') {
            count = name;
            name = null;
        }
        return arrayizeField({
            /**
             * Unpacks a standard field from bytes.
             *
             * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
             * @param {Object} [off] - The offset object with bytes and bits.
             * @returns {*} The unpacked value.
             */
            valueFromBytes: function (buf, off) {
                off || (off = {bytes:0});
                var bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
                var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                var val = view[read](off.bytes, littleEndian);
                addField(off, this);
                return val;
            },
            /**
             * Packs a standard field into bytes.
             *
             * @param {*} val - The value to pack.
             * @param {ArrayBuffer|Uint8Array} [buf] - The buffer to write to.
             * @param {Object} [off] - The offset object with bytes and bits.
             * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
             */
            bytesFromValue: function (val, buf, off) {
                val || (val = 0);
                buf || (buf = newBuffer(this.size));
                off || (off = {bytes:0});
                var bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
                var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                view[dump](off.bytes, val, littleEndian);
                addField(off, this);
                return buf;
            },
            size: size,
            name: name
        }, count);
    };
}

_.uint8 = standardField('Uint8', 1, false);
_.uint16 = standardField('Uint16', 2, false);
_.uint32 = standardField('Uint32', 4, false);
_.uint16le = standardField('Uint16', 2, true);
_.uint32le = standardField('Uint32', 4, true);

_.int8 = standardField('Int8', 1, false);
_.int16 = standardField('Int16', 2, false);
_.int32 = standardField('Int32', 4, false);
_.int16le = standardField('Int16', 2, true);
_.int32le = standardField('Int32', 4, true);

_.float32 = standardField('Float32', 4, false);
_.float64 = standardField('Float64', 8, false);
_.float32le = standardField('Float32', 4, true);
_.float64le = standardField('Float64', 8, true);

/**
 * Derives a new field based on an existing one with custom pack and unpack functions.
 *
 * @param {Object} orig - The original field to derive from.
 * @param {Function} pack - The function to pack the derived value.
 * @param {Function} unpack - The function to unpack the derived value.
 * @returns {Function} A function to create the derived field.
 */
_.derive = function (orig, pack, unpack) {
    return function (name, count) {
        if (typeof name !== 'string') {
            count = name;
            name = null;
        }
        return arrayizeField(extend({
            /**
             * Unpacks a derived field from bytes.
             *
             * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
             * @param {Object} [off] - The offset object with bytes and bits.
             * @returns {*} The unpacked derived value.
             */
            valueFromBytes: function (buf, off) {
                return unpack(orig.valueFromBytes(buf, off));
            },
            /**
             * Packs a derived field into bytes.
             *
             * @param {*} val - The value to pack.
             * @param {ArrayBuffer|Uint8Array} [buf] - The buffer to write to.
             * @param {Object} [off] - The offset object with bytes and bits.
             * @returns {ArrayBuffer|Uint8Array} The buffer with packed data.
             */
            bytesFromValue: function (val, buf, off) {
                return orig.bytesFromValue(pack(val), buf, off);
            },
            name: name
        }, ('width' in orig) ? {width:orig.width} : {size:orig.size}), count);
    };
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    console.log('module scope');
    module.exports = _;
} else {
    // Export to global scope for browsers
    console.log('not module scope');
    window._ = _;
}
