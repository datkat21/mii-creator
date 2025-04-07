// @ts-check
'use strict';
/*!
 * Bindings for FFL, a Mii renderer, in JavaScript.
 * https://github.com/ariankordi/FFL.js
 * @author Arian Kordi <https://github.com/ariankordi>
 */

// ------------------ ESM imports, uncomment if you use ESM ------------------
// Also see the bottom of the script for corresponding exports.
import * as THREE from 'three';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.0/+esm';
import * as _Import from './struct-fu.js';

// Hack to get library globals recognized throughout the file (remove for ESM).
/**
 * @typedef {import('./struct-fu')} _
 * @typedef {import('three')} THREE
 */
/* eslint-disable no-self-assign -- Get TypeScript to identify global imports. */
globalThis._ = /** @type {_} */ (/** @type {*} */ (globalThis)._);
globalThis.THREE = /** @type {THREE} */ (/** @type {*} */ (globalThis).THREE);
// NOTeslint-disable-next-line @stylistic/max-statements-per-line --  Hack to use either UMD or browser ESM import.
let _ = globalThis._; _ = (!_) ? _Import : _; // Uncomment for ESM
/* eslint-enable no-self-assign -- Get TypeScript to identify global imports. */
/* globals _ THREE -- Global dependencies. */

// // ---------------------------------------------------------------------
// //  Emscripten Types
// // ---------------------------------------------------------------------
// TODO PATH: src/ModuleType.js

/**
 * Emscripten "Module" type.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
 * @typedef {Object} Module
 * @property {function(): void} onRuntimeInitialized
 * @property {function(object): void} destroy
 * @property {boolean|null} calledRun
 * // USE_TYPED_ARRAYS == 2
 * @property {Int8Array} HEAP8
 * @property {Uint8Array} HEAPU8
 * @property {Uint16Array} HEAPU16
 * @property {Uint32Array} HEAPU32
 * @property {Float32Array} HEAPF32
 * Runtime methods:
 * @property {function(number): number} _malloc
 * @property {function(number): void} _free
 * @property {function((...args: *[]) => *, string=): number} addFunction
 * @property {function(number): void} removeFunction
 *
 * ------------------------------- FFL Bindings -------------------------------
 * @property {function(number, number, number, number): *} _FFLInitCharModelCPUStepWithCallback
 * @property {function(number, number, number): *} _FFLInitCharModelCPUStep
 * @property {function(number): *} _FFLDeleteCharModel
 * @property {function(number): *} _FFLGetDrawParamOpaFaceline
 * @property {function(number): *} _FFLGetDrawParamOpaBeard
 * @property {function(number): *} _FFLGetDrawParamOpaNose
 * @property {function(number): *} _FFLGetDrawParamOpaForehead
 * @property {function(number): *} _FFLGetDrawParamOpaHair
 * @property {function(number): *} _FFLGetDrawParamOpaCap
 * @property {function(number): *} _FFLGetDrawParamXluMask
 * @property {function(number): *} _FFLGetDrawParamXluNoseLine
 * @property {function(number): *} _FFLGetDrawParamXluGlass
 * @property {function(number, number): *} _FFLSetExpression
 * @property {function(number): *} _FFLGetExpression
 * @property {function(number, number): *} _FFLSetViewModelType
 * @property {function(number, number): *} _FFLGetBoundingBox
 * @property {function(number, number): *} _FFLIsAvailableExpression
 * @property {function(number, number): *} _FFLSetCoordinate
 * @property {function(number): *} _FFLSetScale
 * @property {function(number, number, number, number): *} _FFLiGetRandomCharInfo
 * @property {function(number, number): *} _FFLpGetStoreDataFromCharInfo
 * @property {function(number, number): *} _FFLpGetCharInfoFromStoreData
 * @property {function(number, number): *} _FFLpGetCharInfoFromMiiDataOfficialRFL
 * @property {function(number, number, number, number, boolean): *} _FFLGetAdditionalInfo
 * @property {function(number, number): *} _FFLInitRes
 * @property {function(): *} _FFLInitResGPUStep
 * @property {function(): *} _FFLExit
 * @property {function(): *} _FFLIsAvailable
 * @property {function(number, number): *} _FFLGetFavoriteColor
 * @property {function(number): *} _FFLSetLinearGammaMode
 * @property {function(number, number): *} _FFLGetFacelineColor
 * @property {function(boolean): *} _FFLSetTextureFlipY
 * @property {function(boolean): *} _FFLSetNormalIsSnorm8_8_8_8
 * @property {function(boolean): *} _FFLSetFrontCullForFlipX
 * @property {function(number): *} _FFLSetTextureCallback
 * @property {function(number): *} _FFLiDeleteTextureTempObject
 * @property {function(number, number, number): *} _FFLiDeleteTempObjectMaskTextures
 * @property {function(number, number, number): *} _FFLiDeleteTempObjectFacelineTexture
 * @property {function(number): *} _FFLiiGetEyeRotateOffset
 * @property {function(number): *} _FFLiiGetEyebrowRotateOffset
 * @property {function(number): *} _FFLiInvalidateTempObjectFacelineTexture
 * @property {function(number): *} _FFLiInvalidatePartsTextures
 * @property {function(number): *} _FFLiInvalidateRawMask
 * @property {function(number, boolean): *} _FFLiVerifyCharInfoWithReason
 * @property {function(): void} _exit
 */

// // ---------------------------------------------------------------------
// //  Enum Definitions
// // ---------------------------------------------------------------------
// TODO PATH: src/Enums.js

/**
 * Uses FFL decomp enum rather than real FFL enum.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 * @enum {number}
 */
const FFLResult = {
	OK: 0,
	ERROR: 1,
	HDB_EMPTY: 2,
	FILE_INVALID: 3,
	MANAGER_NOT_CONSTRUCT: 4,
	FILE_LOAD_ERROR: 5,
	// : 6,
	FILE_SAVE_ERROR: 7,
	// : 8,
	RES_FS_ERROR: 9,
	ODB_EMPTY: 10,
	// :  11,
	OUT_OF_MEMORY: 12,
	// :  13,
	// :  14,
	// :  15,
	// :  16,
	UNKNOWN_17: 17,
	FS_ERROR: 18,
	FS_NOT_FOUND: 19,
	MAX: 20
};

/** @enum {number} */
const FFLiShapeType = {
	OPA_BEARD: 0,
	OPA_FACELINE: 1,
	OPA_HAIR_NORMAL: 2,
	OPA_FOREHEAD_NORMAL: 3,
	XLU_MASK: 4,
	XLU_NOSELINE: 5,
	OPA_NOSE: 6,
	OPA_HAT_NORMAL: 7,
	XLU_GLASS: 8,
	OPA_HAIR_CAP: 9,
	OPA_FOREHEAD_CAP: 10,
	OPA_HAT_CAP: 11,
	MAX: 12
};

/** @enum {number} */
const FFLAttributeBufferType = {
	POSITION: 0,
	TEXCOORD: 1,
	NORMAL: 2,
	TANGENT: 3,
	COLOR: 4,
	MAX: 5
};

/** @enum {number} */
const FFLCullMode = {
	NONE: 0,
	BACK: 1,
	FRONT: 2,
	MAX: 3
};

/** @enum {number} */
const FFLModulateMode = {
	/** No Texture, Has Color (R) */
	CONSTANT: 0,
	/** Has Texture, No Color */
	TEXTURE_DIRECT: 1,
	/** Has Texture, Has Color (R + G + B) */
	RGB_LAYERED: 2,
	/** Has Texture, Has Color (R) */
	ALPHA: 3,
	/** Has Texture, Has Color (R) */
	LUMINANCE_ALPHA: 4,
	/** Has Texture, Has Color (R) */
	ALPHA_OPA: 5
};

/** @enum {number} */
const FFLModulateType = {
	SHAPE_FACELINE: 0,
	SHAPE_BEARD: 1,
	SHAPE_NOSE: 2,
	SHAPE_FOREHEAD: 3,
	SHAPE_HAIR: 4,
	SHAPE_CAP: 5,
	SHAPE_MASK: 6,
	SHAPE_NOSELINE: 7,
	SHAPE_GLASS: 8,
	MUSTACHE: 9,
	MOUTH: 10,
	EYEBROW: 11,
	EYE: 12,
	MOLE: 13,
	FACE_MAKE: 14,
	FACE_LINE: 15,
	FACE_BEARD: 16,
	FILL: 17,
	SHAPE_MAX: 9
};

/** @enum {number} */
const FFLResourceType = {
	MIDDLE: 0,
	HIGH: 1,
	MAX: 2
};

/**
 * Reference: https://github.com/ariankordi/ffl/blob/nsmbu-win-port-linux64/include/nn/ffl/FFLExpression.h
 * @enum {number}
 */
const FFLExpression = {
	NORMAL: 0,
	SMILE: 1,
	ANGER: 2,
	/** Primary name for expression 3. */
	SORROW: 3,
	PUZZLED: 3,
	/** Primary name for expression 4. */
	SURPRISE: 4,
	SURPRISED: 4,
	BLINK: 5,
	OPEN_MOUTH: 6,
	/** Primary name for expression 7. */
	SMILE_OPEN_MOUTH: 7,
	HAPPY: 7,
	ANGER_OPEN_MOUTH: 8,
	SORROW_OPEN_MOUTH: 9,
	SURPRISE_OPEN_MOUTH: 10,
	BLINK_OPEN_MOUTH: 11,
	WINK_LEFT: 12,
	WINK_RIGHT: 13,
	WINK_LEFT_OPEN_MOUTH: 14,
	WINK_RIGHT_OPEN_MOUTH: 15,
	/** Primary name for expression 16. */
	LIKE_WINK_LEFT: 16,
	LIKE: 16,
	LIKE_WINK_RIGHT: 17,
	FRUSTRATED: 18,

	// Additional expressions from AFL.
	// Enum names are completely made up.
	BORED: 19,
	BORED_OPEN_MOUTH: 20,
	SIGH_MOUTH_STRAIGHT: 21,
	SIGH: 22,
	DISGUSTED_MOUTH_STRAIGHT: 23,
	DISGUSTED: 24,
	LOVE: 25,
	LOVE_OPEN_MOUTH: 26,
	DETERMINED_MOUTH_STRAIGHT: 27,
	DETERMINED: 28,
	CRY_MOUTH_STRAIGHT: 29,
	CRY: 30,
	BIG_SMILE_MOUTH_STRAIGHT: 31,
	BIG_SMILE: 32,
	CHEEKY: 33,
	CHEEKY_DUPLICATE: 34,
	JOJO_EYES_FUNNY_MOUTH: 35,
	JOJO_EYES_FUNNY_MOUTH_OPEN: 36,
	SMUG: 37,
	SMUG_OPEN_MOUTH: 38,
	RESOLVE: 39,
	RESOLVE_OPEN_MOUTH: 40,
	UNBELIEVABLE: 41,
	UNBELIEVABLE_DUPLICATE: 42,
	CUNNING: 43,
	CUNNING_DUPLICATE: 44,
	RASPBERRY: 45,
	RASPBERRY_DUPLICATE: 46,
	INNOCENT: 47,
	INNOCENT_DUPLICATE: 48,
	CAT: 49,
	CAT_DUPLICATE: 50,
	DOG: 51,
	DOG_DUPLICATE: 52,
	TASTY: 53,
	TASTY_DUPLICATE: 54,
	MONEY_MOUTH_STRAIGHT: 55,
	MONEY: 56,
	SPIRAL_MOUTH_STRAIGHT: 57,
	CONFUSED: 58,
	CHEERFUL_MOUTH_STRAIGHT: 59,
	CHEERFUL: 60,
	BLANK_61: 61,
	BLANK_62: 62,
	GRUMBLE_MOUTH_STRAIGHT: 63,
	GRUMBLE: 64,
	MOVED_MOUTH_STRAIGHT: 65,
	MOVED: 66,
	SINGING_MOUTH_SMALL: 67,
	SINGING: 68,
	STUNNED: 69,

	MAX: 70
};

/**
 * Model flags modify how the head model is created. These are
 * used in the `modelFlag` property of {@link FFLCharModelDesc}.
 * @enum {number}
 */
const FFLModelFlag = {
	/** Default model setting. */
	NORMAL: 1 << 0,
	/** Uses a variant of hair designed for hats. */
	HAT: 1 << 1,
	/** Discards hair from the model, used for helmets and similar headwear. */
	FACE_ONLY: 1 << 2,
	/** Limits Z depth on the nose, useful for helmets and similar headwear. */
	FLATTEN_NOSE: 1 << 3,
	/** Enables the model's expression flag to use expressions beyond 32. */
	NEW_EXPRESSIONS: 1 << 4,
	/**
	 * This flag only generates new textures when initializing a CharModel
	 * but does not initialize shapes.
	 * **Note:** This means you cannot use DrawOpa/Xlu when this is set.
	 */
	NEW_MASK_ONLY: 1 << 5
};

// // ---------------------------------------------------------------------
// //  Struct Definitions (struct-fu)
// // ---------------------------------------------------------------------
// TODO PATH: src/Structs.js
// Mostly leading up to FFLDrawParam.

/** Mirror for {@link _.uint32le} to indicate a pointer. */
const _uintptr = _.uint32le;

/**
 * @typedef {Object} FFLAttributeBuffer
 * @property {number} size
 * @property {number} stride
 * @property {number} ptr
 */
/** @type {import('./struct-fu').StructInstance<FFLAttributeBuffer>} */
const FFLAttributeBuffer = _.struct([
	_.uint32le('size'),
	_.uint32le('stride'),
	_uintptr('ptr')
]);

/**
 * @typedef {Object} FFLAttributeBufferParam
 * @property {Array<FFLAttributeBuffer>} attributeBuffers
 */
/** @type {import('./struct-fu').StructInstance<FFLAttributeBufferParam>} */
const FFLAttributeBufferParam = _.struct([
	_.struct('attributeBuffers', [FFLAttributeBuffer], 5)
]);

/**
 * @typedef {Object} FFLPrimitiveParam
 * @property {number} primitiveType
 * @property {number} indexCount
 * @property {number} pAdjustMatrix
 * @property {number} pIndexBuffer
 */
/** @type {import('./struct-fu').StructInstance<FFLPrimitiveParam>} */
const FFLPrimitiveParam = _.struct([
	_.uint32le('primitiveType'),
	_.uint32le('indexCount'),
	_uintptr('pAdjustMatrix'), // TODO: Not uintptr in 64-bit.
	_uintptr('pIndexBuffer')
]);

/**
 * @typedef {Object} FFLColor
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */
/** @type {import('./struct-fu').StructInstance<FFLColor>} */
const FFLColor = _.struct([
	_.float32le('r'),
	_.float32le('g'),
	_.float32le('b'),
	_.float32le('a')
]);

/**
 * @typedef {Object} FFLVec3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
/** @type {import('./struct-fu').StructInstance<FFLVec3>} */
const FFLVec3 = _.struct([
	_.float32le('x'),
	_.float32le('y'),
	_.float32le('z')
]);

/**
 * @typedef {Object} FFLModulateParam
 * @property {FFLModulateMode} mode
 * @property {FFLModulateType} type
 * @property {number} pColorR - Pointer to FFLColor
 * @property {number} pColorG - Pointer to FFLColor
 * @property {number} pColorB - Pointer to FFLColor
 * @property {number} pTexture2D
 */
/** @type {import('./struct-fu').StructInstance<FFLModulateParam>} */
const FFLModulateParam = _.struct([
	_.uint32le('mode'), // enum FFLModulateMode
	_.uint32le('type'), // enum FFLModulateType
	_uintptr('pColorR'),
	_uintptr('pColorG'),
	_uintptr('pColorB'),
	_uintptr('pTexture2D')
]);

/**
 * @typedef {Object} FFLDrawParam
 * @property {FFLAttributeBufferParam} attributeBufferParam
 * @property {FFLModulateParam} modulateParam
 * @property {FFLCullMode} cullMode
 * @property {FFLPrimitiveParam} primitiveParam
 */
/** @type {import('./struct-fu').StructInstance<FFLDrawParam>} */
const FFLDrawParam = _.struct([
	_.struct('attributeBufferParam', [FFLAttributeBufferParam]),
	_.struct('modulateParam', [FFLModulateParam]),
	_.uint32le('cullMode'),
	_.struct('primitiveParam', [FFLPrimitiveParam])
]);

// ---------------------- Begin FFLiCharInfo Definition ----------------------
// TODO PATH: src/StructFFLiCharModel.js

/**
 * @typedef {Object} FFLCreateID
 * @property {Array<number>} data
 */
/** @type {import('./struct-fu').StructInstance<FFLCreateID>} */
const FFLCreateID = _.struct([
	_.uint8('data', 10)
]);

/**
 * @typedef {Object} FFLiCharInfo_faceline
 * @property {number} type
 * @property {number} color
 * @property {number} texture
 * @property {number} make
 */
/**
 * @typedef {Object} FFLiCharInfo_hair
 * @property {number} type
 * @property {number} color
 * @property {number} flip
 */
/**
 * @typedef {Object} FFLiCharInfo_eye
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} rotate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_eyebrow
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} rotate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_nose
 * @property {number} type
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_mouth
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_beard
 * @property {number} mustache
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_glass
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_mole
 * @property {number} type
 * @property {number} scale
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_body
 * @property {number} height
 * @property {number} build
 */
/**
 * @typedef {Object} FFLiCharInfo_personal
 * @property {string} name
 * @property {string} creator
 * @property {number} gender
 * @property {number} birthMonth
 * @property {number} birthDay
 * @property {number} favoriteColor
 * @property {number} favorite
 * @property {number} copyable
 * @property {number} ngWord
 * @property {number} localonly
 * @property {number} regionMove
 * @property {number} fontRegion
 * @property {number} roomIndex
 * @property {number} positionInRoom
 * @property {number} birthPlatform
 */
/**
 * @typedef {Object} FFLiCharInfo
 * @property {number} miiVersion
 * @property {FFLiCharInfo_faceline} faceline
 * @property {FFLiCharInfo_hair} hair
 * @property {FFLiCharInfo_eye} eye
 * @property {FFLiCharInfo_eyebrow} eyebrow
 * @property {FFLiCharInfo_nose} nose
 * @property {FFLiCharInfo_mouth} mouth
 * @property {FFLiCharInfo_beard} beard
 * @property {FFLiCharInfo_glass} glass
 * @property {FFLiCharInfo_mole} mole
 * @property {FFLiCharInfo_body} body
 * @property {FFLiCharInfo_personal} personal
 * @property {FFLCreateID} createID
 * @property {number} padding_0
 * @property {number} authorType
 * @property {Array<number>} authorID
 */
/** @type {import('./struct-fu').StructInstance<FFLiCharInfo>} */
const FFLiCharInfo = _.struct([
	_.int32le('miiVersion'),
	_.struct('faceline', [_.int32le('type'), _.int32le('color'),
		_.int32le('texture'), _.int32le('make')]),
	_.struct('hair', [_.int32le('type'), _.int32le('color'), _.int32le('flip')]),
	_.struct('eye', [_.int32le('type'), _.int32le('color'), _.int32le('scale'),
		_.int32le('aspect'), _.int32le('rotate'),
		_.int32le('x'), _.int32le('y')]),
	_.struct('eyebrow', [_.int32le('type'), _.int32le('color'),
		_.int32le('scale'), _.int32le('aspect'),
		_.int32le('rotate'), _.int32le('x'),
		_.int32le('y')]),
	_.struct('nose', [_.int32le('type'), _.int32le('scale'),
		_.int32le('y')]),
	_.struct('mouth', [_.int32le('type'), _.int32le('color'),
		_.int32le('scale'), _.int32le('aspect'),
		_.int32le('y')]),
	_.struct('beard', [_.int32le('mustache'), _.int32le('type'),
		_.int32le('color'), _.int32le('scale'),
		_.int32le('y')]),
	_.struct('glass', [_.int32le('type'), _.int32le('color'),
		_.int32le('scale'), _.int32le('y')]),
	_.struct('mole', [_.int32le('type'), _.int32le('scale'),
		_.int32le('x'), _.int32le('y')]),
	_.struct('body', [_.int32le('height'), _.int32le('build')]),
	_.struct('personal', [
		_.char16le('name', 22),
		_.char16le('creator', 22),
		_.int32le('gender'),
		_.int32le('birthMonth'),
		_.int32le('birthDay'),
		_.int32le('favoriteColor'),
		_.uint8('favorite'),
		_.uint8('copyable'),
		_.uint8('ngWord'),
		_.uint8('localonly'),
		_.int32le('regionMove'),
		_.int32le('fontRegion'),
		_.int32le('roomIndex'),
		_.int32le('positionInRoom'),
		_.int32le('birthPlatform')
	]),
	_.struct('createID', [FFLCreateID]),
	_.uint16le('padding_0'),
	_.int32le('authorType'),
	_.uint8('authorID', 8) // stub
]);

/**
 * Size of FFLStoreData, a structure not included currently.
 * @public
 */
/** sizeof(FFLStoreData) */
const FFLStoreData_size = 96;

// ---------------------- Common Color Mask Definitions ----------------------

/** @package */
const commonColorEnableMask = (1 << 31);

/**
 * Applies (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to indicate to FFL which color table it should use.
 * @param {number} color - The color index to flag.
 * @returns {number} The flagged color index to use in FFLiCharinfo.
 */
const commonColorMask = color => color | commonColorEnableMask;

/**
 * Removes (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to reveal the original common color index.
 * @param {number} color - The flagged color index.
 * @returns {number} The original color index before flagging.
 */
