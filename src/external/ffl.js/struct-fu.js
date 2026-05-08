// @ts-check
/*!
 * struct-fu library: https://github.com/natevw/struct-fu
 * forked by ariankordi: https://github.com/ariankordi/struct-fu
 * @author Nathan Vander Wilt <https://github.com/natevw>
 * @license Apache-2.0
 * @license BSD-2-Clause
 */

// // ---------------------------------------------------------------------
// //  Exported JSDoc Type Definitions
// // ---------------------------------------------------------------------

/**
 * A type representing either a raw ArrayBuffer or a typed view of it.
 * @typedef {ArrayBuffer | Uint8Array} BufferSource
 */

/**
 * A type for the offset/"cursor" used to track the byte and bit offsets.
 * @typedef {Object} Offset
 * @property {number} bytes - Current byte offset.
 * @property {number} [bits] - Current bit offset.
 */

/**
 * A transform interface for bitfields, converting between raw number bits and user values.
 * Notably, the input/output can be number or boolean. (Used by `b2v` and `v2b` methods.)
 * @typedef {Object} BitTransform
 * @property {function(this: {width:number}, number): number|boolean} b2v - Called when reading bits from buffer.
 * @property {function(this: {width:number}, number|boolean): number} v2b - Called when writing bits into buffer.
 * @property {number} [width=1] - The width (in bits) of this bitfield.
 * @property {boolean|null} [littleEndian] - Whether or not the bitfield is little-endian.
 */

/**
 * A transform interface for byte fields, converting between raw bytes and user values.
 * (Used by `b2v` and `vTb` methods.)
 * @typedef {Object} ByteTransform
 * @property {function(BufferSource): *} b2v - Called when reading bytes from buffer.
 * @property {function(*, Uint8Array): number} vTb - Called when writing values into buffer.
 * @property {number} [size=1] - The size (in bytes) of this field.
 */

/**
 * Represents a padding field that ensures proper byte alignment in a struct.
 * It does not hold a value but affects struct layout.
 * @typedef {Object} PaddingField
 * @property {number} _padTo - The byte offset to pad to.
 * @property {string} [_id] - Internal unique ID.
 */

/**
 * A single field definition, which must define how to read (unpack) and write (pack) data.
 * This is the base type that all specialized fields (bitfields, bytefields, etc.) implement.
 * @typedef {Object} Field
 * @property {string} [name] - The name of the field (if any).
 * @property {number} size - The size of the field in bytes (for non-bitfield types).
 * @property {number} [width] - The size of the field in bits (for bitfields).
 * @property {number | Offset} [offset] - Byte or (byte, bits) offset.
 * @property {function(BufferSource, Offset=): *} unpack - Unpacks the field value from a buffer (`valueFromBytes`).
 * @property {function(*, BufferSource=, Offset=): Uint8Array} pack - Packs a value into a buffer (`bytesFromValue`).
 * @property {Object<string, Field>|null} [_hoistFields] - If this is a nested struct, this maps sub-fields to their definitions.
 * @property {Object<string, Field>} [fields] - An object mapping field names to their definitions.
 */

/**
 * Template for the return type of _.struct(), representing an instance of a structure with pack/unpack methods.
 * It is generic in case you want to define a typed object for the data.
 * @template T
 * @typedef StructInstance
 * @property {function(BufferSource, Offset=): T} unpack - Deserialize from a BufferSource into the structured object.
 * @property {function(T, BufferSource=, Offset=): Uint8Array} pack - Serialize the structured object into a Uint8Array.
 * @property {Object<string, Field>} fields - Field definitions keyed by field name.
 * @property {number} size - The total size in bytes of the packed structure.
 * @property {string} [name] - The name of the struct (if provided).
 * @property {Object<string, Field>|null} [_hoistFields] - If this is a nested struct, this maps sub-fields to their definitions.
 */

// // ---------------------------------------------------------------------
// //  UMD / factory setup
// // ---------------------------------------------------------------------

