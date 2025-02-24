/*!
 * The following is a version of the struct-fu library
 * fork by ariankordi: https://github.com/ariankordi/struct-fu
 * with the following changes made for code size:
 * Added: _.uintptr, mapping to _.uint32le (with WASM in mind)
 * Added (TODO): add JSDoc StructInstance template
 * Removed: Polyfills Function.prototype.bind, TextEncoder/TextDecoder
 * Removed: bitfield, bitfieldLE...
 * Removed: char16be, swapBytesPairs
 * Removed: 64-bit types, 16-bit float
 * Modified: addField (no bit handling), _.struct (rm "aligned bitfield" message)
 */


/**
 * A library for defining structs to convert between JSON and binary.
 * Supports numbers, bytes, and strings.
 * Required: Support for TypedArray, Function.prototype.bind, TextEncoder/TextDecoder
 *
 * @namespace
 */
var _ = {};

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
 * @param {Object} ctr - The current cursor with bytes.
 * @param {Object} f - The field to add.
 * @returns {Object} The updated cursor.
 */
function addField(ctr, f) {
    ctr.bytes += f.size;
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
            off || (off = { bytes: 0, bits: 0 });
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
            off || (off = { bytes: 0, bits: 0 });
            for (var idx = 0, len = Math.min(arr.length, count); idx < len; idx += 1) {
                f.bytesFromValue(arr[idx], buf, off);
            }
            while (idx++ < count) addField(off, f);
            return buf;
        }
    }, ('width' in f) ? { width: f.width * count } : { size: f.size * count }) : f;
    f2.pack = f2.bytesFromValue;
    f2.unpack = f2.valueFromBytes;
    return f2;
}

/**
 * Defines a new structure with the given fields.
 *
 * @param {any} [name] - The name of the structure.
 * @param {Array} [fields] - The array of field definitions.
 * @param {number} [count] - The number of structures in an array.
 * @returns {Object} The defined structure with pack and unpack methods.
 */
_.struct = function (name, fields, count) {
    if (typeof name !== 'string') {
        count = fields;
        fields = name;
        name = null;
    }

    var _size = { bytes: 0, bits: 0 },
        _padsById = Object.create(null),
        fieldsObj = fields.reduce(function (obj, f) {
            if ('_padTo' in f) {
                // HACK: we really should just make local copy of *all* fields
                f._id || (f._id = 'id' + Math.random().toFixed(20).slice(2)); // WORKAROUND: https://github.com/tessel/runtime/issues/716
                var _f = _padsById[f._id] = (_size.bits) ? {
                    width: 8 * (f._padTo - _size.bytes) - _size.bits
                } : {
                    size: f._padTo - _size.bytes
                };
                if ((_f.width !== undefined && _f.width < 0) || (_f.size !== undefined && _f.size < 0)) {
                    var xtraMsg = (_size.bits) ? (' and ' + _size.bits + ' bits') : '';
                    throw Error('Invalid .padTo(' + f._padTo + ') field, struct is already ' + _size.bytes + ' byte(s)' + xtraMsg + '!');
                }
                f = _f;
            } else if (f._hoistFields) {
                Object.keys(f._hoistFields).forEach(function (name) {
                    var _f = Object.create(f._hoistFields[name]);
                    if ('width' in _f) {
                        _f.offset = { bytes: _f.offset.bytes + _size.bytes, bits: _f.offset.bits };
                    } else {
                        _f.offset += _size.bytes;
                    }
                    obj[name] = _f;
                });
            } else if (f.name) {
                f = Object.create(f);           // local overrides
                f.offset = ('width' in f) ? { bytes: _size.bytes,bits: _size.bits } : _size.bytes,
                obj[f.name] = f;
            }
            addField(_size, f);
            return obj;
        }, {});
    if (_size.bits) throw Error('Improperly aligned bitfield at end of struct: ' + name);

    return arrayizeField({
        /**
         * Unpacks a structure from bytes.
         *
         * @param {ArrayBuffer|Uint8Array} buf - The buffer to read from.
         * @param {Object} [off] - The offset object with bytes and bits.
         * @returns {Object} The unpacked structure.
         */
        valueFromBytes: function (buf, off) {
            off || (off = { bytes: 0, bits: 0 });
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
            off || (off = { bytes: 0, bits: 0 });
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
 * Defines a padding field up to the specified offset.
 *
 * @param {number} off - The byte offset to pad to.
 * @returns {Object} The padding field definition.
 */
_.padTo = function (off) {
    return { _padTo: off };
};

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
            off || (off = { bytes: 0, bits: 0 });
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
        var decoder = new TextDecoder('utf-8');
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
        var encoder = new TextEncoder('utf-8');
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
        var decoder = new TextDecoder('utf-16le');
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
                off || (off = { bytes: 0 });
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
                off || (off = { bytes: 0 });
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
_.uintptr = _.uint32le; // assuming WASM/32 bit pointers only

_.int8 = standardField('Int8', 1, false);
_.int16 = standardField('Int16', 2, false);
_.int32 = standardField('Int32', 4, false);
_.int16le = standardField('Int16', 2, true);
_.int32le = standardField('Int32', 4, true);

_.float32 = standardField('Float32', 4, false);
_.float32le = standardField('Float32', 4, true);

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
        }, ('width' in orig) ? { width: orig.width } : { size: orig.size }), count);
    };
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
} else {
    // Export to global scope for browsers
    window._ = _;
}