const commonColorUnmask = color => (color & ~commonColorEnableMask) === 0
// Only unmask color if the mask is enabled.
	? color
	: color & ~commonColorEnableMask;

// --------------------- Begin FFLiCharModel Definitions ---------------------

/**
 * @typedef {Object} FFLAdditionalInfo
 * @property {string} name
 * @property {string} creator
 * @property {FFLCreateID} createID
 * @property {FFLColor} skinColor
 * @property {number} flags
 * @property {number} facelineType
 * @property {number} hairType
 */
/** @type {import('./struct-fu').StructInstance<FFLAdditionalInfo>} */
const FFLAdditionalInfo = _.struct([
	_.char16le('name', 22),
	_.char16le('creator', 22),
	_.struct('createID', [FFLCreateID]),
	_.byte('_padding0', 2), // alignment
	_.struct('skinColor', [FFLColor]),
	_.uint32le('flags'),
	// _.ubitLE('hairFlip', 1),
	// _.ubitLE('fontRegion', 2),
	// _.ubitLE('ngWord', 1),
	// _.ubitLE('build', 7),
	// _.ubitLE('height', 7),
	// _.ubitLE('favoriteColor', 4),
	// _.ubitLE('birthDay', 5),
	// _.ubitLE('birthMonth', 4),
	// _.ubitLE('gender', 1),
	_.uint8('facelineType'),
	_.uint8('hairType'),
	_.byte('_padding1', 2) // alignment
]);

const FFLiRenderTexture = _.struct([
	// STUB: four pointers in one field
	_uintptr('pTexture2DRenderBufferColorTargetDepthTarget', 4)
]);

/**
 * @typedef {Object} FFLiFacelineTextureTempObject
 * @property {number} pTextureFaceLine
 * @property {FFLDrawParam} drawParamFaceLine
 * @property {number} pTextureFaceMake
 * @property {FFLDrawParam} drawParamFaceMake
 * @property {number} pTextureFaceBeard
 * @property {FFLDrawParam} drawParamFaceBeard
 * @property {Array<number>} pRenderTextureCompressorParam
 */
/** @type {import('./struct-fu').StructInstance<FFLiFacelineTextureTempObject>} */
const FFLiFacelineTextureTempObject = _.struct([
	_uintptr('pTextureFaceLine'),
	_.struct('drawParamFaceLine', [FFLDrawParam]),
	_uintptr('pTextureFaceMake'),
	_.struct('drawParamFaceMake', [FFLDrawParam]),
	_uintptr('pTextureFaceBeard'),
	_.struct('drawParamFaceBeard', [FFLDrawParam]),
	_uintptr('pRenderTextureCompressorParam', 2) // stub
]);

/**
 * @typedef {Object} FFLiRawMaskDrawParam
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsEye - 2
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsEyebrow - 2
 * @property {FFLDrawParam} drawParamRawMaskPartsMouth
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsMustache - 2
 * @property {FFLDrawParam} drawParamRawMaskPartsMole
 * @property {FFLDrawParam} drawParamRawMaskPartsFill
 */
/** @type {import('./struct-fu').StructInstance<FFLiRawMaskDrawParam>} */
const FFLiRawMaskDrawParam = _.struct([
	_.struct('drawParamRawMaskPartsEye', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsEyebrow', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsMouth', [FFLDrawParam]),
	_.struct('drawParamRawMaskPartsMustache', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsMole', [FFLDrawParam]),
	_.struct('drawParamRawMaskPartsFill', [FFLDrawParam])
]);

/**
 * @typedef {Object} FFLiMaskTexturesTempObject
 * @property {Array<number>} partsTextures
 * @property {Array<number>} pRawMaskDrawParam
 * @property {Uint8Array} _remaining
 */
/** @type {import('./struct-fu').StructInstance<FFLiMaskTexturesTempObject>} */
const FFLiMaskTexturesTempObject = _.struct([
	_.uint8('partsTextures', 0x154),
	_uintptr('pRawMaskDrawParam', FFLExpression.MAX),
	_.byte('_remaining', 0x388 - 620) // stub
]);

/**
 * @typedef {Object} FFLiTextureTempObject
 * @property {FFLiMaskTexturesTempObject} maskTextures
 * @property {FFLiFacelineTextureTempObject} facelineTexture
 */
/** @type {import('./struct-fu').StructInstance<FFLiTextureTempObject>} */
const FFLiTextureTempObject = _.struct([
	_.struct('maskTextures', [FFLiMaskTexturesTempObject]),
	_.struct('facelineTexture', [FFLiFacelineTextureTempObject])
]);

/**
 * @typedef {Object} FFLiMaskTextures
 * @property {Array<number>} pRenderTextures
 */
/** @type {import('./struct-fu').StructInstance<FFLiMaskTextures>} */
const FFLiMaskTextures = _.struct([
	_uintptr('pRenderTextures', FFLExpression.MAX)
]);

/** @package */
const FFL_RESOLUTION_MASK = 0x3fffffff;

/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution - Texture resolution for faceline/mask. It's recommended to only use powers of two.
 * @property {Uint32Array} allExpressionFlag - Expression flag, created by {@link makeExpressionFlag}
 * @property {FFLModelFlag} modelFlag
 * @property {FFLResourceType} resourceType
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelDesc>} */
const FFLCharModelDesc = _.struct([
	_.uint32le('resolution'),
	_.uint32le('allExpressionFlag', 3),
	_.uint32le('modelFlag'),
	_.uint32le('resourceType')
]);
/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @public
 */
const FFLCharModelDescDefault = {
	/** Typical default. */
	resolution: 512,
	/** Normal expression. */
	allExpressionFlag: new Uint32Array([1, 0, 0]),
	modelFlag: FFLModelFlag.NORMAL,
	/** Default resource type. */
	resourceType: FFLResourceType.HIGH
};

/**
 * @typedef {Object<string, FFLVec3>} FFLBoundingBox
 * @property {FFLVec3} min
 * @property {FFLVec3} max
 */
/** @type {import('./struct-fu').StructInstance<FFLBoundingBox>} */
const FFLBoundingBox = _.struct([
	_.struct('min', [FFLVec3]),
	_.struct('max', [FFLVec3])
]);

/**
 * @typedef {Object<string, FFLVec3>} FFLPartsTransform
 * @property {FFLVec3} hatTranslate
 * @property {FFLVec3} headFrontRotate
 * @property {FFLVec3} headFrontTranslate
 * @property {FFLVec3} headSideRotate
 * @property {FFLVec3} headSideTranslate
 * @property {FFLVec3} headTopRotate
 * @property {FFLVec3} headTopTranslate
 */
/** @type {import('./struct-fu').StructInstance<FFLPartsTransform>} */
const FFLPartsTransform = _.struct([
	_.struct('hatTranslate', [FFLVec3]),
	_.struct('headFrontRotate', [FFLVec3]),
	_.struct('headFrontTranslate', [FFLVec3]),
	_.struct('headSideRotate', [FFLVec3]),
	_.struct('headSideTranslate', [FFLVec3]),
	_.struct('headTopRotate', [FFLVec3]),
	_.struct('headTopTranslate', [FFLVec3])
]);
/**
 * PartsTransform with THREE.Vector3 type.
 * @typedef {Object<string, import('three').Vector3>} PartsTransform
 * @property {import('three').Vector3} hatTranslate
 * @property {import('three').Vector3} headFrontRotate
 * @property {import('three').Vector3} headFrontTranslate
 * @property {import('three').Vector3} headSideRotate
 * @property {import('three').Vector3} headSideTranslate
 * @property {import('three').Vector3} headTopRotate
 * @property {import('three').Vector3} headTopTranslate
 */

/**
 * Internal representation within FFL for the created CharModel.
 * @typedef {Object} FFLiCharModel
 * @property {FFLiCharInfo} charInfo
 * @property {FFLCharModelDesc} charModelDesc
 * @property {FFLExpression} expression
 * @property {number} pTextureTempObject
 * @property {Array<FFLDrawParam>} drawParam
 * @property {Array<number>} pShapeData
 * @property {Array<Object>} facelineRenderTexture
 * @property {Array<number>} pCapGlassNoselineTextures
 * @property {FFLiMaskTextures} maskTextures
 * @property {Array<FFLVec3>} beardHairFaceCenterPos
 * @property {FFLPartsTransform} partsTransform
 * @property {number} modelType - FFLModelType
 * @property {Array<FFLBoundingBox>} boundingBox
 */
/** @type {import('./struct-fu').StructInstance<FFLiCharModel>} */
const FFLiCharModel = _.struct([
	_.struct('charInfo', [FFLiCharInfo]),
	_.struct('charModelDesc', [FFLCharModelDesc]),
	_.uint32le('expression'), // enum FFLExpression
	_uintptr('pTextureTempObject'), // stub
	_.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX),
	_uintptr('pShapeData', FFLiShapeType.MAX),
	_.struct('facelineRenderTexture', [FFLiRenderTexture]),
	_uintptr('pCapGlassNoselineTextures', 3),
	_.struct('maskTextures', [FFLiMaskTextures]),
	_.struct('beardHairFaceCenterPos', [FFLVec3], 3),
	_.struct('partsTransform', [FFLPartsTransform]),
	_.uint32le('modelType'), // enum FFLModelType
	// FFLBoundingBox[FFL_MODEL_TYPE_MAX = 3]
	_.struct('boundingBox', [FFLBoundingBox], 3)
]);

/** @enum {number} */
const FFLDataSource = {
	OFFICIAL: 0,
	DEFAULT: 1,
	MIDDLE_DB: 2,
	STORE_DATA_OFFICIAL: 3,
	STORE_DATA: 4,
	BUFFER: 5,
	DIRECT_POINTER: 6
};

/**
 * @typedef {Object} FFLCharModelSource
 * @property {FFLDataSource} dataSource
 * @property {number} pBuffer
 * @property {number} index - Only for default, official, MiddleDB; unneeded for raw data
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelSource>} */
const FFLCharModelSource = _.struct([
	_.uint32le('dataSource'),
	_uintptr('pBuffer'),
	_.uint16le('index')
]);

// The enums below are only for FFLiGetRandomCharInfo.
// Hence, why each one has a value called ALL.

/** @enum {number} */
const FFLGender = {
	MALE: 0,
	FEMALE: 1,
	ALL: 2
};

/** @enum {number} */
const FFLAge = {
	CHILD: 0,
	ADULT: 1,
	ELDER: 2,
	ALL: 3
};

/** @enum {number} */
const FFLRace = {
	BLACK: 0,
	WHITE: 1,
	ASIAN: 2,
	ALL: 3
};

/**
 * @typedef {Object} FFLResourceDesc
 * @property {Array<number>} pData
 * @property {Array<number>} size
 */
/** @type {import('./struct-fu').StructInstance<FFLResourceDesc>} */
const FFLResourceDesc = _.struct([
	_uintptr('pData', FFLResourceType.MAX),
	_.uint32le('size', FFLResourceType.MAX)
]);

// // ---------------------------------------------------------------------
// //  Texture Management
// // ---------------------------------------------------------------------

// ------------------------- Texture Related Structs -------------------------
/** @enum {number} */
const FFLTextureFormat = {
	R8_UNORM: 0,
	R8_G8_UNORM: 1,
	R8_G8_B8_A8_UNORM: 2,
	MAX: 3
};

/**
 * @typedef {Object} FFLTextureInfo
 * @property {number} width
 * @property {number} height
 * @property {number} mipCount
 * @property {FFLTextureFormat} format
 * @property {number} isGX2Tiled
 * @property {number} imageSize
 * @property {number} imagePtr
 * @property {number} mipSize
 * @property {number} mipPtr
 * @property {Array<number>} mipLevelOffset
 */
/** @type {import('./struct-fu').StructInstance<FFLTextureInfo>} */
const FFLTextureInfo = _.struct([
	_.uint16le('width'),
	_.uint16le('height'),
	_.uint8('mipCount'),
	_.uint8('format'),
	_.uint8('isGX2Tiled'),
	_.byte('_padding', 1),
	_.uint32le('imageSize'),
	_uintptr('imagePtr'),
	_.uint32le('mipSize'),
	_uintptr('mipPtr'),
	_.uint32le('mipLevelOffset', 13)
]);

const FFLTextureCallback = _.struct([
	_uintptr('pObj'),
	_.uint8('useOriginalTileMode'),
	_.byte('_padding', 3), // alignment
	_uintptr('pCreateFunc'),
	_uintptr('pDeleteFunc')
]);

// TODO PATH: src/TextureManager.js

// ------------------------ Class: TextureManager -----------------------------
/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 */
class TextureManager {
	/**
	 * Constructs the TextureManager. This MUST be created after initializing FFL.
	 * @param {Module} module - The Emscripten module.
	 * @param {boolean} [setToFFLGlobal] - Whether or not to call FFLSetTextureCallback on the constructed callback.
	 */
	constructor(module, setToFFLGlobal = false) {
		/**
		 * @type {Module}
		 * @private
		 */
		this._module = module;
		/**
		 * @type {Map<number, import('three').Texture>}
		 * @private
		 */
		this._textures = new Map(); // Internal map of texture id -> THREE.Texture.
		/** @package */
		this._textureCallbackPtr = 0;
		/**
		 * Controls whether or not the TextureManager
		 * will log creations and deletions of textures
		 * in order to better track memory allocations.
		 * @public
		 */
		this.logging = false;

		// Create and set texture callback instance.
		this._setTextureCallback();
		if (setToFFLGlobal) {
			// Set texture callback globally within FFL if chosen.
			module._FFLSetTextureCallback(this._textureCallbackPtr);
		}
	}

	/**
	 * Creates and allocates an {@link FFLTextureCallback} instance from callback function pointers.
	 * @param {Module} module - The Emscripten module.
	 * @param {number} createCallback - Function pointer for the create callback.
	 * @param {number} deleteCallback - Function pointer for the delete callback.
	 * @returns {number} Pointer to the {@link FFLTextureCallback}.
	 * Note that you MUST free this after using it (done in {@link TextureManager.disposeCallback}).
	 * @private
	 */
	static _allocateTextureCallback(module, createCallback, deleteCallback) {
		const ptr = module._malloc(FFLTextureCallback.size);
		const textureCallback = {
			pObj: 0,
			useOriginalTileMode: false,
			_padding: [0, 0, 0],
			pCreateFunc: createCallback,
			pDeleteFunc: deleteCallback
		};
		const packed = FFLTextureCallback.pack(textureCallback);
		module.HEAPU8.set(packed, ptr);
		return ptr;
	}

	/**
	 * Creates the create/delete functions in Emscripten and allocates and sets
	 * the {@link FFLTextureCallback} object as {@link TextureManager._textureCallbackPtr}.
	 * @param {boolean} addDeleteCallback - Whether or not to bind the delete function to the texture callback.
	 */
	_setTextureCallback(addDeleteCallback = false) {
		const mod = this._module;
		// Bind the callbacks to this instance.
		/** @private */
		this._createCallback = mod.addFunction(this._textureCreateFunc.bind(this), 'vppp');
		if (addDeleteCallback) {
			/** @private */
			this._deleteCallback = mod.addFunction(this._textureDeleteFunc.bind(this), 'vpp');
		}
		/** @private */
		this._textureCallbackPtr = TextureManager._allocateTextureCallback(mod,
			this._createCallback, this._deleteCallback ? this._deleteCallback : 0);
	}

	/**
	 * @param {number} format - Enum value for FFLTextureFormat.
	 * @returns {import('three').PixelFormat} Three.js texture format constant.
	 * @throws {Error} Unexpected FFLTextureFormat value
	 * Note that this function won't work on WebGL1Renderer in Three.js r137-r162
	 * since R and RG textures need to use Luminance(Alpha)Format
	 * (you'd somehow need to detect which renderer is used)
	 * @private
	 */
	_getTextureFormat(format) {
		// Map FFLTextureFormat to Three.js texture formats.

		// THREE.RGFormat did not work for me on Three.js r136/older.
		const useGLES2Formats = Number(THREE.REVISION) <= 136;
		const r8 = useGLES2Formats
			? THREE.LuminanceFormat
			: THREE.RedFormat;
		const r8g8 = useGLES2Formats
		// NOTE: Using THREE.LuminanceAlphaFormat before
		// it was removed, on WebGL 2.0, causes the texture
		// to be converted to RGBA resulting in two issues.
		//     - There is a black outline around glasses
		//     - For glasses that have an inner color, the color is wrongly applied to the frames as well.
			? THREE.LuminanceAlphaFormat
			: THREE.RGFormat;

		const textureFormatToThreeFormat = {
			[FFLTextureFormat.R8_UNORM]: r8,
			[FFLTextureFormat.R8_G8_UNORM]: r8g8,
			[FFLTextureFormat.R8_G8_B8_A8_UNORM]: THREE.RGBAFormat
		};

		// Determine the data format from the table.
		const dataFormat = textureFormatToThreeFormat[format];
		if (dataFormat === undefined) {
			throw new Error(`_textureCreateFunc: Unexpected FFLTextureFormat value: ${format}`);
		}
		return dataFormat;
	}

	/**
	 * @param {number} _ - Originally pObj, unused here.
	 * @param {number} textureInfoPtr - Pointer to {@link FFLTextureInfo}.
	 * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
	 * @private
	 */
	_textureCreateFunc(_, textureInfoPtr, texturePtrPtr) {
		const u8 = this._module.HEAPU8.subarray(textureInfoPtr,
			textureInfoPtr + FFLTextureInfo.size);
		const textureInfo = FFLTextureInfo.unpack(u8);
		if (this.logging) {
			console.debug(`_textureCreateFunc: width=${textureInfo.width}, height=${textureInfo.height}, format=${textureInfo.format}, imageSize=${textureInfo.imageSize}, mipCount=${textureInfo.mipCount}`);
		}

		/** Resolve THREE.PixelFormat. */
		const format = this._getTextureFormat(textureInfo.format);
		// Copy image data from HEAPU8 via slice. This is base level/mip level 0.
		const imageData = this._module.HEAPU8.slice(textureInfo.imagePtr,
			textureInfo.imagePtr + textureInfo.imageSize);

		// Mipmaps were not implemented before Three.js r136
		// and they only began functioning properly on r138
		const canUseMipmaps = Number(THREE.REVISION) >= 138;
		// Actually use mipmaps if the mip count is over 1.
		const useMipmaps = textureInfo.mipCount > 1 && canUseMipmaps;

		// Create new THREE.Texture with the specified format.
		const texture = new THREE.DataTexture(useMipmaps ? null : imageData,
			textureInfo.width, textureInfo.height, format, THREE.UnsignedByteType);

		texture.magFilter = THREE.LinearFilter;
		// texture.generateMipmaps = true; // not necessary at higher resolutions
		texture.minFilter = THREE.LinearFilter;

		if (useMipmaps) {
			// Add base texture.
			texture.mipmaps = [{
				data: imageData,
				width: textureInfo.width,
				height: textureInfo.height
			}];
			// Enable filtering option for mipmap and add levels.
			texture.minFilter = THREE.LinearMipmapLinearFilter;
			texture.generateMipmaps = false;
			this._addMipmaps(texture, textureInfo);
		}

		texture.needsUpdate = true;
		this.set(texture.id, texture);
		this._module.HEAPU32[texturePtrPtr / 4] = texture.id;
	}

	/**
	 * @param {import('three').Texture} texture - Texture to upload mipmaps into.
	 * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
	 * @throws {Error} Throws if mipPtr is null.
	 * @private
	 */
	_addMipmaps(texture, textureInfo) {
		// Make sure mipPtr is not null.
		if (textureInfo.mipPtr === 0) {
			throw new Error('_addMipmaps: mipPtr is null, so the caller incorrectly assumed this texture has mipmaps');
		}

		// Iterate through mip levels starting from 1 (base level is mip level 0).
		for (let mipLevel = 1; mipLevel < textureInfo.mipCount; mipLevel++) {
			// Calculate the offset for the current mip level.
			const mipOffset = textureInfo.mipLevelOffset[mipLevel - 1];

			// Calculate dimensions of the current mip level.
			const mipWidth = Math.max(1, textureInfo.width >> mipLevel);
			const mipHeight = Math.max(1, textureInfo.height >> mipLevel);

			// Get the offset of the next mipmap and calculate end offset.
			const nextMipOffset = textureInfo.mipLevelOffset[mipLevel] || textureInfo.mipSize;
			const end = textureInfo.mipPtr + nextMipOffset;

			// Copy the data from the heap.
			const start = textureInfo.mipPtr + mipOffset;
			const mipData = this._module.HEAPU8.slice(start, end);

			if (this.logging) {
				console.debug(`  - Mip ${mipLevel}: ${mipWidth}x${mipHeight}, offset=${mipOffset}, range=${start}-${end}`);
			}
			// console.debug(uint8ArrayToBase64(mipData)); // will leak the data

			// Push this mip level data into the texture's mipmaps array.
			// @ts-ignore - data = "CompressedTextureMipmap & CubeTexture & HTMLCanvasElement"
			texture.mipmaps.push({
				data: mipData, // Should still accept Uint8Array.
				width: mipWidth,
				height: mipHeight
			});
		}
	}