(function (root, factory) {
    // @ts-ignore - cannot find name define
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // @ts-ignore
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node.js/CommonJS

        // In Node (in versions earlier than 11, released 2018), TextEn/Decoder
        // are only available through the "util" package, however bundlers
        // building for browser will see that and always try to include it.

        // Therefore, this will assume TextEncoder/TextDecoder are in globalThis (not root).
        module.exports = factory(globalThis.TextEncoder, globalThis.TextDecoder);
        // NOTE: Uncomment below if you are using versions of Node earlier than 11.
        // module.exports = factory(require('util').TextEncoder, require('util').TextDecoder);
    } else {
        // Browser globals (root is window)

        // Assume TextEncoder/TextDecoder are either defined or undefined in window.
        /** @type {*} */ (root)._ = factory(/** @type {*} */ (root).TextEncoder, /** @type {*} */ (root).TextDecoder);
    }
}(typeof self !== 'undefined' ? self : this,
    // It seems that TypeScript is predicting a type for the whole
    // namespace that includes all functions, and defining any custom
    // returns type ruins that, leaving the .d.ts empty and dry of functions.
    /* eslint-disable jsdoc/require-returns-type */
    /**
     * @param {typeof TextEncoder} _TextEncoder
     * @param {typeof TextDecoder} _TextDecoder
     * @returns Returns the exported namespace.
     */
    function (_TextEncoder, _TextDecoder) {
      /* eslint-enable jsdoc/require-returns-type */
'use strict';

/**
 * A library for defining structs to convert between JSON and binary.
 * Supports numbers, bytes, strings, and bitfields.
 * Compatible with browsers down to Safari 5.1.
 * @namespace _
 */
var _ = {};

// Add ECMA262-5 method binding if not supported natively
// https://github.com/ReactNativeNews/react-native-newsletter/blob/93016f62af32d97cc009f991d4f7c3c7155a4f26/ie.js#L8
if (!('bind' in Function.prototype)) {
    /**
     * @param {Object|null|undefined} owner
     * @returns {Function}
     * @this {Function}
     */
    // @ts-ignore - Property bind does not exist on never?
    Function.prototype.bind = function (owner) {
        var that = this;
        if (arguments.length <= 1) {
            return function () {
                return that.apply(owner, arguments);
            };
        }
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return that.apply(
                owner,
                arguments.length === 0 ? args : args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };
}

// // ---------------------------------------------------------------------
// //  Helper Methods
// // ---------------------------------------------------------------------

/**
 * Creates a new Uint8Array of given size backed by an ArrayBuffer.
 * @param {number} size - The size of the buffer in bytes.
 * @returns {Uint8Array} A new Uint8Array of the specified size.
 */
function newBuffer(size) {
    return new Uint8Array(new ArrayBuffer(size));
}

/**
 * Extends an object with properties from subsequent objects.
 * @param {Object<string, *>} obj - The target object to extend.
 * @returns {Object} The extended target object.
 */
function extend(obj) {
    var args = /** @type {Array<Object<string, *>>} */ (Array.prototype.slice.call(arguments, 1));
    args.forEach(function (ext) {
        Object.keys(ext).forEach(function (key) {
            obj[key] = ext[key];
        });
    });
    return obj;
}

/**
 * Adds a field's size to the current offset cursor (bytes/bits).
 * @param {Offset} ctr - The current offset (bytes, bits).
 * @param {Field} f - The field whose size to add.
 * @returns {Offset} The updated offset cursor.
 * @throws {Error} Improperly aligned bitfield before field
 */
function addField(ctr, f) {
    if ('width' in f && typeof f.width === 'number') {
        ctr.bits = (ctr.bits || 0) + f.width;
        while ((ctr.bits || 0) > 7) {
            ctr.bytes += 1;
            ctr.bits -= 8;
        }
    } else if (!ctr.bits) {
        // Not a bitfield, add full size in bytes.
        ctr.bytes += f.size || 0;
    } else {
        // We have leftover bits that aren't aligned, can't add a normal field.
        throw Error('Improperly aligned bitfield before field: ' + (f.name || ''));
    }
    return ctr;
}

/**
 * Converts a field into an array field if a count is provided.
 * @param {Field} f - The field to arrayize.
 * @param {number} [count] - The number of elements in the array, if needed.
 * @returns {Field} The arrayized field.
 */
function arrayizeField(f, count) {
    var field = (typeof count === 'number') ? /** @type {Field} */ (extend({
        name: f.name,
        field: f,
        /**
         * Unpacks an array of values from bytes.
         * @param {BufferSource} buf - The buffer to read from.
         * @param {Offset} off - The offset object with bytes and bits.
         * @returns {Array<*>} The unpacked array of values.
         */
        unpack: function (buf, off) {
            off || (off = { bytes: 0, bits: 0 });
            var arr = new Array(count);
            for (var idx = 0, len = arr.length; idx < len; idx += 1) {
                arr[idx] = f.unpack(buf, off);
            }
            return arr;
        },
        /**
         * Packs an array of values into bytes.
         * @param {Array<*>} arr
         * @param {BufferSource} [buf]
         * @param {Offset} [off]
         * @returns {Uint8Array}
         * @this {Field}
         */
        pack: function (arr, buf, off) {
            arr || (arr = new Array(count));
            buf || (buf = newBuffer(this.size));
            off || (off = { bytes: 0, bits: 0 });
            for (var idx = 0, len = Math.min(arr.length, count); idx < len; idx += 1) {
                f.pack(arr[idx], buf, off);
            }
            while (idx++ < count) addField(off, f);
            return /** @type {Uint8Array} */ (buf);
        }
    }, (f.width !== undefined)
        ? { width: f.width * count }
        : { size: f.size * count })
    ) : f;
    return field;
}

// // ---------------------------------------------------------------------
// //  _.struct Definition
// // ---------------------------------------------------------------------

/**
 * Defines a new structure with the given fields.
 * Overloads:
 * _.struct(fields, count?)
 * _.struct(name, fields, count?)
 * @param {string|Array<Field>} name - The structure name or the array of fields if no name.
 * @param {Array<Field|StructInstance<*>>|number} [fields] - The array of fields OR the count if the first param was fields.
 * @param {number} [count] - The number of array elements if making an array of structs.
 * @returns {StructInstance<*>} The resulting struct definition (and array, if count was provided).
 * @throws {Error} Invalid .padTo..., Improperly aligned bitfield at end of struct
 */
_.struct = function (name, fields, count) {
    /** @type {string|undefined} */
    var structName;
    /** @type {Array<Field>} */
    var fieldDefs;

    if (typeof name !== 'string') {
        // Overload 1: (fields[, count])
        count = /** @type {number|undefined} */ (fields);
        fieldDefs = /** @type {Array<Field>} */ (name);
    } else {
        // Overload 2: (name, fields[, count])
        structName = name;
        fieldDefs = /** @type {Array<Field>} */ (fields);
    }

    var _size = { bytes: 0, bits: 0 };
    var _padsById = Object.create(null);

    /**
     * @param {Object<string, Field>} obj
     * @param {Field} f
     * @returns {Object<string, Field>}
     * @throws {Error} Invalid .padTo...
     */
    function reduceFunc(obj, f) {
        // Handle _padTo:
        if ('_padTo' in f) {
            var padField = /** @type {PaddingField} */ (f); // Cast to this type.
            // Generate a "pad field" for alignment.
            if (!padField._id) {
                padField._id = 'id' + Math.random().toFixed(20).slice(2); // WORKAROUND: https://github.com/tessel/runtime/issues/716
            }
            var neededPadBytes = padField._padTo - _size.bytes;
            if (_size.bits) {
                // This is a bitfield alignment.
                var bitsNeeded = 8 * neededPadBytes - _size.bits;
                if (bitsNeeded < 0) {
                    throw Error(
                        'Invalid .padTo(' + padField._padTo + ') field, struct is already ' +
                        _size.bytes + ' byte(s) and ' + _size.bits + ' bits!'
                    );
                }
                _padsById[padField._id] = { width: bitsNeeded };
                f.width = bitsNeeded;
            } else {
                if (neededPadBytes < 0) {
                    throw Error(
                        'Invalid .padTo(' + padField._padTo + ') field, struct is already ' + _size.bytes + ' bytes!'
                    );
                }
                _padsById[padField._id] = { size: neededPadBytes };
                f.size = neededPadBytes;
            }
        }

        // Handle sub-struct hoisting:
        if (f._hoistFields) {
            var hoistFields = f._hoistFields; // Otherwise it thinks it's null or undefined below
            Object.keys(hoistFields).forEach(function (subName) {
                var _f = Object.create(hoistFields[subName]);
                if ('width' in _f && typeof _f.width === 'number') {
                    _f.offset = { bytes: _f.offset.bytes + _size.bytes, bits: _f.offset.bits };
                } else {
                    _f.offset = /** @type {number} */ (_f.offset) + _size.bytes;
                }
                obj[subName] = _f;
            });
        } else if (f.name) {
            // Create a local copy, assign offset.
            var localCopy = Object.create(f);
            if ('width' in localCopy && typeof localCopy.width === 'number') {
                localCopy.offset = { bytes: _size.bytes, bits: _size.bits };
            } else {
                localCopy.offset = _size.bytes;
            }
            obj[f.name] = localCopy;
        }

        addField(_size, f);
        return obj;
    }
    /** @type {Object<string, Field>} */
    var fieldsObj = fieldDefs.reduce(reduceFunc, {});


    if (_size.bits) {
        throw Error('Improperly aligned bitfield at end of struct: ' + (structName || ''));
    }

    // Now build the main field definition for the struct.
    var structField = {
        /**
         * Reads (unpacks) a struct from the buffer at the given offset.
         * @param {BufferSource} buf
         * @param {Offset} [off]
         * @returns {*}
         */
        unpack: function (buf, off) {
            off = off || { bytes: 0, bits: 0 };
            /** @type {Object<string, Field>} */
            var obj = {};
            fieldDefs.forEach(function (f) {
                if ('_padTo' in f && /** @type {PaddingField} */ (f)._id !== undefined) {
                    // It's a pad spec; retrieve the pad field from _padsById.
                    addField(/** @type {Offset} */ (off), _padsById[/** @type {PaddingField} */ (f)._id]);
                    return;
                }
                var value = f.unpack(buf, off);
                if (f.name) {
                    obj[f.name] = value;
                } else if (typeof value === 'object') {
                    extend(obj, value);
                }
            });
            return obj;
        },

        /**
         * Writes (packs) the given object into a buffer at the given offset.
         * @param {*} obj
         * @param {BufferSource} [buf]
         * @param {Offset} [off]
         * @returns {Uint8Array}
         */
        pack: function (obj, buf, off) {
            obj = obj || {};
            if (!buf) {
                buf = newBuffer(this.size);
            }
            off = off || { bytes: 0, bits: 0 };
            fieldDefs.forEach(function (f) {
                if ('_padTo' in f && /** @type {PaddingField} */ (f)._id !== undefined) {
                    addField(/** @type {Offset} */ (off), _padsById[/** @type {PaddingField} */ (f)._id]);
                    return;
                }
                var value = f.name ? obj[f.name] : obj;
                f.pack(value, /** @type {BufferSource} */ (buf), off);
            });
            return /** @type {Uint8Array} */ (buf);
        },

        _hoistFields: structName ? null : fieldsObj,
        fields: fieldsObj,
        size: _size.bytes,
        name: structName
    };

    // Cast to StructInstance for type compatibility.
    return /** @type {StructInstance<*>} */ (arrayizeField(structField, count));
};

// // ---------------------------------------------------------------------
// //  Begin Bitfield Helpers
// // ---------------------------------------------------------------------

/**
 * Reads a 32-bit unsigned int from buffer, but handles short lengths by not reading beyond the buffer.
 * Used in valueFromBytes by bitfield logic.
 * @param {BufferSource} buffer - The buffer to read from.
 * @param {number} offset - The byte offset to start reading.
 * @param {boolean} littleEndian - Indicates whether to read little-endian.
 * @returns {number} The read unsigned 32-bit integer.
 */
function truncatedReadUInt32(buffer, offset, littleEndian) {
    var bytes = (buffer instanceof ArrayBuffer) ? new Uint8Array(buffer) : buffer;
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
    }
    return 0x0;
}

/**
 * Writes a 32-bit unsigned int to buffer, but handles short lengths by not writing beyond the buffer.
 * Used in bytesFromValue/pack by bitfield logic.
 * @param {BufferSource} buffer - The buffer to write to.
 * @param {number} offset - The byte offset to start writing.
 * @param {number} data - The unsigned 32-bit integer to write.
 * @param {boolean} littleEndian - Indicates whether to write little-endian.
 */
function truncatedWriteUInt32(buffer, offset, data, littleEndian) {
    var bytes = (buffer instanceof ArrayBuffer) ? new Uint8Array(buffer) : buffer;
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
 * Defines a padding field up to the specified offset in bytes.
 * @param {number} off - The byte offset to pad to.
 * @returns {Field & {_padTo: number, _id?: string}} The padding field definition.
 */
_.padTo = function (off) {
    var field = /** @type {Field & {_padTo: number}} */ ({ _padTo: off,
        // Dummy implementations to satisfy Field:
        size: 0,
        unpack: function () { return null; },
        pack: function () { return newBuffer(0); }
    });
    return field;
};


// NOTE: bitfields must be embedded in a struct (C/C++ share this limitation)

var FULL = 0xFFFFFFFF;

/**
 * A helper for big and little endian bitfields.
 * @param {string} [name] - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Field} The defined bitfield.
 * @throws {Error} Bitfields support a maximum width of 24 bits
 * @this {BitTransform}
 */
function bitfield(name, width, count) {
    if (width === undefined) {
        width = 1;
    }
    // NOTE: width limitation is so all values will align *within* a 4-byte word
    if (width > 24) {
        throw Error('Bitfields support a maximum width of 24 bits.');
    }
    var mask = FULL >>> (32 - width);
    var littleEndian = this.littleEndian;
    if (littleEndian) {
        mask >>>= 0;
    }

    var impl = this;
    return arrayizeField({
        /**
         * @param {BufferSource} buf
         * @param {Offset} [off]
         * @returns {number|boolean}
         * @this {Field & {width: number}}
         */
        unpack: function (buf, off) {
            off = off || { bytes: 0, bits: 0 };
            var over;
            var end;
            var word;
            if (littleEndian) {
                end = off.bits || 0;
                word = truncatedReadUInt32(buf, off.bytes, true) >>> 0;
                over = (word >>> end);
            } else {
                end = (off.bits || 0) + /** @type {number} */ (width);
                word = truncatedReadUInt32(buf, off.bytes, false) || 0;
                over = word >>> (32 - end);
            }
            addField(off, this);
            return impl.b2v.call(this, over & mask);
        },
        /**
         * @param {number} val
         * @param {BufferSource} [buf]
         * @param {Offset} [off]
         * @returns {Uint8Array}
         * @this {Field & {width: number}}
         */
        pack: function (val, buf, off) {
            val = impl.v2b.call(this, val || 0);
            if (!buf) {
                buf = newBuffer(/** @type {number} */(this.size));
            }
            off = off || { bytes: 0, bits: 0 };
            var word;
            var zero;
            var over;
            if (littleEndian) {
                word = truncatedReadUInt32(buf, off.bytes, true) >>> 0;
                var shift = off.bits || 0;
                zero = (mask << shift) >>> 0;
                word &= ~zero;
                over = (val & mask) << shift;
                word = (word | over) >>> 0; // WORKAROUND: https://github.com/tessel/runtime/issues/644
                truncatedWriteUInt32(buf, off.bytes, word, true);
            } else {
                var end = (off.bits || 0) + /** @type {number} */ (width);
                word = truncatedReadUInt32(buf, off.bytes, false) || 0;
                zero = mask << (32 - end);
                over = (val & mask) << (32 - end);
                word &= ~zero;
                word = (word | over) >>> 0; // WORKAROUND: https://github.com/tessel/runtime/issues/644
                truncatedWriteUInt32(buf, off.bytes, word, false);
            }
            addField(off, this);
            return new Uint8Array(buf);
        },
        width: width,
        size: 0, // Placeholder for bitfields.
        name: name
    }, count);
}

// // ---------------------------------------------------------------------
// //  Begin Bitfield Definitions
// // ---------------------------------------------------------------------

/**
 * Boolean field: 1-bit big-endian bitfield that interprets 1/0 as true/false.
 * @param {string} [name]
 * @param {number} [count]
 * @returns {Field}
 */
_.bool = function (name, count) {
    return bitfield.call({
        /**
         * Converts a bitfield to a boolean.
         * @param {number} b - The bitfield value.
         * @returns {boolean} The boolean representation.
         */
        b2v: function (b) { return Boolean(b); },
        /**
         * Converts a boolean to a bitfield.
         * @param {number|boolean} v - The boolean value.
         * @returns {number} The bitfield representation.
         */
        v2b: function (v) { return v ? FULL : 0; }
    }, name, 1, count);
};

/**
 * Unsigned bitfield (big-endian).
 */
_.ubit = bitfield.bind({
    /**
     * Converts a bitfield to a value.
     * @param {number} b - The bitfield value.
     * @returns {number} The numeric value.
     */
    b2v: function (b) { return b; },
    /**
     * Converts a value to a bitfield.
     * @param {number|boolean} v - The numeric value.
     * @returns {number} The bitfield representation.
     */
    v2b: function (v) { return Number(v); }
});

/**
 * Unsigned bitfield (little-endian).
 * @param {string} name - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Object} The defined little-endian bitfield.
 */
_.ubitLE = bitfield.bind({
    /**
     * Converts a bitfield to a little-endian value.
     * @param {number} b - The bitfield value.
     * @returns {number} The little-endian numeric value.
     */
    b2v: function (b) { return b; },
    /**
     * Converts a little-endian value to a bitfield.
     * @param {number|boolean} v - The little-endian numeric value.
     * @returns {number} The bitfield representation.
     */
    v2b: function (v) { return Number(v); },
    littleEndian: true
});

/**
 * Signed bitfield (big-endian).
 * @param {string} name - The name of the bitfield.
 * @param {number} [width=1] - The width of the bitfield in bits.
 * @param {number} [count] - The number of bitfields in an array.
 * @returns {Object} The defined signed bitfield.
 */
_.sbit = bitfield.bind({
    /**
     * Converts a bitfield to a signed value.
     * @param {number} b - The bitfield value.
     * @returns {number} The signed numeric value.
     */
    b2v: function (b) {
        var m = 1 << ((this.width || 1) - 1);
        var s = b & m;
        return (s) ? -(b &= ~m) : b;
    },
    /**
     * Converts a signed value to a bitfield.
     * @param {number|boolean} v - The signed numeric value.
     * @returns {number} The bitfield representation.
     */
    v2b: function (v) {
        v = Number(v);
        var m = 1 << ((this.width || 1) - 1);
        var s = (v < 0);
        return (s) ? (-v | m) : v;
    }
});

/**
 * Creates a simple "byte field" for reading/writing raw bytes.
 * @param {string|number} name - The name of the bytefield or its size if name is omitted.
 * @param {number} [size=1] - The size of the bytefield in bytes.
 * @param {number} [count] - The number of bytefields in an array.
 * @returns {Field & ByteTransform} The defined bytefield.
 * @this {ByteTransform}
 */
function bytefield(name, size, count) {
    /** @type {string|undefined} */
    var fieldName;
    /** @type {number} */
    var fieldSize = 1;
    if (typeof name === 'string') {
        fieldName = name;
        if (typeof size === 'number') {
            fieldSize = size;
        }
    } else {
        // Shift params.
        fieldSize = name;
        count = size; // pass along
    }
    var impl = this;

    return /** @type {Field & ByteTransform} */ (arrayizeField(/** @type {Field & ByteTransform} */ ({
        name: fieldName,
        size: fieldSize,

        /**
         * @param {BufferSource} buf
         * @param {Offset} [off]
         * @returns {Uint8Array}
         */
        unpack: function (buf, off) {
            off = off || { bytes: 0, bits: 0 };
            var bytes = (buf instanceof ArrayBuffer) ? new Uint8Array(buf) : buf;
            var val = bytes.subarray(off.bytes, off.bytes + /** @type {number} */ (this.size));
            addField(off, this);
            return impl.b2v.call(this, val);
        },

        /**
         * @param {Array<number>|Uint8Array|ArrayBuffer} val
         * @param {BufferSource} [buf]
         * @param {Offset} [off]
         * @returns {Uint8Array}
         */
        pack: function (val, buf, off) {
            if (!buf) {
                buf = newBuffer(/** @type {number} */ (this.size));
            }
            off = off || { bytes: 0, bits: 0 };
            var bytes = (buf instanceof ArrayBuffer) ? new Uint8Array(buf) : buf;
            var blk = bytes.subarray(off.bytes, off.bytes + /** @type {number} */ (this.size));
            impl.vTb.call(this, val, blk);
            addField(off, this);
            return /** @type {Uint8Array} */ (buf);
        },

        // Default transforms:
        /**
         * @param {Uint8Array} b
         * @returns {Uint8Array}
         */
        b2v: function (b) { return b; },
        /**
         * @param {Array<number>|Uint8Array|ArrayBuffer} v
         * @param {Uint8Array} b
         * @returns {number}
         */
        vTb: function (v, b) {
            if (!v) return 0;
            var src = new Uint8Array(v);
            b.set(src.subarray(0, b.length));
            return b.length;
        }
    }), count));
}

/**
 * Swaps adjacent byte pairs in a buffer, used for big-endian <-> little-endian char16 manipulations.
 * http://stackoverflow.com/a/7460958/72637
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

/** Basic raw byte field. */
_.byte = bytefield.bind({
    /**
     * Converts bytes to a value.
     * @param {BufferSource} b - The bytes to convert.
     * @returns {Uint8Array} The byte value.
     */
    b2v: function (b) { return new Uint8Array(b); },
    /**
     * Converts a value to bytes.
     * @param {BufferSource} v - The value to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v, b) { if (!v) return 0; b.set(new Uint8Array(v)); return v.byteLength; }
});

// // ---------------------------------------------------------------------
// //  Character Field Definitions
// // ---------------------------------------------------------------------

/** Null-terminated UTF-8 string field. */
_.char = bytefield.bind({
    /**
     * Converts bytes to a UTF-8 string.
     * @param {BufferSource} b - The bytes to convert.
     * @returns {string} The resulting string.
     */
    b2v: function (b) {
        var decoder;
        if (typeof _TextDecoder !== 'undefined' && _TextDecoder) {
            decoder = new _TextDecoder('utf-8');
        } else {
            // Fallback minimal polyfill
            decoder = {
                /**
                 * @param {BufferSource} buf
                 * @returns {string}
                 */
                decode: function (buf) {
                    var bytes = new Uint8Array(buf);
                    var str = '';
                    for (var i = 0; i < bytes.length; i++) {
                        str += String.fromCharCode(bytes[i]);
                    }
                    return str;
                }
            };
        }
        var v = decoder.decode(b);
        var z = v.indexOf('\0');
        return (~z) ? v.slice(0, z) : v;
    },
    /**
     * Converts a string to UTF-8 bytes.
     * @param {string} v - The string to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v, b) {
        v || (v = '');
        var encoder;
        if (typeof _TextEncoder !== 'undefined' && _TextEncoder) {
            encoder = new _TextEncoder();
        } else {
            // Fallback minimal polyfill
            encoder = {
                /**
                 * @param {string} str
                 * @returns {Uint8Array}
                 */
                encode: function (str) {
                    var arr = new Uint8Array(str.length);
                    for (var i = 0; i < str.length; i++) {
                        arr[i] = str.charCodeAt(i) & 0xff;
                    }
                    return arr;
                }
            };
        }
        var encoded = encoder.encode(v);
        for (var i = 0; i < encoded.length && i < b.length; i++) {
            b[i] = encoded[i];
        }
        return encoded.length;
    }
});

/** Null-terminated UTF-16LE string field. */
_.char16le = bytefield.bind({
    /**
     * Converts bytes to a UTF-16LE string.
     * @param {BufferSource} b - The bytes to convert.
     * @returns {string} The resulting string.
     */
    b2v: function (b) {
        var decoder;
        if (typeof _TextDecoder !== 'undefined' && _TextDecoder) {
            decoder = new _TextDecoder('utf-16le');
        } else {
            // fallback
            decoder = {
                /**
                 * @param {BufferSource} buf
                 * @returns {string}
                 */
                decode: function (buf) {
                    var bytes = new Uint8Array(buf);
                    var str = '';
                    for (var i = 0; i < bytes.length; i += 2) {
                        var charCode = bytes[i] | (bytes[i + 1] << 8);
                        str += String.fromCharCode(charCode);
                    }
                    return str;
                }
            };
        }
        var v = decoder.decode(b);
        var z = v.indexOf('\0');
        return (~z) ? v.slice(0, z) : v;
    },
    /**
     * Converts a string to UTF-16LE bytes.
     * @param {string} v - The string to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v, b) {
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

/** Null-terminated UTF-16BE string field. */
_.char16be = bytefield.bind({
    /**
     * Converts bytes to a UTF-16BE string.
     * @param {BufferSource} b - The bytes to convert.
     * @returns {string} The resulting string.
     */
    b2v: function (b) {
        var temp = new Uint8Array(b);
        swapBytesPairs(temp);
        var decoder;
        if (typeof _TextDecoder !== 'undefined' && _TextDecoder) {
            decoder = new _TextDecoder('utf-16le');
        } else {
            // fallback
            decoder = {
                /**
                 * @param {BufferSource} buf
                 * @returns {string}
                 */
                decode: function (buf) {
                    var bytes = new Uint8Array(buf);
                    var str = '';
                    for (var i = 0; i < bytes.length; i += 2) {
                        var charCode = bytes[i] | (bytes[i + 1] << 8);
                        str += String.fromCharCode(charCode);
                    }
                    return str;
                }
            };
        }
        var v = decoder.decode(/** @type {ArrayBuffer} */ (temp.buffer));
        var z = v.indexOf('\0');
        return (~z) ? v.slice(0, z) : v;
    },
    /**
     * Converts a string to UTF-16BE bytes.
     * @param {string} v - The string to convert.
     * @param {Uint8Array} b - The buffer to write to.
     * @returns {number} The number of bytes written.
     */
    vTb: function (v, b) {
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

// // ---------------------------------------------------------------------
// //  dataViewField Definition
// // ---------------------------------------------------------------------

/**
 * Defines a standard field based on read/write methods for a DataView.
 * @param {function(this:DataView, number, boolean):number} getFn - The DataView getter.
 * @param {function(this:DataView, number, number, boolean):void} setFn - The DataView setter.
 * @param {number} size - The size of the field in bytes (4 for Uint32, etc.).
 * @param {boolean} littleEndian - Indicates whether or not the field is little endian.
 * @returns {function((string|number), number=): Field} A function to create the field.
 */
function dataViewField(getFn, setFn, size, littleEndian) {
    /**
     * @param {string|number} name
     * @param {number} [count]
     * @returns {Field}
     */
    var func = function (name, count) {
        /** @type {string|undefined} */
        var fieldName;
        if (typeof name === 'string') {
            fieldName = name;
        } else {
            // shift
            count = name;
        }

        return arrayizeField({
            name: fieldName,
            size: size,

            /**
             * @param {BufferSource} buf
             * @param {Offset} [off]
             * @returns {number}
             */
            unpack: function (buf, off) {
                off = off || { bytes: 0 };
                var bytes = (buf instanceof ArrayBuffer) ? new Uint8Array(buf) : buf;
                var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                var val = getFn.call(view, off.bytes, littleEndian);
                addField(off, this);
                return val;
            },
            /**
             * @param {number} val
             * @param {BufferSource} [buf]
             * @param {Offset} [off]
             * @returns {Uint8Array}
             */
            pack: function (val, buf, off) {
                if (val === undefined || val === null) {
                    val = 0;
                }
                if (!buf) {
                    buf = newBuffer(this.size);
                }
                off = off || { bytes: 0 };
                var bytes = (buf instanceof ArrayBuffer) ? new Uint8Array(buf) : buf;
                var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                setFn.call(view, off.bytes, val, littleEndian);
                addField(off, this);
                return new Uint8Array(buf);
            }
        }, count);
    };
    return func;
}

// // ---------------------------------------------------------------------
// //  DataView Field Definitions
// // ---------------------------------------------------------------------

var DV = DataView.prototype; // Alias for brevity.

// Unsigned integers
_.uint8    = dataViewField(DV.getUint8,  DV.setUint8,  1, false);
_.uint16   = dataViewField(DV.getUint16, DV.setUint16, 2, false);
_.uint32   = dataViewField(DV.getUint32, DV.setUint32, 4, false);
_.uint16le = dataViewField(DV.getUint16, DV.setUint16, 2, true);
_.uint32le = dataViewField(DV.getUint32, DV.setUint32, 4, true);

// Signed integers
_.int8    = dataViewField(DV.getInt8,  DV.setInt8,  1, false);
_.int16   = dataViewField(DV.getInt16, DV.setInt16, 2, false);
_.int32   = dataViewField(DV.getInt32, DV.setInt32, 4, false);
_.int16le = dataViewField(DV.getInt16, DV.setInt16, 2, true);
_.int32le = dataViewField(DV.getInt32, DV.setInt32, 4, true);

// Floating-point numbers
_.float32   = dataViewField(DV.getFloat32, DV.setFloat32, 4, false);
_.float64   = dataViewField(DV.getFloat64, DV.setFloat64, 8, false);
_.float32le = dataViewField(DV.getFloat32, DV.setFloat32, 4, true);
_.float64le = dataViewField(DV.getFloat64, DV.setFloat64, 8, true);

/**
 * Derives a new field based on an existing one with custom pack and unpack functions.
 * The types are intentionally any.
 * @param {Field} orig - The original field to derive from.
 * @param {function(*): *} pack - The function to pack the derived value.
 * @param {function(*): *} unpack - The function to unpack the derived value.
 * @returns {function((string|number)=, number=): Field} A function to create the derived field.
 */
_.derive = function (orig, pack, unpack) {
    /**
     * @param {string|number} [name]
     * @param {number} [count]
     * @returns {Field}
     */
    var func = function (name, count) {
        /** @type {string|null} */
        var fieldName = null;
        if (typeof name === 'string') {
            fieldName = name;
        } else {
            count = name;
        }

        var derived = /** @type {Field} */ (extend({
            /**
             * @param {BufferSource} buf
             * @param {Offset} [off]
             * @returns {*}
             */
            unpack: function (buf, off) {
                var rawVal = orig.unpack(buf, off);
                return unpack(rawVal);
            },
            /**
             * @param {*} val
             * @param {BufferSource} buf
             * @param {Offset} [off]
             * @returns {Uint8Array}
             */
            pack: function (val, buf, off) {
                var packed = pack(val);
                return orig.pack(packed, buf, off);
            },
            name: fieldName
        },
        ('width' in orig)
            ? { width: orig.width }
            : { size: orig.size }
        ));

        return arrayizeField(derived, count);
    };
    return func;
};

// Return the `_` object for whichever loader environment we're in.
return _;
}));