	/**
	 * @param {number} _ - Originally pObj, unused here.
	 * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
	 * @private
	 */
	_textureDeleteFunc(_, texturePtrPtr) {
		const texId = this._module.HEAPU32[texturePtrPtr / 4];
		// this.delete(texId);
		// NOTE: This is effectively no longer used as when
		// we delete a CharModel instance it deletes
		// cap/noseline/glass textures before we are
		// finished with the model itself. It is now only logging
		const tex = this._textures.get(texId);
		if (tex && this.logging) {
			console.debug('Delete texture    ', tex.id);
		}
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @returns {import('three').Texture|null|undefined} Returns the texture if it is found.
	 * @public
	 */
	get(id) {
		const texture = this._textures.get(id);
		if (!texture && this.logging) {
			console.error('Unknown texture', id);
		}
		return texture;
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @param {import('three').Texture} texture - Texture to add.
	 * @public
	 */
	set(id, texture) {
		// Set texture with an override for dispose.
		const disposeReal = texture.dispose.bind(texture);
		texture.dispose = () => {
			// Remove this texture from the map after disposing.
			disposeReal();
			this.delete(id); // this = TextureManager
		};

		this._textures.set(id, texture);
		// Log is spaced to match delete/deleting/dispose messages.
		if (this.logging) {
			console.debug('Adding texture    ', texture.id);
		}
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @public
	 */
	delete(id) {
		// Get texture from array instead of with get()
		// because it's okay if it was already deleted.
		const texture = this._textures.get(id);
		if (texture) {
			// This is assuming the texture has already been disposed.
			/** @type {Object<string, *>} */ (texture).source = null;
			/** @type {Object<string, *>} */ (texture).mipmaps = null;
			if (this.logging) {
				console.debug('Deleted texture   ', id);
			}
			this._textures.delete(id);
		}
	}

	/**
	 * Disposes/frees the {@link FFLTextureCallback} along with
	 * removing the created Emscripten functions.
	 * @public
	 */
	disposeCallback() {
		// if (!this._module) {
		// 	return;
		// }
		if (this._textureCallbackPtr) {
			this._module._free(this._textureCallbackPtr);
			this._textureCallbackPtr = 0;
		}
		if (this._deleteCallback) {
			this._module.removeFunction(this._deleteCallback);
			this._deleteCallback = 0;
		}
		// should always exist?:
		if (this._createCallback) {
			this._module.removeFunction(this._createCallback);
			this._createCallback = 0;
		}
		// this._module = null;
	}

	/**
	 * Disposes of all textures and frees the {@link FFLTextureCallback}.
	 * @public
	 */
	dispose() {
		// Dispose of all stored textures.
		this._textures.forEach((tex) => {
			tex.dispose();
		});

		// Clear texture map.
		this._textures.clear();
		// Free texture callback.
		this.disposeCallback();
	}
}

// // ---------------------------------------------------------------------
// //  Classes for FFL Exceptions
// // ---------------------------------------------------------------------
// TODO PATH: src/Exceptions.js

/**
 * Base exception type for all exceptions based on FFLResult.
 * https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs
 * https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 */
class FFLResultException extends Error {
	/**
	 * @param {number|FFLResult} result - The returned {@link FFLResult}.
	 * @param {string} [funcName] - The name of the function that was called.
	 * @param {string} [message] - An optional message for the exception.
	 */
	constructor(result, funcName, message) {
		if (!message) {
			if (funcName) {
				message = `${funcName} failed with FFLResult: ${result}`;
			} else {
				message = `From FFLResult: ${result}`;
			}
		}
		super(message);
		/** The stored {@link FFLResult} code. */
		this.result = result;
	}

	/**
	 * Throws an exception if the {@link FFLResult} is not OK.
	 * @param {number} result - The {@link FFLResult} from an FFL function.
	 * @param {string} [funcName] - The name of the function that was called.
	 * @throws {FFLResultException|FFLResultWrongParam|FFLResultBroken|FFLResultNotAvailable|FFLResultFatal}
	 */
	static handleResult(result, funcName) {
		switch (result) {
			case FFLResult.ERROR: // FFL_RESULT_WRONG_PARAM
				throw new FFLResultWrongParam(funcName);
			case FFLResult.FILE_INVALID: // FFL_RESULT_BROKEN
				throw new FFLResultBroken(funcName);
			case FFLResult.MANAGER_NOT_CONSTRUCT: // FFL_RESULT_NOT_AVAILABLE
				throw new FFLResultNotAvailable(funcName);
			case FFLResult.FILE_LOAD_ERROR: // FFL_RESULT_FATAL
				throw new FFLResultFatal(funcName);
			case FFLResult.OK: // FFL_RESULT_OK
				return; // All is OK.
			default:
				throw new FFLResultException(result, funcName);
		}
	}
}

/**
 * Exception reflecting FFL_RESULT_WRONG_PARAM / FFL_RESULT_ERROR.
 * This is the most common error thrown in FFL. It usually
 * means that input parameters are invalid.
 * So many cases this is thrown: parts index is out of bounds,
 * CharModelCreateParam is malformed, FFLDataSource is invalid, FFLInitResEx
 * parameters are null or invalid... Many different causes, very much an annoying error.
 */
class FFLResultWrongParam extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName) {
		super(1, funcName, `${funcName} returned FFL_RESULT_WRONG_PARAM. This usually means parameters going into that function were invalid.`);
	}
}

/** Exception reflecting FFL_RESULT_BROKEN / FFL_RESULT_FILE_INVALID. */
class FFLResultBroken extends FFLResultException {
	/**
	 * @param {string} [funcName] - Name of the function where the result originated.
	 * @param {string} [message] - An optional message for the exception.
	 */
	constructor(funcName, message) {
		super(3, funcName, message ? message : `${funcName} returned FFL_RESULT_BROKEN. This usually indicates invalid underlying data.`);
	}
}

/** Exception when resource header verification fails. */
class BrokenInitRes extends FFLResultBroken {
	constructor() {
		super('FFLInitRes', 'The header for the FFL resource is probably invalid. Check the version and magic, should be "FFRA" or "ARFF".');
	}
}

/**
 * Thrown when: CRC16 fails, CharInfo verification fails, or failing to fetch from a database (impossible here)
 */
class BrokenInitModel extends FFLResultBroken {
	constructor() {
		super('FFLInitCharModelCPUStep', 'FFLInitCharModelCPUStep failed probably because your data failed CRC or CharInfo verification (FFLiVerifyCharInfoWithReason).');
	}
}

/**
 * Exception reflecting FFL_RESULT_NOT_AVAILABLE / FFL_RESULT_MANAGER_NOT_CONSTRUCT.
 * This is seen when FFLiManager is not constructed, which it is not when FFLInitResEx fails
 * or was never called to begin with.
 */
class FFLResultNotAvailable extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName) {
		super(4, funcName, `Tried to call FFL function ${funcName} when FFLManager is not constructed (FFL is not initialized properly).`);
	}
}

/**
 * Exception reflecting FFL_RESULT_FATAL / FFL_RESULT_FILE_LOAD_ERROR.
 * This error indicates database file load errors or failures from FFLiResourceLoader (decompression? misalignment?)
 */
class FFLResultFatal extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName) {
		super(5, funcName, `Failed to uncompress or load a specific asset from the FFL resource file during call to ${funcName}`);
	}
}

/**
 * Exception thrown by the result of FFLiVerifyCharInfoWithReason.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
 */
class FFLiVerifyReasonException extends Error {
	/** @param {number} result - The FFLiVerifyReason code from FFLiVerifyCharInfoWithReason. */
	constructor(result) {
		super(`FFLiVerifyCharInfoWithReason (CharInfo verification) failed with result: ${result}`);
		/** The stored FFLiVerifyReason code. */
		this.result = result;
	}
}

/**
 * Exception thrown when the mask is set to an expression that
 * the {@link CharModel} was never initialized to, which can't happen
 * because that mask texture does not exist on the {@link CharModel}.
 * @augments {Error}
 */
class ExpressionNotSet extends Error {
	/** @param {FFLExpression} expression - The attempted expression. */
	constructor(expression) {
		super(`Attempted to set expression ${expression}, but the mask for that expression does not exist. You must reinitialize the CharModel with this expression in the expression flags before using it.`);
		this.expression = expression;
	}
}

// // ---------------------------------------------------------------------
// //  FFL Initialization
// // ---------------------------------------------------------------------
// TODO PATH: src/Init.js

/**
 * Loads data from TypedArray or fetch response directly into Emscripten heap.
 * If passed a fetch response, it streams it directly into memory and avoids copying.
 * @param {ArrayBuffer|Uint8Array|Response} resource - The resource data.
 * Use a Fetch response to stream directly, or a Uint8Array if you only have the raw bytes.
 * @param {Module} module - The Emscripten module instance.
 * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
 * @throws {Error} resource must be a Uint8Array or fetch that is streamable and has Content-Length.
 * @private
 */
async function _loadDataIntoHeap(resource, module) {
	// These need to be accessible by the catch statement:
	let heapSize;
	let heapPtr;
	try {
		// Copy resource into heap.
		if (resource instanceof ArrayBuffer) {
			resource = new Uint8Array(resource);
		}
		if (resource instanceof Uint8Array) {
			// Comes in as Uint8Array, allocate and set it.
			heapSize = resource.length;
			heapPtr = module._malloc(heapSize);
			console.debug(`_loadDataIntoHeap: Loading from buffer. Size: ${heapSize}, pointer: ${heapPtr}`);
			// Allocate and set this area in the heap as the passed buffer.
			module.HEAPU8.set(resource, heapPtr);
		} else if (resource instanceof Response) {
			// Handle as fetch response.
			if (!resource.ok) {
				throw new Error(`HTTP error while fetching resource at URL = ${resource.url}, response code = ${resource.status}`);
			}
			// Throw an error if it is not a streamable response.
			if (!resource.body) {
				throw new Error(`Response body is null (resource.body = ${resource.body})`);
			}
			// Get the total size of the resource from the headers.
			const contentLength = resource.headers.get('Content-Length');
			if (!contentLength) {
				// Cannot stream the response. Read as ArrayBuffer and reinvoke function.
				console.debug('_loadDataIntoHeap: Fetch response is missing Content-Length, falling back to reading as ArrayBuffer.');
				return _loadDataIntoHeap(await resource.arrayBuffer(), module);
			}

			// Allocate into heap using the Content-Length.
			heapSize = parseInt(contentLength, 10);
			heapPtr = module._malloc(heapSize);

			console.debug(`loadDataIntoHeap: Streaming from fetch response. Size: ${heapSize}, pointer: ${heapPtr}, URL: ${resource.url}`);

			// Begin reading and streaming chunks into the heap.
			const reader = resource.body.getReader();
			let offset = heapPtr;
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				// Copy value directly into HEAPU8 with offset.
				module.HEAPU8.set(value, offset);
				offset += value.length;
			}
		} else {
			throw new Error('loadDataIntoHeap: type is not Uint8Array or Response');
		}

		return { pointer: heapPtr, size: heapSize };
	} catch (error) {
		// Free memory upon exception, if allocated.
		if (heapPtr) {
			module._free(heapPtr);
		}
		throw error;
	}
}

// ----------------- initializeFFL(resource, moduleOrPromise) -----------------
/**
 * Initializes FFL by copying the resource into heap and calling FFLInitRes.
 * It will first wait for the Emscripten module to be ready.
 * @param {Uint8Array|Response} resource - The FFL resource data. Use a Uint8Array
 * if you have the raw bytes, or a fetch response containing the FFL resource file.
 * @param {Module|Promise<Module>|function(): Promise<Module>} moduleOrPromise - The Emscripten module
 * by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1),
 * or as a function returning a promise (window.Module when MODULARIZE=1).
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when FFL is fully initialized,
 * returning the final Emscripten {@link Module} instance and the {@link FFLResourceDesc} object
 * that can later be passed into {@link exitFFL}.
 */
async function initializeFFL(resource, moduleOrPromise) {
	console.debug('initializeFFL: Entrypoint, waiting for module to be ready.');

	/**
	 * Pointer to the FFLResourceDesc structure to free when FFLInitRes call is done.
	 * @type {number}
	 */
	let resourceDescPtr;
	/** Frees the FFLResourceDesc - not the resources it POINTS to unlike _freeResourceDesc. */
	function freeResDesc() {
		if (resourceDescPtr) {
			// Free FFLResourceDesc, unused after init.
			module._free(resourceDescPtr);
		}
	}
	/** Resource type to load single resource into. */
	const resourceType = FFLResourceType.HIGH;

	/**
	 * The Emscripten Module instance to set and return at the end.
	 * @type {Module}
	 */
	let module;
	// Resolve moduleOrPromise to the Module instance.
	if (typeof moduleOrPromise === 'function') {
		// Assume this function gets the promise of the module.
		moduleOrPromise = moduleOrPromise();
	}
	if (moduleOrPromise instanceof Promise) {
		// Await if this is now a promise.
		module = await moduleOrPromise;
	} else {
		// Otherwise, assume it is already the module.
		module = moduleOrPromise;
	}

	// Wait for the Emscripten runtime to be ready if it isn't already.
	if (!module.calledRun && !module.onRuntimeInitialized) {
		// calledRun is not defined. Set onRuntimeInitialized and wait for it in a new promise.
		await new Promise((resolve) => {
			/** If onRuntimeInitialized is not defined on module, add it. */
			module.onRuntimeInitialized = () => {
				console.debug('initializeFFL: Emscripten runtime initialized, resolving.');
				resolve(null);
			};
			console.debug(`initializeFFL: module.calledRun: ${module.calledRun}, module.onRuntimeInitialized:\n${module.onRuntimeInitialized}\n // ^^ assigned and waiting.`);
			// If you are stuck here, the object passed in may not actually be an Emscripten module?
		});
	} else {
		console.debug('initializeFFL: Assuming module is ready.');
	}

	// Module should be ready after this point, begin loading the resource.
	/** @type {FFLResourceDesc|null} */
	let resourceDesc = null;
	try {
		// If resource is itself a promise (fetch() result), wait for it to finish.
		if (resource instanceof Promise) {
			resource = await resource;
		}

		// Load the resource (Uint8Array/fetch Response) into heap.
		const { pointer: heapPtr, size: heapSize } = await _loadDataIntoHeap(resource, module);
		console.debug(`initializeFFL: Resource loaded into heap. Pointer: ${heapPtr}, Size: ${heapSize}`);

		// Initialize and pack FFLResourceDesc.
		resourceDesc = { pData: [0, 0], size: [0, 0] };
		resourceDesc.pData[resourceType] = heapPtr;
		resourceDesc.size[resourceType] = heapSize;

		const resourceDescData = FFLResourceDesc.pack(resourceDesc);
		resourceDescPtr = module._malloc(FFLResourceDesc.size); // Freed by freeResDesc.
		module.HEAPU8.set(resourceDescData, resourceDescPtr);

		// Call FFL initialization using: FFL_FONT_REGION_JP_US_EU = 0
		const result = module._FFLInitRes(0, resourceDescPtr);

		// Handle failed result.
		if (result === FFLResult.FILE_INVALID) { // FFL_RESULT_BROKEN
			throw new BrokenInitRes();
		}
		FFLResultException.handleResult(result, 'FFLInitRes');

		// Set required globals in FFL.
		module._FFLInitResGPUStep(); // CanInitCharModel will fail if not called.
		module._FFLSetNormalIsSnorm8_8_8_8(true); // Set normal format to FFLiSnorm8_8_8_8.
		module._FFLSetTextureFlipY(true); // Set textures to be flipped for OpenGL.

		// Requires refactoring:
		// module._FFLSetScale(0.1); // Sets model scale back to 1.0.
		// module._FFLSetLinearGammaMode(1); // Use linear gamma.
		// I don't think ^^ will work because the shaders need sRGB
	} catch (error) {
		// Cleanup on error.
		_freeResourceDesc(resourceDesc, module);
		freeResDesc();
		console.error('initializeFFL failed:', error);
		throw error;
	} finally {
		// Always free the FFLResourceDesc struct itself.
		freeResDesc();
	}

	// Return final Emscripten module and FFLResourceDesc object.
	return {
		module: module,
		resourceDesc: resourceDesc
	};
}

// ------------- initializeFFLWithResource(module, resourcePath) -------------
/**
 * Fetches the FFL resource from the specified path or the "content"
 * attribute of this HTML element: meta[itemprop=ffl-js-resource-fetch-path]
 * It then calls {@link initializeFFL} on the specified module.
 * @param {Module|Promise<Module>|function(): Promise<Module>} module - The Emscripten module by itself
 * (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1),
 * or as a function returning a promise (window.Module when MODULARIZE=1).
 * @param {string|null} resourcePath - The URL for the FFL resource.
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when fetch is finished
 * and initializeFFL returns, returning the final Emscripten {@link Module} instance
 * and the {@link FFLResourceDesc} object that can later be passed into {@link exitFFL}.
 * @throws {Error} resourcePath must be a URL string, or, an HTML element with FFL resource must exist and have content.
 */
async function initializeFFLWithResource(module, resourcePath) {
	// Query selector string for element with "content" attribute for path to the resource.
	const querySelectorResourcePath = 'meta[itemprop=ffl-js-resource-fetch-path]';

	if (!resourcePath && typeof document !== 'undefined') {
		// Load FFL resource file from meta tag in HTML.
		const resourceFetchElement = document.querySelector(querySelectorResourcePath);
		if (!resourceFetchElement || !resourceFetchElement.getAttribute('content')) {
			throw new Error(`initializeFFLWithResource: Element not found or does not have "content" attribute with path to FFL resource: ${querySelectorResourcePath}`);
		}
		// URL to resource for FFL.
		resourcePath = resourceFetchElement.getAttribute('content');
	}
	// is it still null?
	if (!resourcePath) {
		throw new Error('initializeFFLWithResource: resourcePath must be a string');
	}
	try {
		/** Fetch resource. */
		const response = await fetch(resourcePath);
		// Initialize FFL using the resource from fetch response.
		const ret = await initializeFFL(response, module);
		console.debug('initializeFFLWithResource: FFLiManager and TextureManager initialized, exiting');
		return ret;
	} catch (error) {
		if (typeof alert !== 'undefined') {
			alert(`Error initializing FFL with resource: ${error}`);
		}
		throw error;
	}
}

/**
 * Frees all pData pointers within {@link FFLResourceDesc}.
 * @param {FFLResourceDesc|null} desc - {@link FFLResourceDesc} to free pointers from.
 * @param {Module} module - Emscripten module to call _free on.
 * @package
 */
function _freeResourceDesc(desc, module) {
	if (!desc || !desc.pData) {
		return;
	}
	desc.pData.forEach((ptr, i) => {
		if (ptr) {
			module._free(ptr);
			desc.pData[i] = 0;
		}
	});
}

// ---------------------- exitFFL(module, resourceDesc) ----------------------
/**
 * @param {Module} module - Emscripten module.
 * @param {FFLResourceDesc} resourceDesc - The FFLResourceDesc received from {@link initializeFFL}.
 * @public
 * @todo TODO: Needs to somehow destroy Emscripten instance.
 */
function exitFFL(module, resourceDesc) {
	console.debug('exitFFL called, resourceDesc:', resourceDesc);

	// All CharModels must be deleted before this point.
	module._FFLExit();

	// Free resources in heap after FFLExit().
	_freeResourceDesc(resourceDesc, module);

	// Exit the module...? Is this even necessary?
	if (module._exit) {
		module._exit();
	} else {
		console.debug('exitFFL: not calling module._exit = ', module._exit);
	}
}

// // ---------------------------------------------------------------------
// //  CharModel Handling
// // ---------------------------------------------------------------------
// TODO PATH: src/CharModel.js

/** @typedef {function(new: import('three').Material, ...*): import('three').Material} MaterialConstructor */

// --------------------------- Class: CharModel -------------------------------
/**
 * Represents an FFLCharModel, which is the head model.
 * Encapsulates a pointer to the underlying instance and provides helper methods.
 *
 * NOTE: This is a wrapper around CharModel. In order to create one,
 * either call createCharModel or pass the pointer of a manually created
 * CharModel in here. So *DO NOT* call this constructor directly!
 * @public
 */
class CharModel {
	/**
	 * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
	 * @param {Module} module - The Emscripten module.
	 * @param {MaterialConstructor} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
	 * @param {TextureManager|null} texManager - The {@link TextureManager} instance for this CharModel.
	 */
	constructor(ptr, module, materialClass, texManager) {
		/** @package */
		this._module = module;
		/**
		 * The data used to construct the CharModel, set in {@link createCharModel} and used in {@link updateCharModel}.
		 * @type {*}
		 * @package
		 */
		this._data = null;
		/**
		 * @type {MaterialConstructor}
		 * @public
		 */
		this._materialClass = materialClass; // Store the material class.
		/**
		 * Material class used to initialize textures specifically.
		 * @type {MaterialConstructor}
		 * @public
		 */
		this._materialTextureClass = materialClass;

		/** @package */
		this._textureManager = texManager;
		/**
		 * Pointer to the FFLiCharModel in memory, set to null when deleted.
		 * @package
		 */
		this._ptr = ptr;
		/** @private */
		this.__ptr = ptr; // Permanent reference.
		// Unpack the FFLiCharModel structure from heap.
		const charModelData = this._module.HEAPU8.subarray(ptr, ptr + FFLiCharModel.size);
		/**
		 * The unpacked representation of the underlying
		 * FFLCharModel instance. Note that this is not
		 * meant to be updated at all and changes to
		 * this instance will not apply in FFL whatsoever.
		 * @readonly
		 */
		this._model = FFLiCharModel.unpack(charModelData);
		// NOTE: The only property SET in _model is expression.
		// Everything else is read.

		// this.additionalInfo = this._getAdditionalInfo();

		// Add RenderTargets for faceline and mask.
		/**
		 * @type {import('three').RenderTarget|null}
		 * @package
		 */
		this._facelineTarget = null;
		/**
		 * @type {Array<import('three').RenderTarget|null>}
		 * @package
		 */
		this._maskTargets = new Array(FFLExpression.MAX).fill(null);

		/**
		 * Group of THREE.Mesh objects representing the CharModel.
		 * @type {import('three').Group|null}
		 * @public
		 */
		this.meshes = new THREE.Group();
		// Set boundingBox getter ("this" = CharModel), dummy geometry needed
		// this.meshes.geometry = { }; // NOTE: is this a good idea?
		// Object.defineProperty(this.meshes.geometry, 'boundingBox',
		// { get: () => this.boundingBox }); // TODO: box is too large using this

		this._addCharModelMeshes(module); // Populate this.meshes.
	}

	// ----------------------- _addCharModelMeshes(module) -----------------------
	/**
	 * This is the method that populates meshes
	 * from the internal FFLiCharModel instance.
	 * @param {Module} module - Module to pass to drawParamToMesh to access mesh data.
	 * @throws {Error} Throws if this.meshes is null or undefined.
	 * @private
	 */
	_addCharModelMeshes(module) {
		if (!this.meshes) {
			throw new Error('_addCharModelMeshes: this.meshes is null or undefined, was this CharModel disposed?');
		}
		// Add all meshes in the CharModel to the class instance.
		for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
			// Iterate through all DrawParams and convert to THREE.Mesh.
			const drawParam = this._model.drawParam[shapeType];

			// This will be null if there is no shape data,
			// but it will be added anyway so that the indexes
			// of this group all match up with FFLiShapeType.
			const mesh = drawParamToMesh(drawParam, this._materialClass,
				module, this._textureManager);
			if (!mesh) {
				continue;
			}
			// Use FFLModulateType to indicate render order.
			mesh.renderOrder = drawParam.modulateParam.type;
			// Set faceline and mask meshes to use later.
			switch (shapeType) {
				case FFLiShapeType.OPA_FACELINE:
				/** @package */
					this._facelineMesh = mesh;
					break;
				case FFLiShapeType.XLU_MASK:
				/** @package */
					this._maskMesh = mesh;
					break;
			}

			this.meshes.add(mesh); // Add the mesh or null.
		}
	}

	// --------------------------- Private Get Methods ---------------------------

	/**
	 * @returns {number} Pointer to pTextureTempObject.
	 * @private
	 */
	_getTextureTempObjectPtr() {
		return this._model.pTextureTempObject;
	}

	/**
	 * @returns {FFLiTextureTempObject} The TextureTempObject containing faceline and mask DrawParams.
	 * @package
	 */
	_getTextureTempObject() {
		const ptr = this._getTextureTempObjectPtr();
		return FFLiTextureTempObject.unpack(
			this._module.HEAPU8.subarray(ptr, ptr + FFLiTextureTempObject.size));
	}

	/**
	 * Get the unpacked result of FFLGetAdditionalInfo.
	 * @returns {FFLAdditionalInfo} The FFLAdditionalInfo object.
	 * @private
	 */
	/*
	_getAdditionalInfo() {
		const mod = this._module;
		const addInfoPtr = mod._malloc(FFLAdditionalInfo.size);
		const result = mod._FFLGetAdditionalInfo(addInfoPtr, FFLDataSource.BUFFER, this._ptr, 0, false);
		FFLResultException.handleResult(result, 'FFLGetAdditionalInfo');
		const info = FFLAdditionalInfo.unpack(mod.HEAPU8.subarray(addInfoPtr, addInfoPtr + FFLAdditionalInfo.size));
		mod._free(addInfoPtr);
		return info;
	}
	*/

	/**
	 * Accesses partsTransform in FFLiCharModel,
	 * converting every FFLVec3 to THREE.Vector3.
	 * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
	 * @throws {Error} Throws if this._model.partsTransform has objects that do not have "x" property.
	 * @private
	 */
	_getPartsTransform() {
		const obj = /** @type {Object<string, FFLVec3>} */ (this._model.partsTransform);
		/** @type {PartsTransform} */
		const newPartsTransform = {};
		for (const key in obj) {
			const vec = obj[key];
			// sanity check make sure there is "x"
			if (vec.x === undefined) {
				throw new Error();
			}
			// convert to THREE.Vector3
			newPartsTransform[key] = new THREE.Vector3(vec.x, vec.y, vec.z);
		}
		return newPartsTransform;
	}

	/**
	 * @returns {import('three').Color} The faceline color as THREE.Color.
	 * @private
	 */
	_getFacelineColor() {
		// const color = this.additionalInfo.skinColor;
		// return new THREE.Color(color.r, color.g, color.b);
		const mod = this._module;
		const facelineColor = this._model.charInfo.faceline.color;
		/** Allocate return pointer. */
		const colorPtr = mod._malloc(FFLColor.size);
		mod._FFLGetFacelineColor(colorPtr, facelineColor);
		const color = _getFFLColor3(_getFFLColor(colorPtr, mod.HEAPF32));
		mod._free(colorPtr);
		return color;
		// Assume this is in working color space because it is used for clear color.
	}

	/**
	 * @returns {import('three').Color} The favorite color as THREE.Color.
	 * @private
	 */
	_getFavoriteColor() {
		const mod = this._module;
		const favoriteColor = this._model.charInfo.personal.favoriteColor;
		/** Allocate return pointer. */
		const colorPtr = mod._malloc(FFLColor.size);
		mod._FFLGetFavoriteColor(colorPtr, favoriteColor); // Get favoriteColor from CharInfo.
		const color = _getFFLColor3(_getFFLColor(colorPtr, mod.HEAPF32));
		mod._free(colorPtr);
		return color;
	}

	/**
	 * @returns {Uint8Array} The CharInfo instance.
	 * @private
	 */
	_getCharInfoUint8Array() {
		return FFLiCharInfo.pack(this._model.charInfo);
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->maskTextures->partsTextures.
	 * @package
	 */
	_getPartsTexturesPtr() {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._model.pTextureTempObject + /** @type {number} */ (FFLiTextureTempObject.fields.maskTextures.offset) + /** @type {number} */(FFLiMaskTexturesTempObject.fields.partsTextures.offset);
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->facelineTexture.
	 * @package
	 */
	_getFacelineTempObjectPtr() {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._model.pTextureTempObject + /** @type {number} */ (FFLiTextureTempObject.fields.facelineTexture.offset);
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->maskTextures.
	 * @package
	 */
	_getMaskTempObjectPtr() {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._model.pTextureTempObject + /** @type {number} */ (FFLiTextureTempObject.fields.maskTextures.offset);
	}

	/**
	 * @returns {number} Pointer to charModelDesc.allExpressionFlag.
	 * @package
	 */
	_getExpressionFlagPtr() {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._ptr + /** @type {number} */ (FFLiCharModel.fields.charModelDesc.offset) + /** @type {number} */ (FFLCharModelDesc.fields.allExpressionFlag.offset);
	}

	/**
	 * Either gets the boundingBox in the CharModel or calculates it from the meshes.
	 * @returns {import('three').Box3} The bounding box.
	 * @throws {Error} Throws if this.meshes is null.
	 * @private
	 */
	_getBoundingBox() {
		const bbox = this._model.boundingBox[this._model.modelType];
		// The bounding box in the CharModel can only be used if the values are not NaN.
		// Seems that the NaN values do not transfer over when deserializing, they are just zeroes.
		if (!(bbox.max.x === 0 && bbox.max.y === 0 && bbox.max.z === 0)) {
			// Return from CharModel bounding box.
			const min = new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z);
			const max = new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z);
			return new THREE.Box3(min, max);
		}
		// Bounding box is invalid, create one manually.

		// Note: FFL includes three different bounding boxes for each
		// FFLModelType. This only creates one box per CharModel.
		const excludeFromBox = [FFLModulateType.SHAPE_MASK, FFLModulateType.SHAPE_GLASS];
		// Create bounding box selectively excluding mask and glass.
		const box = new THREE.Box3();
		if (!this.meshes) {
			throw new Error('_getBoundingBox: this.meshes is null.');
		}
		this.meshes.traverse((child) => {
			if (!(child instanceof THREE.Mesh) ||
				// Exclude meshes whose modulateType are in excludeFromBox.
				excludeFromBox.indexOf(child.geometry.userData.modulateType) !== -1) {
				return;
			}
			// Expand the box.
			box.expandByObject(child);
		});
		return box;
	}

	/**
	 * Get the texture resolution.
	 * @returns {number} The texture resolution.
	 * @package
	 */
	_getResolution() {
		return this._model.charModelDesc.resolution & FFL_RESOLUTION_MASK;
	}

	// --------------------------------- Disposal ---------------------------------

	/**
	 * Finalizes the CharModel.
	 * Frees and deletes the CharModel right after generating textures.
	 * This is **not** the same as `dispose()` which cleans up the scene.
	 * @package
	 */
	_finalizeCharModel() {
		if (!this._ptr) {
			return;
		}
		this._module._FFLDeleteCharModel(this._ptr);
		this._module._free(this._ptr);
		this._ptr = 0;
	}

	/**
	 * Disposes RenderTargets for textures created by the CharModel.
	 * @public
	 */
	disposeTargets() {
		// Dispose RenderTargets.
		if (this._facelineTarget) {
			console.debug(`Disposing target ${this._facelineTarget.texture.id} for faceline`);
			this._facelineTarget.dispose();
			this._facelineTarget = null;
		}
		// _maskTargets should always be defined.
		this._maskTargets.forEach((target, i) => {
			if (!target) {
				// No mask for this expression.
				return;
			}
			console.debug(`Disposing target ${target.texture.id} for mask ${i}`);
			target.dispose();
			this._maskTargets[i] = null;
		});
	}

	// ---------------------- Public Methods - Cleanup, Data ----------------------

	/**
	 * Disposes the CharModel and removes all associated resources.
	 * - Disposes materials and geometries.
	 * - Deletes faceline texture if it exists.
	 * - Deletes all mask textures.
	 * - Removes all meshes from the scene.
	 * @param {boolean} disposeTargets - Whether or not to dispose of mask and faceline render targets.
	 * @public
	 */
	dispose(disposeTargets = true) {
		// Print the permanent __ptr rather than _ptr.
		console.debug('CharModel.dispose: ptr =', this.__ptr);
		this._finalizeCharModel(); // Should've been called already
		// Dispose meshes: materials, geometries, textures.
		if (this.meshes) {
			// Break these references first (still in meshes)
			this._facelineMesh = null;
			this._maskMesh = null;
			disposeMeshes(this.meshes);
			this.meshes = null;
		}
		// Dispose render textures.
		if (disposeTargets) {
			this.disposeTargets();
		}
		if (this._textureManager) {
			this._textureManager.dispose();
			// Null out reference to TextureManager, assuming
			// all textures within are already deleted by now.
			this._textureManager = null;
		}
	}

	/**
	 * Serializes the CharModel data to FFLStoreData.
	 * @returns {Uint8Array} The exported FFLStoreData.
	 * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo
	 * returns false, usually when CharInfo verification fails.
	 * @public
	 */
	getStoreData() {
		// Serialize the CharInfo.
		const charInfoData = this._getCharInfoUint8Array();

		const mod = this._module;
		// Allocate function arguments.
		/** Input */
		const charInfoPtr = mod._malloc(FFLiCharInfo.size);
		/** Output */
		const storeDataPtr = mod._malloc(FFLStoreData_size);
		mod.HEAPU8.set(charInfoData, charInfoPtr);

		// Call conversion function.
		const result = mod._FFLpGetStoreDataFromCharInfo(storeDataPtr, charInfoPtr);
		// Free and return data.
		const storeData = mod.HEAPU8.slice(storeDataPtr, storeDataPtr + FFLStoreData_size);
		mod._free(charInfoPtr);
		mod._free(storeDataPtr);

		if (!result) {
			throw new Error('getStoreData: call to FFLpGetStoreDataFromCharInfo returned false, CharInfo verification probably failed');
		}

		return storeData;
	}

	// TODO: getStudioCharInfo

	// ------------------------ Mask and Faceline Textures ------------------------

	/**
	 * Sets the expression for this CharModel and updates the corresponding mask texture.
	 * @param {FFLExpression} expression - The new expression index.
	 * @throws {Error} CharModel must have been initialized with the
	 * expression enabled in the flag and have XLU_MASK in meshes.
	 * @public
	 */
	setExpression(expression) {
		this._model.expression = expression;

		/** or getMaskTexture()? */
		const targ = this._maskTargets[expression];
		if (!targ || !targ.texture) {
			throw new ExpressionNotSet(expression);
		}
		const mesh = this._maskMesh;
		if (!mesh || !(mesh instanceof THREE.Mesh)) {
			// So there is no mask mesh, which is not supposed to happen...
			// ... except for when the expression is 61 or 62, in which case just return.
			if (expression === FFLExpression.BLANK_61 || expression === FFLExpression.BLANK_62) {
				return; // Drop out without throwing or setting expression.
			}
			throw new Error('setExpression: mask mesh does not exist, cannot set expression on it');
		}
		// Update texture and material.
		/** @type {import('three').Texture&{_target:import('three').RenderTarget}} */ (targ.texture)
			._target = targ;
		/** @type {import('three').MeshBasicMaterial} */ (mesh.material).map = targ.texture;
		/** @type {import('three').MeshBasicMaterial} */ (mesh.material).needsUpdate = true;
	}

	/**
	 * Gets the faceline texture, or the texture that wraps around
	 * the faceline shape (opaque, the one hair is placed atop).
	 * Not to be confused with the texture containing facial features
	 * such as eyes, mouth, etc. which is the mask.
	 * The faceline texture may not exist if it is not needed, in which
	 * case the faceline color is used directly, see property {@link facelineColor}.
	 * @returns {import('three').RenderTarget|null} The faceline render target, or null if it does not exist,
	 * in which case {@link facelineColor} should be used. Access .texture on this object to
	 * get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
	 */
	getFaceline() { // getFaceTexture / "FFLiGetFaceTextureFromCharModel"
		// Return the render target if it exists.
		if (this._facelineTarget) {
			return this._facelineTarget;
		}
		return null;
	}

	/**
	 * Gets the mask texture, or the texture containing facial
	 * features such as eyes, mouth, eyebrows, etc. This is wrapped
	 * around the mask shape, which is a transparent shape
	 * placed in front of the head model.
	 * @param {FFLExpression} expression - The desired expression, or the current expression.
	 * @returns {import('three').RenderTarget|null} The mask render target for the given expression,
	 * or null if the CharModel was not initialized with that expression.
	 * Access .texture on this object to get a {@link THREE.Texture} from it.
	 * It becomes invalid if the CharModel is disposed.
	 */
	getMask(expression = this.expression) { // getMaskTexture
		// Return the render target if it exists.
		if (this._maskTargets && this._maskTargets[expression]) {
			return this._maskTargets[expression];
		}
		return null;
	}

	// ------------------------------ Public Getters ------------------------------

	/**
	 * The current expression for this CharModel.
	 * Read-only. Use setExpression to set the expression.
	 * @returns {FFLExpression} The current expression.
	 * @public
	 */
	get expression() {
		return this._model.expression; // mirror
	}

	/**
	 * Contains the CharInfo of the model.
	 * Changes to this will not be reflected whatsoever.
	 * @returns {FFLiCharInfo} The CharInfo of the model.
	 * @public
	 */
	get charInfo() {
		return this._model.charInfo;
	}

	/**
	 * The faceline color for this CharModel.
	 * @returns {import('three').Color} The faceline color.
	 * @public
	 */
	get facelineColor() {
		if (!this._facelineColor) {
			/** @private */
			this._facelineColor = this._getFacelineColor();
		}
		return this._facelineColor;
	}

	/**
	 * The favorite color for this CharModel.
	 * @returns {import('three').Color} The favorite color.
	 * @public
	 */
	get favoriteColor() {
		if (!this._favoriteColor) {
			/** @private */
			this._favoriteColor = this._getFavoriteColor();
		}
		return this._favoriteColor;
	}

	/**
	 * @returns {number} Gender as 0 = male, 1 = female
	 * @public
	 */
	get gender() {
		return this._model.charInfo.personal.gender;
	}

	/**
	 * The parameters in which to transform hats and other accessories.
	 * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
	 * @public
	 */
	get partsTransform() {
		if (!this._partsTransform) {
			// Set partsTransform property as THREE.Vector3.
			/** @private */
			this._partsTransform = this._getPartsTransform();
		}
		return this._partsTransform;
	}

	/**
	 * @returns {import('three').Box3} The bounding box.
	 * @public
	 */
	get boundingBox() {
		if (!this._boundingBox) {
			// Set boundingBox property as THREE.Box3.
			/** @private */
			this._boundingBox = this._getBoundingBox();
		}
		return this._boundingBox;
	}

	// -------------------------------- Body Scale --------------------------------

	/** @enum {number} */
	static BodyScaleMode = {
		/** Applies scale normally. */
		Apply: 0,
		/** Limits scale so that the pants are not visible. */
		Limit: 1
	};

	/* eslint-disable jsdoc/no-undefined-types -- BodyScaleMode */
	/**
	 * Gets a vector in which to scale the body model for this CharModel.
	 * @param {BodyScaleMode} scaleMode - Mode in which to create the scale vector.
	 * @returns {import('three').Vector3} Scale vector for the body model.
	 * @throws {Error} Unexpected value for scaleMode
	 * @public
	 */
	getBodyScale(scaleMode = CharModel.BodyScaleMode.Apply) {
		/* eslint-enable jsdoc/no-undefined-types -- BodyScaleMode */
		const build = this._model.charInfo.body.build;
		const height = this._model.charInfo.body.height;

		const bodyScale = new THREE.Vector3();
		switch (scaleMode) {
			case CharModel.BodyScaleMode.Apply: {
				// calculated here in libnn_mii/draw/src/detail/mii_VariableIconBodyImpl.cpp:
				// void nn::mii::detail::`anonymous namespace'::GetBodyScale(struct nn::util::Float3 *, int, int)
				// also in ffl_app.rpx: FUN_020ec380 (FFLUtility), FUN_020737b8 (mii maker US)
				// ScaleApply
				// 0.47 / 128.0 = 0.003671875
				bodyScale.x = (build * (height * 0.003671875 + 0.4)) / 128.0 +
				// 0.23 / 128.0 = 0.001796875
					height * 0.001796875 + 0.4;
				// 0.77 / 128.0 = 0.006015625
				bodyScale.y = (height * 0.006015625) + 0.5;
				break;
			}
			case CharModel.BodyScaleMode.Limit: {
				// ScaleLimit
				const heightFactor = height / 128.0;
				bodyScale.y = heightFactor * 0.55 + 0.6;
				bodyScale.x = heightFactor * 0.3 + 0.6;
				bodyScale.x = ((heightFactor * 0.6 + 0.8) - bodyScale.x) *
					(build / 128.0) + bodyScale.x;
				break;
			}
			default:
				throw new Error(`getBodyScale: Unexpected value for scaleMode: ${scaleMode}`);
		}

		// z is always set to x for either set
		bodyScale.z = bodyScale.x;

		return bodyScale;
	}
}

// TODO PATH: src/Body.js (move above function, enum into there?)

/** @enum {number} */
const PantsColor = {
	GrayNormal: 0,
	BluePresent: 1,
	RedRegular: 2,
	GoldSpecial: 3
};

/** @type {Object<PantsColor, import('three').Color>} */
const pantsColors = {
	[PantsColor.GrayNormal]: new THREE.Color(0x40474E),
	[PantsColor.BluePresent]: new THREE.Color(0x28407A),
	[PantsColor.RedRegular]: new THREE.Color(0x702015),
	[PantsColor.GoldSpecial]: new THREE.Color(0xC0A030)
};

// TODO PATH: src/CharInfo.js

/**
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Input: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} The CharModelSource with the data specified.
 * @throws {Error} data must be Uint8Array or FFLiCharInfo object. Data must be a known type.
 * @package
 */
function _allocateModelSource(data, module) {
	/** Maximum size. */
	const bufferPtr = module._malloc(FFLiCharInfo.size);

	// Create modelSource.
	const modelSource = {
		// FFLDataSource.BUFFER = copies and verifies
		// FFLDataSource.DIRECT_POINTER = use without verification.
		dataSource: FFLDataSource.DIRECT_POINTER, // Assumes CharInfo by default.
		pBuffer: bufferPtr,
		index: 0 // unneeded for raw data
	};

	// module._FFLiGetRandomCharInfo(bufferPtr, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE); return modelSource;

	// Check type of data.
	if (!(data instanceof Uint8Array)) {
		try {
			if (typeof data !== 'object') {
				throw new Error('_allocateModelSource: data passed in is not FFLiCharInfo object or Uint8Array');
			}
			// Assume that this is FFLiCharInfo as an object.
			// Deserialize to Uint8Array.
			data = FFLiCharInfo.pack(data);
		} catch (e) {
			module._free(bufferPtr);
			throw e;
		}
	}

	/** @param {Uint8Array} src - Source data in {@link StudioCharInfo} format. */
	function setStudioData(src) {
		// studio raw, decode it to charinfo
		const studio = StudioCharInfo.unpack(src);
		const charInfo = convertStudioCharInfoToFFLiCharInfo(studio);
		data = FFLiCharInfo.pack(charInfo);
		module.HEAPU8.set(data, bufferPtr);
	}

	/**
	 * Gets CharInfo from calling a function.
	 * @param {Uint8Array} data - The input data.
	 * @param {number} size - The size to allocate.
	 * @param {string} funcName - The function on the module to call.
	 * @throws {Error} Throws if the function returned false.
	 * @private
	 */
	function callGetCharInfoFunc(data, size, funcName) {
		const dataPtr = module._malloc(size);
		module.HEAPU8.set(data, dataPtr);
		// @ts-ignore - Module cannot be indexed by string. NOTE: The function MUST exist.
		const result = module[funcName](bufferPtr, dataPtr);
		module._free(dataPtr);
		if (!result) {
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: call to ${funcName} returned false, CharInfo verification probably failed`);
		}
	}

	// data should be Uint8Array at this point.

	// Enumerate through supported data types.
	switch (data.length) {
		case FFLStoreData_size: { // sizeof(FFLStoreData)
			// modelSource.dataSource = FFLDataSource.STORE_DATA;
			// Convert FFLStoreData to FFLiCharInfo instead.
			callGetCharInfoFunc(data, FFLStoreData_size, '_FFLpGetCharInfoFromStoreData');
			break;
		}
		case 74: // sizeof(RFLCharData)
		case 76: { // sizeof(RFLStoreData)
			callGetCharInfoFunc(data, 74, '_FFLpGetCharInfoFromMiiDataOfficialRFL');
			break;
		}
		case FFLiCharInfo.size:
			// modelSource.dataSource = FFLDataSource.BUFFER; // Default option.
			module.HEAPU8.set(data, bufferPtr); // Copy data into heap.
			break;
		case StudioCharInfo.size + 1: {
			// studio data obfuscated
			data = studioURLObfuscationDecode(data);
			setStudioData(data);
			break;
		}
		case StudioCharInfo.size: {
			// studio data raw
			setStudioData(data);
			break;
		}
		default: {
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: Unknown data length: ${data.length}`);
		}
	}

	return modelSource; // NOTE: pBuffer must be freed.
}

// ----------------- verifyCharInfo(data, module, verifyName) -----------------
/**
 * Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
 * @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
 * @param {Module} module - Module to access the data and call FFL through.
 * @param {boolean} verifyName - Whether the name and creator name should be verified.
 * @returns {void} Returns nothing if verification passes.
 * @throws {FFLiVerifyReasonException} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
 * @public
 * @todo TODO: Should preferably return a custom error class.
 */
function verifyCharInfo(data, module, verifyName = false) {
	// Resolve charInfoPtr as pointer to CharInfo.
	let charInfoPtr = 0;
	let charInfoAllocated = false;
	// Assume that number means pointer.
	if (typeof data === 'number') {
		charInfoPtr = data;
		charInfoAllocated = false;
	} else {
		// Assume everything else means Uint8Array. TODO: untested
		charInfoAllocated = true;
		// Allocate and copy CharInfo.
		charInfoPtr = module._malloc(FFLiCharInfo.size);
		module.HEAPU8.set(data, charInfoPtr);
	}
	const result = module._FFLiVerifyCharInfoWithReason(charInfoPtr, verifyName);
	// Free CharInfo as soon as the function returns.
	if (charInfoAllocated) {
		module._free(charInfoPtr);
	}

	if (result !== 0) {
		// Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
		throw new FFLiVerifyReasonException(result);
	}
}

// --------------- getRandomCharInfo(module, gender, age, race) ---------------
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 * @param {Module} module - The Emscripten module.
 * @param {FFLGender} gender - Gender of the character.
 * @param {FFLAge} age - Age of the character.
 * @param {FFLRace} race - Race of the character.
 * @returns {Uint8Array} The random FFLiCharInfo.
 * @todo TODO: Should this return FFLiCharInfo object?
 */
function getRandomCharInfo(module, gender = FFLGender.ALL, age = FFLAge.ALL, race = FFLRace.ALL) {
	const ptr = module._malloc(FFLiCharInfo.size);
	module._FFLiGetRandomCharInfo(ptr, gender, age, race);
	const result = module.HEAPU8.slice(ptr, ptr + FFLiCharInfo.size);
	module._free(ptr);
	return result;
}

// --------------------- makeExpressionFlag(expressions) ----------------------
/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * Use this whenever you need to describe which expression,
 * or expressions, you want to be able to use in the CharModel.
 * @param {Array<FFLExpression>|FFLExpression} expressions - Either a single expression
 * index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
function makeExpressionFlag(expressions) {
	/**
	 * @param {FFLExpression} i - Expression index to check.
	 * @throws {Error} input out of range
	 */
	function checkRange(i) {
		if (i >= FFLExpression.MAX) {
			throw new Error(`makeExpressionFlag: input out of range: got ${i}, max: ${FFLExpression.MAX}`);
		}
	}

	/**
	 * Logs using {@link console.warn} if the expression index
	 * disables any shapes in the CharModel, meant to
	 * be used when setting multiple indices.
	 * @param {FFLExpression} i - Expression index to check.
	 */
	function warnIfChangesShapes(i) {
		// Disables nose: dog/cat, blank
		const expressionsDisablingNose = [49, 50, 51, 52, 61, 62];
		// Disables mask: blank
		const expressionsDisablingMask = [61, 62];

		const prefix = `makeExpressionFlag > warnIfChangesShapes: An expression was enabled (${i}) that is meant to disable nose or mask shape for the entire CharModel, so it is only recommended to set this as a single expression rather than as one of multiple.`;
		if (expressionsDisablingNose.indexOf(i) !== -1) {
			console.warn(`${prefix} (nose shape)`);
		}
		if (expressionsDisablingMask.indexOf(i) !== -1) {
			console.warn(`${prefix} (in this case, MASK SHAPE so there is supposed to be NO FACE)`);
		}
	}

	/** FFLAllExpressionFlag */
	const flags = new Uint32Array([0, 0, 0]);

	// Set single expression.
	if (typeof expressions === 'number') {
		// Make expressions into an array.
		expressions = [expressions];
		// Fall-through.
	} else if (!Array.isArray(expressions)) {
		throw new Error('makeExpressionFlag: expected array or single number');
	}

	// Set multiple expressions in an array.
	for (const index of expressions) {
		checkRange(index);
		warnIfChangesShapes(index); // Warn if the expression changes shapes.
		/** Determine which 32-bit block. */
		const part = Math.floor(index / 32);
		/** Determine the bit within the block. */
		const bitIndex = index % 32;

		flags[part] |= (1 << bitIndex); // Set the bit.
	}
	return flags;
}

// // ---------------------------------------------------------------------
// //  CharModel Creation
// // ---------------------------------------------------------------------
// TODO PATH: src/CharModelCreation.js

// --------- createCharModel(data, modelDesc, materialClass, module) ---------
/**
 * Creates a CharModel from data and FFLCharModelDesc.
 * You must call initCharModelTextures afterwards to finish the process.
 * Don't forget to call dispose() on the CharModel when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Character data. Accepted types:
 * FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {FFLCharModelDesc|null} modelDesc - The model description. Default: {@link FFLCharModelDescDefault}
 * @param {MaterialConstructor} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
 * @param {Module} module - The Emscripten module.
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The new CharModel instance.
 * @throws {FFLResultException|BrokenInitModel|FFLiVerifyReasonException|Error} Throws if `module`, `modelDesc`,
 * or `data` is invalid, CharInfo verification fails, or CharModel creation fails otherwise.
 */
function createCharModel(data, modelDesc, materialClass, module, verify = true) {
	modelDesc = modelDesc || FFLCharModelDescDefault;

	// Verify arguments.
	if (!module || !module._malloc) {
		throw new Error('createCharModel: module is null or does not have ._malloc.');
	}
	if (!data) {
		throw new Error('createCharModel: data is null or undefined.');
	}
	if (typeof modelDesc !== 'object' || modelDesc.allExpressionFlag === undefined) {
		throw new Error('createCharModel: modelDesc argument is invalid, make sure it is FFLCharModelDesc.');
	}
	// Allocate memory for model source, description, char model, and char info.
	const modelSourcePtr = module._malloc(FFLCharModelSource.size);
	const modelDescPtr = module._malloc(FFLCharModelDesc.size);
	const charModelPtr = module._malloc(FFLiCharModel.size);

	// data = getRandomCharInfo(module, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE);
	// console.debug('getRandomCharInfo result:', FFLiCharInfo.unpack(data));
	// Get FFLCharModelSource. This converts and allocates CharInfo.
	const modelSource = _allocateModelSource(data, module);
	/** Get pBuffer to free it later. */
	const charInfoPtr = modelSource.pBuffer;

	const modelSourceBuffer = FFLCharModelSource.pack(modelSource);
	module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);

	// Set field to enable new expressions. This field
	// exists because some callers would leave the other
	// bits undefined but this does not so no reason to not enable
	modelDesc.modelFlag |= FFLModelFlag.NEW_EXPRESSIONS;

	const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
	module.HEAPU8.set(modelDescBuffer, modelDescPtr);

	/**
	 * Local TextureManager instance.
	 * @type {TextureManager|null}
	 */
	let textureManager = null;
	try {
		// Verify CharInfo before creating.
		if (verify) {
			verifyCharInfo(charInfoPtr, module, false); // Don't verify name.
		}

		// Create TextureManager instance for this CharModel.
		textureManager = new TextureManager(module, false);

		// Call FFLInitCharModelCPUStep and check the result.
		// const result = module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		const result = module._FFLInitCharModelCPUStepWithCallback(charModelPtr,
			modelSourcePtr, modelDescPtr, textureManager._textureCallbackPtr);
		if (result === FFLResult.FILE_INVALID) { // FFL_RESULT_BROKEN
			throw new BrokenInitModel();
		}
		FFLResultException.handleResult(result, 'FFLInitCharModelCPUStep');
	} catch (error) {
		if (textureManager) {
			textureManager.dispose();
		}
		// Free CharModel prematurely.
		module._free(charModelPtr);
		throw error;
	} finally {
		// Free temporary allocations.
		module._free(modelSourcePtr);
		module._free(modelDescPtr);
		module._free(charInfoPtr);
		// Callback itself is longer read by FFL.
		if (textureManager) {
			textureManager.disposeCallback();
		}
	}

	// Create the CharModel instance.
	const charModel = new CharModel(charModelPtr, module, materialClass, textureManager);
	// The constructor will populate meshes from the FFLiCharModel instance.
	/** @private */
	charModel._data = data; // Store original data passed to function.

	console.debug(`createCharModel: Initialized for "${charModel._model.charInfo.personal.name}", ptr =`, charModelPtr);
	return charModel;
}

// ------- updateCharModel(charModel, newData, renderer, descOrExpFlag) -------
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @param {import('three').WebGLRenderer} renderer - The Three.js renderer.
 * @param {FFLCharModelDesc|Array<number>|Uint32Array|null} descOrExpFlag - Either a
 * new {@link FFLCharModelDesc}, an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The updated CharModel instance.
 * @throws {Error} Unexpected type for descOrExpFlag, newData is null
 * @todo  TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
 */
function updateCharModel(charModel, newData, renderer, descOrExpFlag = null, verify = true) {
	/** @type {FFLCharModelDesc} */
	let newModelDesc;
	newData = newData || charModel._data;
	if (!newData) {
		throw new Error('updateCharModel: newData is null. It should be retrieved from charModel._data which is set by createCharModel.');
	}

	// Convert descOrExpFlag to an expression flag if needed.
	if (Array.isArray(descOrExpFlag) || typeof descOrExpFlag === 'number') {
		// Array of expressions or single expression was passed in.
		descOrExpFlag = makeExpressionFlag(descOrExpFlag);
	}

	// Process descOrExpFlag based on what it is.
	if (descOrExpFlag instanceof Uint32Array) {
		// If this is already an expression flag (Uint32Array),
		// or set to one previously, use it with existing CharModelDesc.
		newModelDesc = charModel._model.charModelDesc;
		newModelDesc.allExpressionFlag = descOrExpFlag;
	} else if (!descOrExpFlag) {
		// Inherit the CharModelDesc from the current model.
		newModelDesc = charModel._model.charModelDesc;
	} else if (typeof descOrExpFlag === 'object') {
		// Assume that descOrExpFlag is a new FFLCharModelDesc.
		newModelDesc = /** @type {FFLCharModelDesc} */ (descOrExpFlag);
	} else {
		throw new Error('updateCharModel: Unexpected type for descOrExpFlag');
	}

	// Dispose of the old CharModel.
	charModel.dispose();
	// Create a new CharModel with the new data and ModelDesc.
	const newCharModel = createCharModel(newData, newModelDesc,
		charModel._materialClass, charModel._module, verify);
	// Initialize its textures.
	initCharModelTextures(newCharModel, renderer, charModel._materialTextureClass);
	return newCharModel;
}

/**
 * Copies faceline and mask render targets from `src`
 * to the `dst` CharModel, disposing textures from `dst`
 * and disposing shapes from `src`, effectively transferring.
 * @param {CharModel} src - The source {@link CharModel} from which to copy textures from and dispose shapes.
 * @param {CharModel} dst - The destination {@link CharModel} receiving the textures.
 * @returns {CharModel} The final CharModel.
 * @todo TODO: Completely untested.
 */
function transferCharModelTex(src, dst) {
	// Dispose textures on destination CharModel, they will be replaced.
	dst.disposeTargets();
	// Dispose everything but textures on the source CharModel.
	src.dispose(false);

	// Transfer faceline and mask targets.
	dst._facelineTarget = src._facelineTarget;
	dst._maskTargets = src._maskTargets;

	// The references are transferred too so when the
	// dst CharModel gets deleted it will dispose the right ones.
	return dst;
}

// // ---------------------------------------------------------------------
// //  DrawParam Reading
// // ---------------------------------------------------------------------
// TODO PATH: src/DrawParam.js

/**
 * @param {Function} material - Class constructor for the material to test.
 * @returns {boolean} Whether or not the material class supports FFL swizzled (modulateMode) textures.
 */
function matSupportsFFL(material) {
	return ('modulateMode' in material.prototype);
}

// TODO: private?
// ------ drawParamToMesh(drawParam, materialClass, module, texManager) ------
/**
 * Converts FFLDrawParam into a THREE.Mesh.
 * Binds geometry, texture, and material parameters.
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {MaterialConstructor} materialClass - Class for the material (constructor).
 * @param {Module} module - The Emscripten module.
 * @param {TextureManager|null} texManager - The {@link TextureManager} instance
 * for which to look for textures referenced by the DrawParam.
 * @returns {import('three').Mesh|null} The THREE.Mesh instance, or
 * null if the index count is 0 indicating no shape data.
 * @throws {Error} drawParam may be null, Unexpected value for FFLCullMode, Passed in TextureManager is invalid
 */
function drawParamToMesh(drawParam, materialClass, module, texManager) {
	if (!drawParam) {
		throw new Error('drawParamToMesh: drawParam may be null.');
	}
	if (!texManager) {
		throw new Error('drawParamToMesh: Passed in TextureManager is null or undefined, is it constructed?');
	}
	if (typeof materialClass !== 'function') {
		throw new Error('drawParamToMesh: materialClass is unexpectedly not a function.');
	}

	// Skip if the index count is 0, indicating no shape data.
	if (drawParam.primitiveParam.indexCount === 0) {
		return null;
	}
	// Bind geometry data.
	const geometry = _bindDrawParamGeometry(drawParam, module);
	// Determine cull mode by mapping FFLCullMode to THREE.Side.
	/** @type {Object<FFLCullMode, import('three').Side>} */
	const cullModeToThreeSide = {
		[FFLCullMode.NONE]: THREE.DoubleSide,
		[FFLCullMode.BACK]: THREE.FrontSide,
		[FFLCullMode.FRONT]: THREE.BackSide,
		// Used by faceline/mask 2D planes for some reason:
		[FFLCullMode.MAX]: THREE.DoubleSide
	};
	const side = cullModeToThreeSide[drawParam.cullMode];
	if (side === undefined) {
		throw new Error(`drawParamToMesh: Unexpected value for FFLCullMode: ${drawParam.cullMode}`);
	}
	// Get texture.
	const texture = _getTextureFromModulateParam(drawParam.modulateParam, texManager);

	// Apply modulateParam material parameters.
	const isFFLMaterial = matSupportsFFL(materialClass);
	const params = _applyModulateParam(drawParam.modulateParam, module, isFFLMaterial);
	// Create object for material parameters.
	const materialParam = {
		side: side,
		// Apply texture.
		map: texture,
		...params
	};

	// Special case for if tangent (NEEDED for aniso) is missing, and...
	if (geometry.attributes.tangent === undefined && // "_color" can be tested too.
		// ... material is FFLShaderMaterial. Which is the only one using that attribute.
		'useSpecularModeBlinn' in materialClass.prototype) {
		/** @type {import('./FFLShaderMaterial').FFLShaderMaterialParameters} */
		(materialParam).useSpecularModeBlinn = true;
	}

	// Create material using the provided materialClass.
	const material = new materialClass(materialParam);
	// Create mesh and set userData.modulateType.
	const mesh = new THREE.Mesh(geometry, material);

	// Apply pAdjustMatrix transformations if it is not null.
	if (drawParam.primitiveParam.pAdjustMatrix !== 0) {
		_applyAdjustMatrixToMesh(drawParam.primitiveParam.pAdjustMatrix, mesh, module.HEAPF32);
	}

	// Set properties that can be used to reconstruct the material in userData.
	// NOTE: These are only in geometry (primitive) because FFL-Testing does the same, see:
	// https://github.com/ariankordi/FFL-Testing/blob/2219f64473ac8312bab539cd05c00f88c14d2ffd/src/GLTFExportCallback.cpp#L828
	if (mesh.geometry.userData) {
		// Set modulateMode/modulateType (not modulateColor or cullMode).
		mesh.geometry.userData.modulateMode = drawParam.modulateParam.mode;
		mesh.geometry.userData.modulateType = drawParam.modulateParam.type;
		// Note that color is a part of THREE.Material and will most always be there
		mesh.geometry.userData.color = params.color instanceof THREE.Color
			? [params.color.r, params.color.g, params.color.b, 1.0]
			: [1.0, 1.0, 1.0, 1.0];
		mesh.geometry.userData.cullMode = drawParam.cullMode;
	}
	return mesh;
}

/**
 * Binds geometry attributes from drawParam into a THREE.BufferGeometry.
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {Module} module - The Emscripten module from which to read the heap.
 * @returns {import('three').BufferGeometry} The geometry.
 * @throws {Error} Position buffer must not have size of 0
 * @package
 * @todo Does not yet handle color stride = 0
 */
function _bindDrawParamGeometry(drawParam, module) {
	/**
	 * @param {string} typeStr - The type of the attribute.
	 * @param {number} stride - The stride to display.
	 * @throws {Error} Unexpected stride for attribute ...
	 */
	function unexpectedStride(typeStr, stride) {
		throw new Error(`_bindDrawParamGeometry: Unexpected stride for attribute ${typeStr}: ${stride}`);
	}

	// Access FFLAttributeBufferParam.
	const attributes = drawParam.attributeBufferParam.attributeBuffers;
	const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
	// There should always be positions.
	if (positionBuffer.size === 0) {
		throw new Error('_bindDrawParamGeometry: Position buffer must not have size of 0');
	}

	// Get vertex count from position buffer.
	const vertexCount = positionBuffer.size / positionBuffer.stride;
	/** Create BufferGeometry. */
	const geometry = new THREE.BufferGeometry();
	// Bind index data.
	const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
	const indexCount = drawParam.primitiveParam.indexCount;
	const indices = module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
	geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1));
	// Add attribute data.
	for (const typeStr in attributes) {
		const buffer = attributes[typeStr];
		const type = parseInt(typeStr);
		// Skip disabled attributes that have size of 0.
		if (buffer.size === 0) {
			continue;
		}

		switch (type) {
			case FFLAttributeBufferType.POSITION: {
				if (buffer.stride === 16) {
					// 3 floats, last 4 bytes unused.
					/** float data type */
					const ptr = buffer.ptr / 4;
					const data = module.HEAPF32.subarray(ptr, ptr + (vertexCount * 4));
					const interleavedBuffer = new THREE.InterleavedBuffer(data, 4);
					// Only works on Three.js r109 and above (previously used addAttribute which can be remapped)
					geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0));
					// ^^ Selectively use first three elements only.
				} else if (buffer.stride === 6) {
					/** half-float data type */
					const ptr = buffer.ptr / 2;
					const data = module.HEAPU16.subarray(ptr, ptr + (vertexCount * 3));
					geometry.setAttribute('position', new THREE.Float16BufferAttribute(data, 3));
				} else {
					unexpectedStride(typeStr, buffer.stride);
				}
				break;
			}
			case FFLAttributeBufferType.NORMAL: {
				// Either int8 or 10_10_10_2
				// const data = module.HEAP32.subarray(buffer.ptr / 4, buffer.ptr / 4 + vertexCount);
				// const buf = gl.createBuffer();
				// gl.bindBuffer(gl.ARRAY_BUFFER, buf);
				// gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
				// // Bind vertex type GL_INT_2_10_10_10_REV/ / 0x8D9F.
				// geometry.setAttribute('normal', new THREE.GLBufferAttribute(buf, 0x8D9F, 4, 4));
				const data = module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('normal', new THREE.Int8BufferAttribute(data, buffer.stride, true));
				break;
			}
			case FFLAttributeBufferType.TANGENT: {
				// Int8
				const data = module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('tangent', new THREE.Int8BufferAttribute(data, buffer.stride, true));
				break;
			}
			case FFLAttributeBufferType.TEXCOORD: {
				if (buffer.stride === 8) {
					/** float data type */
					const ptr = buffer.ptr / 4;
					const data = module.HEAPF32.subarray(ptr, ptr + (vertexCount * 2));
					geometry.setAttribute('uv', new THREE.Float32BufferAttribute(data, 2));
				} else if (buffer.stride === 4) {
					/** half-float data type */
					const ptr = buffer.ptr / 2;
					const data = module.HEAPU16.subarray(ptr, ptr + (vertexCount * 2));
					geometry.setAttribute('uv', new THREE.Float16BufferAttribute(data, 2));
				} else {
					unexpectedStride(typeStr, buffer.stride);
				}
				break;
			}
			case FFLAttributeBufferType.COLOR: {
				// Uint8

				// Use default value if it does not exist.
				// NOTE: Does not handle values for u_color other
				// than the default 0/0/0/1 (custom u_parameter_mode)
				if (buffer.stride === 0) {
					break;
				}
				// Use "_color" because NOTE this is what the FFL-Testing exports and existing shaders do
				const data = module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(data, buffer.stride, true));
				break;
			}
		}
	}
	return geometry;
}

/**
 * Retrieves a texture from ModulateParam.
 * Does not assign texture for faceline or mask types.
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam.
 * @param {TextureManager} textureManager - The {@link TextureManager} instance
 * for which to look for the texture referenced.
 * @returns {import('three').Texture|null} The texture if found.
 * @throws {Error} Throws if pTexture2D refers to a texture that was not found in the TextureManager
 * @package
 */
function _getTextureFromModulateParam(modulateParam, textureManager) {
	// Only assign texture if pTexture2D is not null.
	if (!modulateParam.pTexture2D ||
		// The pointer will be set to just "1" for
		// faceline and mask textures that are supposed
		// to be targets (FFL_TEXTURE_PLACEHOLDER, FFLI_RENDER_TEXTURE_PLACEHOLDER)
		modulateParam.pTexture2D === 1) {
		return null; // No texture to bind.
	}
	const texturePtr = modulateParam.pTexture2D;
	const texture = textureManager.get(texturePtr);
	if (!texture) {
		throw new Error(`_getTextureFromModulateParam: Texture not found for ${texturePtr}.`);
	}
	// Selective apply mirrored repeat (not supported on NPOT/mipmap textures for WebGL 1.0)
	const applyMirrorTypes = [
		FFLModulateType.SHAPE_FACELINE, FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_GLASS];
	// ^^ Faceline, cap, and glass. NOTE that faceline texture won't go through here
	if (applyMirrorTypes.indexOf(modulateParam.type) !== -1) {
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.needsUpdate = true;
	}
	return texture;
}

/**
 * Retrieves blending parameters based on the FFLModulateType.
 * Will only actually return anything for mask and faceline shapes.
 * @param {FFLModulateType} modulateType - The modulate type.
 * @param {FFLModulateMode} [modulateMode] - The modulate mode, used to
 * differentiate body/pants modulate types from mask modulate types.
 * @returns {Object} An object containing blending parameters for the Three.js material constructor, or an empty object.
 * @throws {Error} Unknown modulate type
 * @package
 */
function _getBlendOptionsFromModulateType(modulateType, modulateMode) {
	/*
	if (modulateType >= FFLModulateType.SHAPE_FACELINE &&
		modulateType <= FFLModulateType.SHAPE_CAP) {
		// Opaque (DrawOpa)
		// glTF alphaMode: OPAQUE
		return {
			blending: THREE.CustomBlending,
			blendSrcAlpha: THREE.SrcAlphaFactor,
			blendDstAlpha: THREE.OneFactor
		};
	} else if (modulateType >= FFLModulateType.SHAPE_MASK &&
		modulateType <= FFLModulateType.SHAPE_GLASS) {
		// Translucent (DrawXlu)
		// glTF alphaMode: MASK (TEXTURE_DIRECT), or BLEND (LUMINANCE_ALPHA)?
		return {
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			blendDstAlpha: THREE.OneFactor,
			// transparent: true
			depthWrite: false // kept on inside of LUTShaderMaterial
		};
	} else
	*/
	if (modulateMode !== 0 && modulateType >= FFLModulateType.SHAPE_MAX &&
		modulateType <= FFLModulateType.MOLE) {
		// Mask Textures
		return {
			blending: THREE.CustomBlending,
			blendSrc: THREE.OneMinusDstAlphaFactor,
			blendSrcAlpha: THREE.SrcAlphaFactor,
			blendDst: THREE.DstAlphaFactor
		};
	} else if (modulateMode !== 0 && modulateType >= FFLModulateType.FACE_MAKE &&
		modulateType <= FFLModulateType.FILL) {
		// Faceline Texture
		return {
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			blendSrcAlpha: THREE.OneFactor,
			blendDstAlpha: THREE.OneFactor
		};
	}
	return {};
	// No blending options needed.
	// else {
	// 	throw new Error(`_getBlendOptionsFromModulateType: Unknown modulate type: ${modulateType}`);
	// }
}

/* eslint-disable jsdoc/require-returns-type -- Allow TS to predict return type. */
/**
 * Returns an object of parameters for a Three.js material constructor, based on {@link FFLModulateParam}.
 * @param {FFLModulateParam} modulateParam - Property `modulateParam` of {@link FFLDrawParam}.
 * @param {Module} module - The Emscripten module for accessing color pointers in heap.
 * @param {boolean} [forFFLMaterial] - Whether or not to include modulateMode/Type parameters for material parameters.
 * @returns Parameters for creating a Three.js material.
 * @package
 */
function _applyModulateParam(modulateParam, module, forFFLMaterial = true) {
	/* eslint-enable jsdoc/require-returns-type -- Allow TS to predict return type. */
	// Apply constant colors.
	/** @type {import('three').Color|Array<import('three').Color>|null} */
	let color = null;

	/**
	 * Single constant color.
	 * @type {FFLColor|null}
	 */
	let color4 = null;
	const f32 = module.HEAPF32;
	// If both pColorG and pColorB are provided, combine them into an array.
	if (modulateParam.pColorG !== 0 && modulateParam.pColorB !== 0) {
		color = [
			_getFFLColor3(_getFFLColor(modulateParam.pColorR, f32)),
			_getFFLColor3(_getFFLColor(modulateParam.pColorG, f32)),
			_getFFLColor3(_getFFLColor(modulateParam.pColorB, f32))
		];

		if (
			self.eyeScleraHack 
			&& modulateParam.type === 12) {
			color = [
				_getFFLColor3(_getFFLColor(modulateParam.pColorR, f32)),
				_getFFLColor3(_getFFLColor(modulateParam.pColorB, f32)),
				_getFFLColor3(_getFFLColor(modulateParam.pColorB, f32))
			];
		}
	} else if (modulateParam.pColorR !== 0) {
		// Otherwise, set it as a single color.
		color4 = _getFFLColor(modulateParam.pColorR, f32);
		color = _getFFLColor3(color4);
	}

	// Use opacity from single pColorR (it's only 0 for "fill" 2D plane)
	const opacity = color4 ? color4.a : 1.0;
	// Otherwise use 1.0, which is the opacity used pretty much everywhere.

	// Set transparent property for Xlu/mask and higher.
	const transparent = modulateParam.type >= FFLModulateType.SHAPE_MASK;

	// Disable lighting if this is a 2D plane (mask/faceline) and not opaque (body/pants).
	const lightEnable = !(modulateParam.type >= FFLModulateType.SHAPE_MAX &&
		modulateParam.mode !== FFLModulateMode.CONSTANT);

	/** Do not include the parameters if forFFLMaterial is false. */
	const modulateModeType = forFFLMaterial
		? {
			modulateMode: modulateParam.mode,
			modulateType: modulateParam.type // need this set before color.
		}
		: {};

	// Not applying map here, that happens in _getTextureFromModulateParam.
	const param = Object.assign(modulateModeType, {
		// Common Three.js material parameters.
		color: color,
		opacity: opacity,
		transparent: transparent,
		// Depth writing is disabled for DrawXlu stage however
		// it is kept enabled in LUTShaderMaterial because its
		// alpha testing chooses to not write depth. Since we are
		// disabling it anyway, that means shapes NEED to be in order
		depthWrite: !transparent,

		// Apply blending options (for mask/faceline) based on modulateType.
		..._getBlendOptionsFromModulateType(modulateParam.type, modulateParam.mode)
	});

	// only for mask/faceline which should not be drawn in non-ffl materials:
	if (!lightEnable) {
		// Only set lightEnable if it is not default.
		/** @type {Object<string, *>} */ (param).lightEnable = lightEnable;
	}
	return param;
}

/**
 * Dereferences a pointer to FFLColor.
 * @param {number} colorPtr - The pointer to the color.
 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
 * @returns {FFLColor} The converted Vector4.
 * @throws {Error} Received null pointer
 */
function _getFFLColor(colorPtr, heapf32) {
	if (!colorPtr) {
		throw new Error('_getFFLColor: Received null pointer');
	}
	// Assign directly from HEAPF32.
	const colorData = heapf32.subarray(colorPtr / 4, colorPtr / 4 + 4);
	return { r: colorData[0], g: colorData[1], b: colorData[2], a: colorData[3] };
}

/**
 * Creates a THREE.Color from {@link FFLColor}.
 * @param {FFLColor} color - The {@link FFLColor} object..
 * @returns {import('three').Color} The converted color.
 */
function _getFFLColor3(color) {
	return new THREE.Color(color.r, color.g, color.b);
}

/**
 * Applies transformations in pAdjustMatrix within a {@link FFLDrawParam} to a mesh.
 * @param {number} pMtx - Pointer to rio::Matrix34f.
 * @param {import('three').Object3D} mesh - The mesh to apply transformations to.
 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
 * @package
 */
function _applyAdjustMatrixToMesh(pMtx, mesh, heapf32) {
	// Assumes pMtx !== 0.
	const ptr = pMtx / 4;
	/** sizeof(rio::BaseMtx34f<float>) */
	const m = heapf32.slice(ptr, ptr + (0x30 / 4));
	// console.debug('drawParamToMesh: shape has pAdjustMatrix: ', m);
	/**
	 * Creates a THREE.Matrix4 from a 3x4 row-major matrix array.
	 * @param {Array<number>|Float32Array} m - The array that makes up the 3x4 matrix, expected to have 12 elements.
	 * @returns {import('three').Matrix4} The converted matrix.
	 */
	function matrixFromRowMajor3x4(m) {
		const matrix = new THREE.Matrix4();
		// Convert from rio::BaseMtx34f/row-major to column-major.
		matrix.set(
			m[0], m[4], m[8], m[3],
			m[1], m[5], m[9], m[7],
			m[2], m[6], m[10], m[11],
			0, 0, 0, 1
		);
		return matrix;
	}
	// Create a matrix from the array.
	const matrix = matrixFromRowMajor3x4(m);

	// Set position and scale. FFLiAdjustShape does not set rotation.
	mesh.scale.setFromMatrixScale(matrix);
	mesh.position.setFromMatrixPosition(matrix);
	// Account for flipped X scale (setFromMatrixScale doesn't?)
	if (matrix.elements[0] === -1) {
		mesh.scale.x = -1;
	}
}

// // ---------------------------------------------------------------------
// //  CharModel Render Textures
// // ---------------------------------------------------------------------
// TODO PATH: src/CharModelTextures.js

// ---------------- initCharModelTextures(charModel, renderer) ----------------
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 * Note that this is a separate function due to needing renderer parameter.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').WebGLRenderer} renderer - The Three.js renderer.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @throws {Error} Throws if the type of `renderer` is unexpected.
 */
function initCharModelTextures(charModel, renderer, materialClass = charModel._materialClass) {
	if (!(renderer instanceof THREE.WebGLRenderer) &&
		renderer['isWebGPURenderer'] === undefined) { // Accounting for future WebGPURenderer support.
		throw new Error('initCharModelTextures: renderer is an invalid or unexpected type.');
	}
	const module = charModel._module;
	// Set material class for render textures.
	charModel._materialTextureClass = materialClass;

	const textureTempObject = charModel._getTextureTempObject();
	// Draw faceline texture if applicable.
	_drawFacelineTexture(charModel, textureTempObject, renderer, module, materialClass);

	// Warn if renderer.alpha is not set to true.
	const clearAlpha = renderer.getClearAlpha();
	(clearAlpha !== 0) && renderer.setClearAlpha(0); // Override clearAlpha to 0.

	// Draw mask textures for all expressions.
	_drawMaskTextures(charModel, textureTempObject, renderer, module, materialClass);
	// Finalize CharModel, deleting and freeing it.
	charModel._finalizeCharModel();
	// Update the expression to refresh the mask texture.
	charModel.setExpression(charModel.expression);
	// Set clearAlpha back.
	(clearAlpha !== 0) && renderer.setClearAlpha(clearAlpha);

	// convert textures
	if (!matSupportsFFL(charModel._materialClass)) {
		if (!matSupportsFFL(charModel._materialTextureClass)) {
			console.warn('initCharModelTextures: charModel._materialClass does not support modulateMode (no getter), but the _materialTextureClass is either the same or also does not support modulateMode so textures will look wrong');
		} else {
			convertModelTexturesToRGBA(charModel, renderer, charModel._materialTextureClass);
		}
	}
}

/**
 * Draws and applies the faceline texture for the CharModel.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The FFLiTextureTempObject containing faceline DrawParams.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @package
 */
function _drawFacelineTexture(charModel, textureTempObject, renderer, module, materialClass) {
	// Invalidate faceline texture before drawing (ensures correctness)
	const facelineTempObjectPtr = charModel._getFacelineTempObjectPtr();
	module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
	// Gather the drawParams that make up the faceline texture.
	const drawParams = [
		textureTempObject.facelineTexture.drawParamFaceMake,
		textureTempObject.facelineTexture.drawParamFaceLine,
		textureTempObject.facelineTexture.drawParamFaceBeard
	].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);
	// Note that for faceline DrawParams to not be empty,
	// it must have a texture. For other DrawParams to not
	// be empty they simply need to have a non-zero index count.
	if (drawParams.length === 0) {
		console.debug('_drawFacelineTexture: Skipping faceline texture.');
		return;
	}

	// Get the faceline color from CharModel.
	const bgColor = charModel.facelineColor;
	// Create an offscreen scene.
	const { scene: offscreenScene } = createSceneFromDrawParams(drawParams, bgColor,
		materialClass, charModel._module, charModel._textureManager);
	// Render scene to texture.
	const width = charModel._getResolution() / 2;
	const height = charModel._getResolution();
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false,
		// Use mirrored repeat wrapping.
		wrapS: THREE.MirroredRepeatWrapping,
		wrapT: THREE.MirroredRepeatWrapping
	};
	const target = createAndRenderToTarget(offscreenScene,
		getIdentCamera(), renderer, width, height, options);

	console.debug(`Creating target ${target.texture.id} for faceline`);

	// Apply texture to CharModel.
	_setFaceline(charModel, target);
	// Delete temp faceline object to free resources.
	module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr,
		charModel._ptr, charModel._model.charModelDesc.resourceType);
	disposeMeshes(offscreenScene); // Dispose meshes in scene.
}

/**
 * Iterates through mask textures and draws each mask texture.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The temporary texture object.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @package
 */
function _drawMaskTextures(charModel, textureTempObject, renderer, module, materialClass) {
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel._getExpressionFlagPtr();

	// Collect all scenes and only dispose them at the end.
	/** @type {Array<import('three').Scene>} */
	const scenes = [];

	// Iterate through pRenderTextures to find out which masks are needed.
	for (let i = 0; i < charModel._model.maskTextures.pRenderTextures.length; i++) {
		// pRenderTexture will be set to 1 if mask is meant to be drawn there.
		if (charModel._model.maskTextures.pRenderTextures[i] === 0) {
			continue;
		}
		const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
		const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(
			module.HEAPU8.subarray(rawMaskDrawParamPtr,
				rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
		module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);

		const { target, scene } = _drawMaskTexture(charModel,
			rawMaskDrawParam, renderer, module, materialClass);
		console.debug(`Creating target ${target.texture.id} for mask ${i}`);
		charModel._maskTargets[i] = target;

		scenes.push(scene);
	}

	// Some texures are shared which is why this
	// needs to be done given that disposeMeshes
	// unconditionally deletes textures.
	scenes.forEach((scene) => {
		disposeMeshes(scene);
	});

	module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr,
		expressionFlagPtr, charModel._model.charModelDesc.resourceType);
	module._FFLiDeleteTextureTempObject(charModel._ptr);
}

/**
 * Draws a single mask texture based on a RawMaskDrawParam.
 * Note that the caller needs to dispose meshes within the returned scene.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiRawMaskDrawParam} rawMaskParam - The RawMaskDrawParam.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @returns {{target: import('three').RenderTarget, scene: import('three').Scene}}
 * The RenderTarget and scene of this mask texture.
 * @throws {Error} All DrawParams are empty.
 * @package
 */
function _drawMaskTexture(charModel, rawMaskParam, renderer, module, materialClass) {
	const drawParams = [
		rawMaskParam.drawParamRawMaskPartsMustache[0],
		rawMaskParam.drawParamRawMaskPartsMustache[1],
		rawMaskParam.drawParamRawMaskPartsMouth,
		rawMaskParam.drawParamRawMaskPartsEyebrow[0],
		rawMaskParam.drawParamRawMaskPartsEyebrow[1],
		rawMaskParam.drawParamRawMaskPartsEye[0],
		rawMaskParam.drawParamRawMaskPartsEye[1],
		rawMaskParam.drawParamRawMaskPartsMole
	].filter(dp => dp && dp.primitiveParam.indexCount !== 0);
	if (drawParams.length === 0) {
		throw new Error('_drawMaskTexture: All DrawParams are empty.');
	}
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false
	};
	// Create an offscreen scene with no background (for 2D mask rendering).
	const { scene: offscreenScene } = createSceneFromDrawParams(drawParams,
		null, materialClass, module, charModel._textureManager);
	const width = charModel._getResolution();

	const target = createAndRenderToTarget(offscreenScene,
		getIdentCamera(), renderer, width, width, options);

	return { target, scene: offscreenScene };
	// Caller needs to dispose meshes in scene.
}

/**
 * Sets the faceline texture of the given CharModel from the RenderTarget.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').RenderTarget} target - RenderTarget for the faceline texture.
 * @throws {Error} target must be a valid THREE.RenderTarget with "texture" property
 * and CharModel must be initialized with OPA_FACELINE in meshes.
 * @package
 */
function _setFaceline(charModel, target) {
	if (!target || !target.texture) {
		throw new Error('setFaceline: passed in RenderTarget is invalid');
	}
	charModel._facelineTarget = target; // Store for later disposal.
	const mesh = charModel._facelineMesh;
	if (!mesh || !(mesh instanceof THREE.Mesh)) {
		throw new Error('setFaceline: faceline shape does not exist');
	}
	// Update texture and material.
	/** @type {import('three').Texture&{_target: import('three').RenderTarget}} */ (target.texture)
		._target = target;
	/** @type {import('three').MeshBasicMaterial} */ (mesh.material).map = target.texture;
	/** @type {import('three').MeshBasicMaterial} */ (mesh.material).needsUpdate = true;
}

// // ---------------------------------------------------------------------
// //  Modulate Mode Texture Conversion Utilities
// // ---------------------------------------------------------------------
// TODO PATH: src/ModulateTextureConversion.js

/**
 * Takes the texture in `material` and draws it using `materialTextureClass`, using
 * the modulateMode property in `userData`, using the `renderer` and sets it back
 * in the `material`. So it converts a swizzled (using modulateMode) texture to RGBA.
 * NOTE: Does NOT handle mipmaps. But these textures
 * usually do not have mipmaps anyway so it's fine
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {import('three').MeshBasicMaterial} material - The original material of the mesh.
 * @param {Object<string, *>} userData - The original mesh.geometry.userData to get modulateMode/Type from.
 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
 * @returns {import('three').RenderTarget} The RenderTarget of the final RGBA texture.
 * @throws {Error} material.map is null or undefined
 */
function _texDrawRGBATarget(renderer, material, userData, materialTextureClass) {
	const plane = new THREE.PlaneGeometry(2, 2);
	const scene = new THREE.Scene();
	// Create mesh that has color but alpha value of 0.
	const bgClearRGBMesh = new THREE.Mesh(plane,
		new THREE.MeshBasicMaterial({
			color: material.color,
			transparent: true,
			opacity: 0.0,
			blending: THREE.NoBlending
		})
	);
	scene.add(bgClearRGBMesh); // Must be drawn first.

	if (!material.map) {
		throw new Error('_texDrawRGBATarget: material.map is null or undefined');
	}
	/** Shortcut to the existing texture. */
	const tex = material.map;
	// This material is solely for the texture itself and not the shape.
	// It actually does not need color set on it, or modulate type (blending)
	const texMat = new materialTextureClass({
		map: tex,
		modulateMode: userData.modulateMode,
		color: material.color,
		lightEnable: false
	});
	texMat.blending = THREE.NoBlending;
	texMat.transparent = true;
	const textureMesh = new THREE.Mesh(plane, texMat);
	scene.add(textureMesh);

	const target = createAndRenderToTarget(scene,
		getIdentCamera(false), renderer,
		tex.image.width, tex.image.height, {
			wrapS: tex.wrapS, wrapT: tex.wrapT, // Preserve wrap.
			depthBuffer: false, stencilBuffer: false
		});

	/** @type {import('three').Texture&{_target: import('three').RenderTarget}} */ (target.texture)
		._target = target;

	// Dispose previous texture and replace with this one.
	material.map.dispose();
	material.map = target.texture;
	// Set color to default and modulateMode to TEXTURE_DIRECT.
	material.color = new THREE.Color(1, 1, 1);
	userData.modulateMode = 1;

	return target; // Caller is responsible for disposing the RenderTarget.
}

/**
 * Converts a CharModel's textures, including ones that may be using swizzled modulateMode
 * textures that are R/RG format, to RGBA and also applying colors, so that
 * the CharModel can be rendered without a material that supports modulateMode.
 * @param {CharModel} charModel - The CharModel whose textures to convert.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
 * @throws {Error} charModel.meshes is null
 */
function convertModelTexturesToRGBA(charModel, renderer, materialTextureClass) {
	const convertTextureForTypes = [
		FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_NOSELINE, FFLModulateType.SHAPE_GLASS];
	if (!charModel.meshes) {
		throw new Error('convertModelTexturesToRGBA: charModel.meshes is null.');
	}
	charModel.meshes.traverse((mesh) => {
		if (!(mesh instanceof THREE.Mesh) ||
			!mesh.geometry.userData.modulateType ||
			!mesh.material.map ||
			convertTextureForTypes.indexOf(mesh.geometry.userData.modulateType) === -1
		) {
			return;
		}
		const target = _texDrawRGBATarget(renderer, mesh.material,
			mesh.geometry.userData, materialTextureClass);
		// HACK?: Push to _maskTargets so that it will be disposed.
		charModel._maskTargets.push(target);
	});
}

/**
 * Converts all textures in the CharModel that are associated
 * with RenderTargets into THREE.DataTextures, so that the
 * CharModel can be exported using e.g., GLTFExporter.
 * @param {CharModel} charModel - The CharModel whose textures to convert.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @throws {Error} charModel.meshes or mesh.material.map is null, texture is not THREE.RGBAFormat
 */
function convModelTargetsToDataTex(charModel, renderer) {
	if (!charModel.meshes) {
		throw new Error('convModelTargetsToDataTex: charModel.meshes is null.');
	}
	charModel.meshes.traverse((mesh) => {
		if (!(mesh instanceof THREE.Mesh) || !mesh.material.map) {
			return;
		}
		const tex = mesh.material.map;
		if (tex.format !== THREE.RGBAFormat) {
			throw new Error('convModelTargetsToDataTex: found a texture that is not of format THREE.RGBAFormat, but, this function is only meant to be used if all textures in CharModel meshes are RGBA (so render targets)...');
		}
		/** RGBA */
		const data = new Uint8Array(tex.image.width * tex.image.height * 4);
		const target = /** @type {import('three').RenderTarget|null|undefined} */ tex._target;
		if (!target) {
			throw new Error('convModelTargetsToDataTex: mesh.material.map (texture)._target is null or undefined.');
		}
		renderer.readRenderTargetPixels(target, 0, 0,
			tex.image.width, tex.image.height, data);
		// Construct new THREE.DataTexture from the read data.
		// So... draw the texture, download it out, and upload it again.
		const dataTex = new THREE.DataTexture(data, tex.image.width,
			tex.image.height, THREE.RGBAFormat, THREE.UnsignedByteType);
		// Copy wrap and filtering options.
		dataTex.wrapS = tex.wrapS;
		dataTex.wrapT = tex.wrapT;
		dataTex.minFilter = tex.minFilter;
		dataTex.magFilter = tex.magFilter;

		dataTex.needsUpdate = true;
		mesh.material.map = dataTex;
	});
	// The original render targets are no longer needed now, dispose them.
	charModel.disposeTargets();
	// Note that expressions cannot be set on the CharModel anymore.
}

// // ---------------------------------------------------------------------
// //  TextureShaderMaterial Class
// // ---------------------------------------------------------------------
// TODO PATH: src/TextureShaderMaterial.js

/**
 * A material class that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 * @augments {THREE.ShaderMaterial}
 */
class TextureShaderMaterial extends THREE.ShaderMaterial {
	/**
	 * @typedef {Object} TextureShaderMaterialParameters
	 * @property {FFLModulateMode} [modulateMode] - Modulate mode.
	 * @property {FFLModulateType} [modulateType] - Modulate type.
	 * @property {import('three').Color|Array<import('three').Color>} [color] -
	 * Constant color assigned to u_const1/2/3 depending on single or array.
	 */

	/**
	 * The material constructor.
	 * @param {import('three').ShaderMaterialParameters & TextureShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		// Set default uniforms.
		/** @type {Object<string, import('three').IUniform>} */
		const uniforms = {
			opacity: { value: 1.0 }
		};
		const blankMatrix3 = { value: new THREE.Matrix3() };
		if (Number(THREE.REVISION) < 151) {
			uniforms.uvTransform = blankMatrix3;
		} else {
			uniforms.mapTransform = blankMatrix3;
		}

		// Construct the ShaderMaterial using the shader source.
		super({
			vertexShader: /* glsl */`
				#include <common>
				#include <uv_pars_vertex>

				void main() {
					#include <begin_vertex>
					#include <uv_vertex>
					#include <project_vertex>
				}`,
			fragmentShader: /* glsl */`
				#include <common>
				#include <uv_pars_fragment>
				#include <map_pars_fragment>
				uniform vec3 diffuse;
				uniform float opacity;
				uniform int modulateMode;
				uniform vec3 color1;
				uniform vec3 color2;

				void main() {
					vec4 diffuseColor = vec4( diffuse, opacity );

					#include <map_fragment>
					#include <alphamap_fragment>
				#ifdef USE_MAP
					if (modulateMode == 2) { // FFL_MODULATE_MODE_RGB_LAYERED
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r +
				      color1.rgb * sampledDiffuseColor.g +
				      color2.rgb * sampledDiffuseColor.b,
				      sampledDiffuseColor.a
				    );
				  } else if (modulateMode == 3) { // FFL_MODULATE_MODE_ALPHA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r,
				      sampledDiffuseColor.r
				    );
				  } else if (modulateMode == 4) { // FFL_MODULATE_MODE_LUMINANCE_ALPHA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.g,
				      sampledDiffuseColor.r
				    );
				  } else if (modulateMode == 5) { // FFL_MODULATE_MODE_ALPHA_OPA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r,
				      1.0
				    );
				  }
				#endif

				  // avoids little outline around mask elements
				  if (modulateMode != 0 && diffuseColor.a == 0.0) { // FFL_MODULATE_MODE_CONSTANT
				      discard;
				  }

					gl_FragColor = diffuseColor;
					//#include <colorspace_fragment>
				}`,
			uniforms: uniforms
		});
		// Set defaults so that they are valid parameters.
		this.lightEnable = false;
		this.modulateType = 0;

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
	}

	/**
	 * Gets the constant color (diffuse) uniform as THREE.Color.
	 * @returns {import('three').Color|null} The constant color, or null if it is not set.
	 */
	get color() {
		return this.uniforms.diffuse ? this.uniforms.diffuse.value : null;
	}

	/**
	 * Sets the constant color uniforms from THREE.Color.
	 * @param {import('three').Color|Array<import('three').Color>} value -
	 * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
	 */
	set color(value) {
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances.
			this.uniforms.diffuse = { value: value[0] };
			this.uniforms.color1 = { value: value[1] };
			this.uniforms.color2 = { value: value[2] };
			return;
		}
		// Set single color as THREE.Color, defaulting to white.
		const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
		/** @type {import('three').Color} */
		this._color3 = color3;
		this.uniforms.diffuse = { value: color3 };
	}

	/** @returns {FFLModulateMode|null}The modulateMode value, or null if it is unset. */
	get modulateMode() {
		return this.uniforms.modulateMode ? this.uniforms.modulateMode.value : null;
	}

	/** @param {FFLModulateMode} value - The new modulateMode value. */
	set modulateMode(value) {
		this.uniforms.modulateMode = { value: value };
	}

	/** @returns {import('three').Texture|null}The texture map, or null if it is unset. */
	get map() {
		return this.uniforms.map ? this.uniforms.map.value : null;
	}

	/** @param {import('three').Texture} value - The new texture map. */
	set map(value) {
		this.uniforms.map = { value: value };
	}
}

// // ---------------------------------------------------------------------
// //  Geometry Attribute Conversion Utilities
// // ---------------------------------------------------------------------
// TODO PATH: src/GeometryConversion.js

/**
 * Modifies a BufferGeometry in place to be compatible with glTF.
 * It currently: deinterleaves attributes, converts half-float to float,
 * and converts signed integer formats (not uint8 for color) to float.
 * Attributes named "normal" are reduced to three components.
 * @param {import('three').BufferGeometry} geometry - The BufferGeometry to modify in place.
 * @throws {Error} Throws if an unsupported attribute format is encountered.
 */
function convGeometryToGLTFCompatible(geometry) {
	if (!(geometry instanceof THREE.BufferGeometry) || !geometry.attributes) {
		throw new Error('convGeometryToGLTFCompatible: geometry is not BufferGeometry with attributes.');
	}

	// Process each attribute in the geometry.
	for (const [key, attr] of Object.entries(geometry.attributes)) {
		// If the attribute is interleaved, deinterleave it.
		const bufferAttribute = attr instanceof THREE.InterleavedBufferAttribute
			? interleavedBufferAttributeToBufferAttribute(attr)
			: attr;
		const array = bufferAttribute.array;
		const originalItemSize = bufferAttribute.itemSize;
		const count = bufferAttribute.count;

		/**
		 * Size of the target attribute. Force vec3 for "normal".
		 * @type {number}
		 */
		const targetItemSize = key.toLowerCase() === 'normal' ? 3 : originalItemSize;

		/** @type {Float32Array|Uint8Array} */ let newArray;
		/** Whether the value is normalized. False by default for float attributes. */
		let normalized = false;

		if (array instanceof Float32Array) {
			// If already float32, only adjust components if needed.
			newArray = targetItemSize === originalItemSize
				? array
				: copyFloat32WithReducedComponents(array, count, originalItemSize, targetItemSize);
		} else if (array instanceof Uint16Array) {
			// Assume half-float values. Three.js >=160 is required for them.
			const float32Full = convertHalfFloatArrayToFloat32(array);
			newArray = targetItemSize === originalItemSize
				? float32Full
				: copyFloat32WithReducedComponents(float32Full,
					count, originalItemSize, targetItemSize);
		} else if (array instanceof Int8Array) {
			// Convert SNORM to float in the range [-1,1]. For normals, only use first 3 components.
			newArray = convertSNORMToFloat32(array, count, originalItemSize, targetItemSize);
			// normalized = true; // Normals should be normalized?
		} else if (array instanceof Uint8Array) {
			// Likely color data in UNORM, leave as-is.
			newArray = array;
			normalized = true; // Not converted to float.
		} else {
			throw new Error(`convGeometryToGLTFCompatible: Unsupported attribute data type for ${key}: ${array.constructor.name}`);
		}

		// Also not sure if this will leak from the old attribute or not. (Don't think so)
		geometry.setAttribute(key, new THREE.BufferAttribute(newArray, targetItemSize, normalized));
	}
}

/**
 * Deinterleaves an InterleavedBufferAttribute into a standalone BufferAttribute.
 * @param {import('three').InterleavedBufferAttribute} attr - The interleaved attribute.
 * @returns {import('three').BufferAttribute} A new BufferAttribute containing deinterleaved data.
 */
function interleavedBufferAttributeToBufferAttribute(attr) {
	const { itemSize, count } = attr;
	// eslint-disable-next-line jsdoc/valid-types -- TODO fix "syntax error in type"
	const dest = new /** @type {{ new(length: number): * }} */ (attr.array.constructor)
	(count * itemSize);

	for (let i = 0; i < count; i++) {
		for (let j = 0; j < itemSize; j++) {
			dest[i * itemSize + j] = attr.getComponent(i, j);
		}
	}
	return new THREE.BufferAttribute(dest, itemSize);
}

/**
 * Creates a new Float32Array by copying only a subset of components per vertex.
 * @param {Float32Array} src - The source Float32Array.
 * @param {number} count - Number of vertices.
 * @param {number} srcItemSize - Original components per vertex.
 * @param {number} targetItemSize - Number of components to copy per vertex.
 * @returns {Float32Array} A new Float32Array with reduced component count.
 */
function copyFloat32WithReducedComponents(src, count, srcItemSize, targetItemSize) {
	const dst = new Float32Array(count * targetItemSize);
	for (let i = 0; i < count; i++) {
		for (let j = 0; j < targetItemSize; j++) {
			dst[i * targetItemSize + j] = src[i * srcItemSize + j];
		}
	}
	return dst;
}

/**
 * Converts a 16-bit half-float value to a 32-bit float.
 * @param {number} half - The half-float value.
 * @returns {number} The corresponding 32-bit float value.
 */
function halfToFloat(half) {
	const sign = (half & 0x8000) >> 15;
	const exponent = (half & 0x7C00) >> 10;
	const mantissa = half & 0x03FF;

	if (exponent === 0) {
		// Subnormal number.
		return (sign ? -1 : 1) * Math.pow(2, -14) * (mantissa / Math.pow(2, 10));
	} else if (exponent === 0x1F) {
		// NaN or Infinity.
		return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
	}
	// Normalized number.
	return (sign ? -1 : 1) *
		Math.pow(2, exponent - 15) *
		(1 + mantissa / 1024);
}

/**
 * Converts a Uint16Array assumed to represent half-float values into a Float32Array.
 * @param {Uint16Array} halfArray - The Uint16Array of half-float values.
 * @returns {Float32Array} A Float32Array with converted float values.
 */
function convertHalfFloatArrayToFloat32(halfArray) {
	const floatArray = new Float32Array(halfArray.length);
	for (let i = 0; i < halfArray.length; i++) {
		floatArray[i] = halfToFloat(halfArray[i]);
	}
	return floatArray;
}

/**
 * Converts an Int8Array of SNORM values to a Float32Array.
 * If the targetItemSize is less than the original (e.g. for normals), only the first targetItemSize
 * components of each vertex are copied.
 * @param {Int8Array} src - The source Int8Array.
 * @param {number} count - Number of vertices.
 * @param {number} srcItemSize - Original number of components per vertex.
 * @param {number} targetItemSize - Number of components per vertex for the output.
 * @returns {Float32Array} A Float32Array with converted values.
 */
function convertSNORMToFloat32(src, count, srcItemSize, targetItemSize) {
	const dst = new Float32Array(count * targetItemSize);

	for (let i = 0; i < count; i++) {
		const baseIn = i * srcItemSize;
		const baseOut = i * targetItemSize;

		if (targetItemSize === 4 && srcItemSize === 4) {
			// Tangent case: normalize xyz, keep w
			const x = src[baseIn] / 127;
			const y = src[baseIn + 1] / 127;
			const z = src[baseIn + 2] / 127;
			const w = src[baseIn + 3] / 127;

			const mag = Math.sqrt(x * x + y * y + z * z) || 1;

			dst[baseOut] = x / mag;
			dst[baseOut + 1] = y / mag;
			dst[baseOut + 2] = z / mag;
			dst[baseOut + 3] = w;
		} else {
			// General case: convert up to targetItemSize components directly
			for (let j = 0; j < targetItemSize; j++) {
				const val = src[baseIn + j];
				dst[baseOut + j] = val < 0 ? val / 128 : val / 127;
			}
		}
	}

	return dst;
}

// TODO: TODO: Below function is uSELESS because I didn't realize that
// the triangle winding thing had already been taken care of and that's
// the only reason the below function exists so it will promptly be removed next time I push

/**
 * Converts a {@link CharModel}'s geometry to be compatible with glTF (see {@link convGeometryToGLTFCompatible})
 * This function additionally reverses triangle winding for meshes using front culling (flipped hair).
 * @param {CharModel} charModel - The CharModel whose mesh attributes to convert.
 * @throws {Error} charModel.meshes is null
 */
function convModelToGLTFCompatible(charModel) {
	/**
	 * Reverses the triangle winding in the given index array.
	 * It swaps the first and third index of every triangle.
	 * @param {THREE.TypedArray} indices - The index array to modify in place.
	 */
	function _reverseTriangleWinding(indices) {
		for (let i = 0; i < indices.length; i += 3) {
			const temp = indices[i];
			indices[i] = indices[i + 2];
			indices[i + 2] = temp;
		}
	}

	if (!charModel.meshes) {
		throw new Error('convCharModelToGLTFCompatible: charModel.meshes is null.');
	}
	charModel.meshes.traverse((node) => {
		// Ensure this is a mesh with geometry.
		if (!(node instanceof THREE.Mesh) || !(node.geometry instanceof THREE.BufferGeometry)) {
			return;
		}
		// Convert geometry attributes to glTF compliant ones.
		convGeometryToGLTFCompatible(node.geometry);

		// Check if the material side is set to THREE.BackSide (front face culling).
		if (node.material && node.material.side === THREE.BackSide) {
			if (!node.geometry.index) {
				// Early return if there are no indices.
				return;
			}
			_reverseTriangleWinding(node.geometry.index.array); // Reverse triangle winding.
			// Update material and userData to front face culling.
			node.material.side = THREE.FrontSide;
			node.geometry.userData.cullMode = FFLCullMode.BACK;
		}
	});
}

// // ---------------------------------------------------------------------
// //  Scene/Render Target Handling
// // ---------------------------------------------------------------------
// TODO PATH: src/RenderTargetUtils.js

// TODO: private?
// ----- createSceneFromDrawParams(drawParams, bgColor, ...drawParamArgs) -----
/**
 * Creates an THREE.Scene from an array of drawParams, converting each
 * to a new mesh. Used for one-time rendering of faceline/mask 2D planes.
 * @param {Array<FFLDrawParam>} drawParams - Array of FFLDrawParam.
 * @param {import('three').Color|null} bgColor - Optional background color.
 * @param {[MaterialConstructor, Module, TextureManager|null]} drawParamArgs - Arguments to pass to drawParamToMesh.
 * @returns {{scene: import('three').Scene, meshes: Array<import('three').Mesh|null>}}
 * An object containing the created scene and an array of meshes.
 */
function createSceneFromDrawParams(drawParams, bgColor, ...drawParamArgs) {
	const scene = new THREE.Scene();
	// For 2D plane rendering, set the background if provided.
	scene.background = bgColor || null;
	// TODO: use THREE.Group?
	/** @type {Array<import('three').Mesh|null>} */
	const meshes = [];
	drawParams.forEach((param) => {
		const mesh = drawParamToMesh(param, ...drawParamArgs);
		if (mesh) {
			scene.add(mesh);
			meshes.push(mesh);
		}
	});
	return { scene, meshes };
}

// TODO: private?
// -------------------------- getIdentCamera(flipY) --------------------------
/**
 * Returns an ortho camera that is effectively the same as
 * if you used identity MVP matrix, for rendering 2D planes.
 * @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {import('three').OrthographicCamera} The orthographic camera.
 */
function getIdentCamera(flipY = false) {
	// Create an orthographic camera with bounds [-1, 1] in x and y.
	const camera = new THREE.OrthographicCamera(-1, 1,
		// Use [1, -1] except when using flipY.
		(flipY ? -1 : 1), (flipY ? 1 : -1), 0.1, 10);
	camera.position.z = 1;
	return camera;
}

// - createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions) -
/**
 * Creates a Three.js RenderTarget, renders the scene with
 * the given camera, and returns the render target.
 * @param {import('three').Scene} scene - The scene to render.
 * @param {import('three').Camera} camera - The camera to use.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {number} width - Desired width of the target.
 * @param {number} height - Desired height of the target.
 * @param {Object} [targetOptions] - Optional options for the render target.
 * @returns {import('three').RenderTarget} The render target (which contains .texture).
 */
function createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions = {}) {
	// Set default options for the RenderTarget.
	const options = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		...targetOptions
	};

	const renderTarget = /** @type {*} */ (renderer)['isWebGPURenderer'] === undefined
		? new THREE.WebGLRenderTarget(width, height, options)
		: new THREE.RenderTarget(width, height, options);
	// Get previous render target to switch back to.
	const prevTarget = renderer.getRenderTarget();
	// Only works on Three.js r102 and above.
	renderer.setRenderTarget(
		/** @type {import('three').WebGLRenderTarget} */ (renderTarget)); // Set new target.
	renderer.render(scene, camera); // Render.
	renderer.setRenderTarget(prevTarget); // Set previous target.
	return renderTarget; // This needs to be disposed when done.
}

// -------------------------- disposeMeshes(target) --------------------------
/**
 * Disposes meshes in a {@link THREE.Object3D} and removes them from the {@link THREE.Scene} specified.
 * @param {import('three').Scene|import('three').Object3D} group - The scene or group to dispose meshes from.
 * @param {import('three').Scene} [scene] - The scene to remove the meshes from, if provided.
 * @todo TODO: Rename to disposeGroup/Scene or something
 */
function disposeMeshes(group, scene) {
	// Taken from: https://github.com/igvteam/spacewalk/blob/21c0a9da27f121a54e0cf6c0d4a23a9cf80e6623/js/utils/utils.js#L135C10-L135C29

	/**
	 * Disposes a single material along with its texture map.
	 * @param {import('three').MeshBasicMaterial} material - The material with `map` property to dispose.
	 */
	function disposeMaterial(material) {
		// Dispose texture in material.
		if (material.map) {
			// console.debug('Disposing texture ', child.material.map.id);
			// If this was created by TextureManager
			// then it overrides dispose() to also
			// remove itself from the TextureManager map.
			material.map.dispose();
		}
		material.dispose(); // Dispose material itself.
	}

	// Traverse all children of the scene/group/THREE.Object3D.
	group.traverse((child) => {
		if (!(child instanceof THREE.Mesh)) {
			// Only dispose of meshes.
			return;
		}
		// Dispose geometry, material, and texture.
		if (child.geometry) {
			child.geometry.dispose();
		}

		if (child.material) {
			// Dispose depending on if it is an array or not.
			Array.isArray(child.material)
				// Assume that materials are compatible with THREE.MeshBasicMaterial for .map.
				? child.material.forEach((material) => {
					disposeMaterial(/** @type {import('three').MeshBasicMaterial} */ (material));
				})
				: disposeMaterial(/** @type {import('three').MeshBasicMaterial} */(child.material));
		}
	});

	// If this is a scene, remove this group/Object3D from it.
	if (scene && scene instanceof THREE.Scene) {
		scene.remove(group);
	}

	// Set group and its children to null to break references.
	group.children = [];
}

// // ---------------------------------------------------------------------
// //  Export Scene/Texture To Image
// // ---------------------------------------------------------------------
// TODO PATH: src/ExportTexture.js

/**
 * Saves the current renderer state and returns an object to restore it later.
 * @param {import('three').WebGLRenderer} renderer - The renderer to save state from.
 * @returns {{target: import('three').WebGLRenderTarget|null,
 * colorSpace: import('three').ColorSpace, size: import('three').Vector2}}
 * The saved state object.
 */
function _saveRendererState(renderer) {
	const size = new THREE.Vector2();
	renderer.getSize(size);

	return {
		target: renderer.getRenderTarget(),
		colorSpace: /** @type {import('three').ColorSpace} */ (renderer.outputColorSpace),
		size
	};
}

/**
 * Restores a renderer's state from a saved state object.
 * @param {import('three').WebGLRenderer} renderer - The renderer to restore state to.
 * @param {{target: import('three').WebGLRenderTarget|null,
 * colorSpace: import('three').ColorSpace, size: import('three').Vector2}} state -
 * The saved state object.
 */
function _restoreRendererState(renderer, state) {
	renderer.setRenderTarget(state.target);
	renderer.outputColorSpace = state.colorSpace;
	renderer.setSize(state.size.x, state.size.y, false);
}

/**
 * Copies the renderer's swapchain to a canvas.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {HTMLCanvasElement} [canvas] - Optional target canvas. If not provided, a new one is created.
 * @returns {HTMLCanvasElement} The canvas containing the rendered output.
 * @throws {Error} Throws if the canvas is defined but invalid.
 */
function _copyRendererToCanvas(renderer, canvas) {
	const sourceCanvas = renderer.domElement;
	// If the target canvas is not simply undefined, it's null, then error out.
	if (canvas !== undefined && !(canvas instanceof HTMLCanvasElement)) {
		throw new Error('copyRendererToCanvas: canvas is neither a valid canvas nor undefined.');
	}
	const targetCanvas = canvas || document.createElement('canvas');
	targetCanvas.width = sourceCanvas.width;
	targetCanvas.height = sourceCanvas.height;
	// NOTE: Line below guarantees the canvas to be valid.
	/** @type {CanvasRenderingContext2D} */ (targetCanvas.getContext('2d'))
		.drawImage(sourceCanvas, 0, 0);

	return targetCanvas;
}

// --------------- textureToCanvas(texture, renderer, options) ---------------
/**
 * Renders a texture to a canvas. If no canvas is provided, a new one is created.
 * @param {import('three').Texture} texture - The texture to render.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Object} [options] - Options for canvas output.
 * @param {boolean} [options.flipY] - Flip the Y axis. Default is oriented for OpenGL.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas to draw into.
 * Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the rendered texture.
 */
function textureToCanvas(texture, renderer, { flipY = true, canvas } = {}) {
	// Create a new scene using a full-screen quad.
	const scene = new THREE.Scene();
	scene.background = null; // Transparent background.
	// Assign a transparent, textured, and double-sided material.
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide, map: texture, transparent: true
	});
	/** Full-screen quad. */
	const plane = new THREE.PlaneGeometry(2, 2);
	const mesh = new THREE.Mesh(plane, material);
	scene.add(mesh);
	/** Ortho camera filling whole screen. */
	const camera = getIdentCamera(flipY);

	// Get previous render target, color space, and size.
	const state = _saveRendererState(renderer);

	// Render to the main canvas to extract pixels.
	renderer.setRenderTarget(null); // Render to primary target.
	// Get width and set it on renderer.
	const { width, height } = texture.image;
	renderer.setSize(width, height, false);
	// Use working color space.
	renderer.outputColorSpace = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
	renderer.render(scene, camera);

	canvas = _copyRendererToCanvas(renderer, canvas); // Populate canvas.

	// Cleanup and restore renderer state.
	material.dispose();
	plane.dispose();
	scene.remove(mesh);
	_restoreRendererState(renderer, state);

	return canvas; // Either a new canvas or the same one.
}

// // ---------------------------------------------------------------------
// //  CharModel Icon Creation
// // ---------------------------------------------------------------------
// TODO PATH: src/ModelIcon.js

/** @enum {number} */
const ViewType = {
	/** Typical icon body view. */
	Face: 0,
	/** FFLMakeIcon matrix */
	MakeIcon: 1,
	/** Custom view with 45 degree field-of-view. */
	IconFovy45: 2
};

// -------------- getCameraForViewType(viewType, width, height) --------------
/**
 * @param {ViewType} viewType - The {@link ViewType} enum value.
 * @param {number} width - Width of the view.
 * @param {number} height - Height of the view.
 * @returns {import('three').PerspectiveCamera} The camera representing the view type specified.
 * @throws {Error} not implemented (ViewType.Face)
 */
function getCameraForViewType(viewType, width = 1, height = 1) {
	const aspect = width / height;
	switch (viewType) {
		case ViewType.MakeIcon: {
			/** rad2deg(Math.atan2(43.2 / aspect, 500) / 0.5); */
			const fovy = 9.8762;
			const camera = new THREE.PerspectiveCamera(fovy, aspect, 500, 1000);
			camera.position.set(0, 34.5, 600);
			camera.lookAt(0, 34.5, 0.0);
			return camera;
		}
		case ViewType.IconFovy45: {
			const camera = new THREE.PerspectiveCamera(45, aspect, 50, 1000);
			camera.position.set(0, 34, 110);
			camera.lookAt(0, 34, 0);
			return camera;
		}
		default:
			throw new Error('getCameraForViewType: not implemented');
	}
}

// ----------- makeIconFromCharModel(charModel, renderer, options) -----------
/**
 * Creates an icon of the CharModel with the specified view type.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Object} [options] - Optional settings for rendering the icon.
 * @param {ViewType} [options.viewType] - The view type that the camera derives from.
 * @param {number} [options.width] - Desired icon width in pixels.
 * @param {number} [options.height] - Desired icon height in pixels.
 * @param {import('three').Scene} [options.scene] - Optional scene
 * if you want to provide your own (e.g., with background, or models).
 * @param {import('three').Camera} [options.camera] - Optional camera
 * to use instead of the one derived from {@link ViewType}.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas
 * to draw into. Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the icon.
 * @throws {Error} CharModel.meshes is null or undefined, it may have been disposed.
 */
function makeIconFromCharModel(charModel, renderer, options = {}) {
	if (!charModel.meshes) {
		throw new Error('CharModel.meshes is null or undefined, it may have been disposed.');
	}
	// Set locals from options object.
	let {
		viewType = ViewType.MakeIcon,
		width = 256,
		height = 256,
		scene,
		camera,
		canvas
	} = options;

	// Create an offscreen scene for the icon if one is not provided.
	if (!scene) {
		scene = new THREE.Scene();
		scene.background = null; // Transparent background.
	}
	// Add meshes from the CharModel.
	scene.add(charModel.meshes.clone());
	// If the meshes aren't cloned then they disappear from the
	// primary scene, however geometry/material etc are same

	// Get camera based on viewType parameter.
	if (!camera) {
		camera = getCameraForViewType(viewType);
	}

	const state = _saveRendererState(renderer);

	renderer.setRenderTarget(null); // Switch to primary target.
	renderer.setSize(width, height, false);
	renderer.render(scene, camera); // Render scene.

	canvas = _copyRendererToCanvas(renderer, canvas); // Populate canvas.

	_restoreRendererState(renderer, state);
	return canvas;
	// Caller needs to dispose CharModel.
}

// // ---------------------------------------------------------------------
// //  StudioCharInfo Definition, Conversion
// // ---------------------------------------------------------------------
// TODO PATH: src/StudioCharInfo.js

/**
 * @typedef {Object} StudioCharInfo
 * @property {number} beardColor
 * @property {number} beardType
 * @property {number} build
 * @property {number} eyeAspect
 * @property {number} eyeColor
 * @property {number} eyeRotate
 * @property {number} eyeScale
 * @property {number} eyeType
 * @property {number} eyeX
 * @property {number} eyeY
 * @property {number} eyebrowAspect
 * @property {number} eyebrowColor
 * @property {number} eyebrowRotate
 * @property {number} eyebrowScale
 * @property {number} eyebrowType
 * @property {number} eyebrowX
 * @property {number} eyebrowY
 * @property {number} facelineColor
 * @property {number} facelineMake
 * @property {number} facelineType
 * @property {number} facelineWrinkle
 * @property {number} favoriteColor
 * @property {number} gender
 * @property {number} glassColor
 * @property {number} glassScale
 * @property {number} glassType
 * @property {number} glassY
 * @property {number} hairColor
 * @property {number} hairFlip
 * @property {number} hairType
 * @property {number} height
 * @property {number} moleScale
 * @property {number} moleType
 * @property {number} moleX
 * @property {number} moleY
 * @property {number} mouthAspect
 * @property {number} mouthColor
 * @property {number} mouthScale
 * @property {number} mouthType
 * @property {number} mouthY
 * @property {number} mustacheScale
 * @property {number} mustacheType
 * @property {number} mustacheY
 * @property {number} noseScale
 * @property {number} noseType
 * @property {number} noseY
 */

/**
 * Structure representing data from the studio.mii.nintendo.com site and API.
 * @type {import('./struct-fu').StructInstance<StudioCharInfo>}
 */
const StudioCharInfo = _.struct([
	// Fields are named according to nn::mii::CharInfo.
	_.uint8('beardColor'),
	_.uint8('beardType'),
	_.uint8('build'),
	_.uint8('eyeAspect'),
	_.uint8('eyeColor'),
	_.uint8('eyeRotate'),
	_.uint8('eyeScale'),
	_.uint8('eyeType'),
	_.uint8('eyeX'),
	_.uint8('eyeY'),
	_.uint8('eyebrowAspect'),
	_.uint8('eyebrowColor'),
	_.uint8('eyebrowRotate'),
	_.uint8('eyebrowScale'),
	_.uint8('eyebrowType'),
	_.uint8('eyebrowX'),
	_.uint8('eyebrowY'),
	_.uint8('facelineColor'),
	_.uint8('facelineMake'),
	_.uint8('facelineType'),
	_.uint8('facelineWrinkle'),
	_.uint8('favoriteColor'),
	_.uint8('gender'),
	_.uint8('glassColor'),
	_.uint8('glassScale'),
	_.uint8('glassType'),
	_.uint8('glassY'),
	_.uint8('hairColor'),
	_.uint8('hairFlip'),
	_.uint8('hairType'),
	_.uint8('height'),
	_.uint8('moleScale'),
	_.uint8('moleType'),
	_.uint8('moleX'),
	_.uint8('moleY'),
	_.uint8('mouthAspect'),
	_.uint8('mouthColor'),
	_.uint8('mouthScale'),
	_.uint8('mouthType'),
	_.uint8('mouthY'),
	_.uint8('mustacheScale'),
	_.uint8('mustacheType'),
	_.uint8('mustacheY'),
	_.uint8('noseScale'),
	_.uint8('noseType'),
	_.uint8('noseY')
]);

// ----------------- convertStudioCharInfoToFFLiCharInfo(src) -----------------
/**
 * Creates an FFLiCharInfo object from StudioCharInfo.
 * @param {StudioCharInfo} src - The StudioCharInfo instance.
 * @returns {FFLiCharInfo} The FFLiCharInfo output.
 */
function convertStudioCharInfoToFFLiCharInfo(src) {
	return {
		miiVersion: 0,
		faceline: {
			type: src.facelineType,
			color: src.facelineColor,
			texture: src.facelineWrinkle,
			make: src.facelineMake
		},
		hair: {
			type: src.hairType,
			color: commonColorMask(src.hairColor),
			flip: src.hairFlip
		},
		eye: {
			type: src.eyeType,
			color: commonColorMask(src.eyeColor),
			scale: src.eyeScale,
			aspect: src.eyeAspect,
			rotate: src.eyeRotate,
			x: src.eyeX,
			y: src.eyeY
		},
		eyebrow: {
			type: src.eyebrowType,
			color: commonColorMask(src.eyebrowColor),
			scale: src.eyebrowScale,
			aspect: src.eyebrowAspect,
			rotate: src.eyebrowRotate,
			x: src.eyebrowX,
			y: src.eyebrowY
		},
		nose: {
			type: src.noseType,
			scale: src.noseScale,
			y: src.noseY
		},
		mouth: {
			type: src.mouthType,
			color: commonColorMask(src.mouthColor),
			scale: src.mouthScale,
			aspect: src.mouthAspect,
			y: src.mouthY
		},
		beard: {
			mustache: src.mustacheType,
			type: src.beardType,
			color: commonColorMask(src.beardColor),
			scale: src.mustacheScale,
			y: src.mustacheY
		},
		glass: {
			type: src.glassType,
			color: commonColorMask(src.glassColor),
			scale: src.glassScale,
			y: src.glassY
		},
		mole: {
			type: src.moleType,
			scale: src.moleScale,
			x: src.moleX,
			y: src.moleY
		},
		body: {
			height: src.height,
			build: src.build
		},
		personal: {
			name: '',
			creator: '',
			gender: src.gender,
			birthMonth: 0,
			birthDay: 0,
			favoriteColor: src.favoriteColor,
			favorite: 0,
			copyable: 0,
			ngWord: 0,
			localonly: 0,
			regionMove: 0,
			fontRegion: 0,
			roomIndex: 0,
			positionInRoom: 0,
			birthPlatform: 3
		},
		createID: {
			data: new Array(10).fill(0)
		},
		padding_0: 0,
		authorType: 0,
		authorID: new Array(8).fill(0)
	};
}

// --------------------- studioURLObfuscationDecode(data) ---------------------
/**
 * @param {Uint8Array} data - Obfuscated Studio URL data.
 * @returns {Uint8Array} Decoded Uint8Array representing CharInfoStudio.
 */
function studioURLObfuscationDecode(data) {
	const decodedData = new Uint8Array(data);
	const random = decodedData[0];
	let previous = random;

	for (let i = 1; i < 48; i++) {
		const encodedByte = decodedData[i];
		const original = (encodedByte - 7 + 256) % 256;
		decodedData[i - 1] = original ^ previous;
		previous = encodedByte;
	}

	return decodedData.slice(0, StudioCharInfo.size); // Clamp to StudioCharInfo.size
}

// ----------------- convertFFLiCharInfoToStudioCharInfo(src) -----------------
/**
 * Creates a StudioCharInfo object from FFLiCharInfo.
 * @param {FFLiCharInfo} src - The FFLiCharInfo instance.
 * @returns {StudioCharInfo} The StudioCharInfo output.
 * @todo TODO: Currently does NOT convert color indices
 * to CommonColor indices (ToVer3... etc)
 */
function convertFFLiCharInfoToStudioCharInfo(src) {
	return {
		beardColor: commonColorUnmask(src.beard.color),
		beardType: src.beard.type,
		build: src.body.build,
		eyeAspect: src.eye.aspect,
		eyeColor: commonColorUnmask(src.eye.color),
		eyeRotate: src.eye.rotate,
		eyeScale: src.eye.scale,
		eyeType: src.eye.type,
		eyeX: src.eye.x,
		eyeY: src.eye.y,
		eyebrowAspect: src.eyebrow.aspect,
		eyebrowColor: commonColorUnmask(src.eyebrow.color),
		eyebrowRotate: src.eyebrow.rotate,
		eyebrowScale: src.eyebrow.scale,
		eyebrowType: src.eyebrow.type,
		eyebrowX: src.eyebrow.x,
		eyebrowY: src.eyebrow.y,
		facelineColor: src.faceline.color,
		facelineMake: src.faceline.make,
		facelineType: src.faceline.type,
		facelineWrinkle: src.faceline.texture,
		favoriteColor: src.personal.favoriteColor,
		gender: src.personal.gender,
		glassColor: commonColorUnmask(src.glass.color),
		glassScale: src.glass.scale,
		glassType: src.glass.type,
		glassY: src.glass.y,
		hairColor: commonColorUnmask(src.hair.color),
		hairFlip: src.hair.flip,
		hairType: src.hair.type,
		height: src.body.height,
		moleScale: src.mole.scale,
		moleType: src.mole.type,
		moleX: src.mole.x,
		moleY: src.mole.y,
		mouthAspect: src.mouth.aspect,
		mouthColor: commonColorUnmask(src.mouth.color),
		mouthScale: src.mouth.scale,
		mouthType: src.mouth.type,
		mouthY: src.mouth.y,
		mustacheScale: src.beard.scale,
		mustacheType: src.beard.mustache,
		mustacheY: src.beard.y,
		noseScale: src.nose.scale,
		noseType: src.nose.type,
		noseY: src.nose.y
	};
}

// // ---------------------------------------------------------------------
// //  Generic Hex/Base64 Utilities
// // ---------------------------------------------------------------------
// TODO PATH: src/CodecUtilities.js

/**
 * Removes all spaces from a string.
 * @param {string} str - The input string.
 * @returns {string} The string without spaces.
 */
function stripSpaces(str) {
	return str.replace(/\s+/g, '');
}

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param {string} hex - The hexadecimal string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function hexToUint8Array(hex) {
	const match = hex.match(/.{1,2}/g);
	// If match returned null, use an empty array.
	const arr = (match ? match : []).map(function (byte) {
		return parseInt(byte, 16);
	});
	return new Uint8Array(arr);
}

/**
 * Converts a Base64 or Base64-URL encoded string to a Uint8Array.
 * @param {string} base64 - The Base64-encoded string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function base64ToUint8Array(base64) {
	// Replace URL-safe Base64 characters
	const normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
	// Custom function to pad the string with '=' manually
	/**
	 * @param {string} str - The Base64 string to pad.
	 * @returns {string} The padded Base64 string.
	 */
	function padBase64(str) {
		while (str.length % 4 !== 0) {
			str += '=';
		}
		return str;
	}
	// Add padding if necessary.
	const paddedBase64 = padBase64(normalizedBase64);
	const binaryString = atob(paddedBase64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Array<number>} data - The Uint8Array to convert. TODO: check if Uint8Array truly can be used
 * @returns {string} The Base64-encoded string.
 */
function uint8ArrayToBase64(data) {
	return btoa(String.fromCharCode.apply(null, data));
}

/**
 * Parses a string contaning either hex or Base64 representation
 * of bytes into a Uint8Array, stripping spaces.
 * @param {string} text - The input string, which can be either hex or Base64.
 * @returns {Uint8Array} The parsed Uint8Array.
 */
function parseHexOrB64ToUint8Array(text) {
	let inputData;
	// Decode it to a Uint8Array whether it's hex or Base64
	const textData = stripSpaces(text);
	// Check if it's base 16 exclusively, otherwise assume Base64
	if (/^[0-9a-fA-F]+$/.test(textData)) {
		inputData = hexToUint8Array(textData);
	} else {
		inputData = base64ToUint8Array(textData);
	}
	return inputData;
}

// ------------------ ESM exports, uncomment if you use ESM ------------------

export {
	// Generic enums
	FFLModulateMode,
	FFLModulateType,
	FFLExpression,
	FFLModelFlag,
	FFLResourceType,

	// Types for CharModel initialization
	FFLiCharInfo,
	FFLCharModelDesc,
	FFLCharModelDescDefault,
	FFLDataSource,
	FFLCharModelSource,

	// Enums for getRandomCharInfo
	FFLGender,
	FFLAge,
	FFLRace,

	// Begin public methods
	initializeFFL,
	initializeFFLWithResource,
	exitFFL,
	CharModel, // CharModel class
	verifyCharInfo,
	getRandomCharInfo,
	makeExpressionFlag,

	// Pants colors
	PantsColor,
	pantsColors,

	// CharModel creation
	_allocateModelSource,
	createCharModel,
	updateCharModel,
	transferCharModelTex, // TODO
	getIdentCamera,
	createAndRenderToTarget,
	matSupportsFFL,
	initCharModelTextures,
	textureToCanvas,

	// CharModel helpers for exporting models
	TextureShaderMaterial,
	convertModelTexturesToRGBA,
	convModelTargetsToDataTex,
	convGeometryToGLTFCompatible,

	// Icon rendering
	ViewType,
	getCameraForViewType,
	makeIconFromCharModel,
	StudioCharInfo,

	// Export utilities
	convertStudioCharInfoToFFLiCharInfo,
	convertFFLiCharInfoToStudioCharInfo,
	uint8ArrayToBase64,
	parseHexOrB64ToUint8Array,

	// extra
	FFLiShapeType
};
