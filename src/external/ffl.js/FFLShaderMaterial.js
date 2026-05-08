// @ts-check

import { _THREE } from '../../util/PrepareThree';

const THREE = _THREE();

/**
 * @typedef {number} FFLModulateMode
 * @typedef {number} FFLModulateType
 * @typedef {import('three')} THREE
 */

/**
 * @typedef {Object} FFLShaderMaterialParameters
 * @property {FFLModulateMode} [modulateMode] - Modulate mode.
 * @property {FFLModulateType} [modulateType] - Modulate type.
 * @property {import('three').Color|Array<import('three').Color>} [color] -
 * Constant color assigned to u_const1/2/3 depending on single or array.
 * @property {boolean} [lightEnable] - Enable lighting. Needs to be off when drawing faceline/mask textures.
 * @property {import('three').Vector3} [lightDirection] - Light direction.
 * @property {boolean} [useSpecularModeBlinn] - Whether to override
 * specular mode on all materials with 0 (Blinn-Phong specular).
 * @property {import('three').Texture} [map] - Texture map.
 */


/* eslint-enable jsdoc/require-returns-type -- Allow TS to predict return type. */
'use strict';
// // ---------------------------------------------------------------------
// //  Vertex Shader for FFLShaderMaterial
// //  Derived from MiiDefaultShader.vsh found in Miitomo.
// // ---------------------------------------------------------------------
const _FFLShader_vert = /* glsl */`
// 頂点シェーダーに入力される attribute 変数
//attribute vec4 position;       //!< 入力: 位置情報
//attribute vec2 uv;             //!< 入力: テクスチャー座標
//attribute vec3 normal;         //!< 入力: 法線ベクトル
// All provided by three.js ^^

// vertex color is not actually the color of the shape, as such
// it is a custom attribute _COLOR in the glTF

attribute vec4 _color;           //!< 入力: 頂点の色
attribute vec3 tangent;          //!< 入力: 異方位

// フラグメントシェーダーへの入力
varying   vec4 v_color;          //!< 出力: 頂点の色
varying   vec4 v_position;       //!< 出力: 位置情報
varying   vec3 v_normal;         //!< 出力: 法線ベクトル
varying   vec3 v_tangent;        //!< 出力: 異方位
varying   vec2 v_texCoord;       //!< 出力: テクスチャー座標

// ユニフォーム
//uniform mat3 normalMatrix;     //!< ユニフォーム: モデルの法線用行列
//uniform mat4 modelViewMatrix;  //!< ユニフォーム: プロジェクション行列
//uniform mat4 projectionMatrix; //!< ユニフォーム: モデル行列
// All provided by three.js ^^

// skinning_pars_vertex.glsl.js
#ifdef USE_SKINNING
    uniform mat4 bindMatrix;
    uniform mat4 bindMatrixInverse;
    uniform highp sampler2D boneTexture;
    mat4 getBoneMatrix( const in float i ) {
        int size = textureSize( boneTexture, 0 ).x;
        int j = int( i ) * 4;
        int x = j % size;
        int y = j / size;
        vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
        vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
        vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
        vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
        return mat4( v1, v2, v3, v4 );
    }
#endif

void main()
{

    // begin_vertex.glsl.js
    vec3 transformed = vec3( position );
// skinbase_vertex.glsl.js
#ifdef USE_SKINNING
    mat4 boneMatX = getBoneMatrix( skinIndex.x );
    mat4 boneMatY = getBoneMatrix( skinIndex.y );
    mat4 boneMatZ = getBoneMatrix( skinIndex.z );
    mat4 boneMatW = getBoneMatrix( skinIndex.w );
    // skinning_vertex.glsl.js
    vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
    vec4 skinned = vec4( 0.0 );
    skinned += boneMatX * skinVertex * skinWeight.x;
    skinned += boneMatY * skinVertex * skinWeight.y;
    skinned += boneMatZ * skinVertex * skinWeight.z;
    skinned += boneMatW * skinVertex * skinWeight.w;
    transformed = ( bindMatrixInverse * skinned ).xyz;
#endif

//#ifdef FFL_COORDINATE_MODE_NORMAL
    // 頂点座標を変換
    v_position = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position =  projectionMatrix * v_position;

    vec3 objectNormal = normal;
    vec3 objectTangent = tangent.xyz;
// skinnormal_vertex.glsl.js
#ifdef USE_SKINNING
    mat4 skinMatrix = mat4( 0.0 );
    skinMatrix += skinWeight.x * boneMatX;
    skinMatrix += skinWeight.y * boneMatY;
    skinMatrix += skinWeight.z * boneMatZ;
    skinMatrix += skinWeight.w * boneMatW;
    skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

    objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
    objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;

#endif

    // 法線も変換
    //v_normal = mat3(inverse(u_mv)) * a_normal;
    v_normal = normalize(normalMatrix * objectNormal);
//#elif defined(FFL_COORDINATE_MODE_NONE)
//    // 頂点座標を変換
//    gl_Position = vec4(a_position.x, a_position.y * -1.0, a_position.z, a_position.w);
//    v_position = a_position;
//
//    v_normal = a_normal;
//#endif

     // その他の情報も書き出す
    v_texCoord = uv;
    // safe normalize
    if (tangent != vec3(0.0, 0.0, 0.0))
    {
        v_tangent = normalize(normalMatrix * objectTangent);
    }
    else
    {
        v_tangent = vec3(0.0, 0.0, 0.0);
    }

    v_color = _color;
}
`;

// // ---------------------------------------------------------------------
// //  Fragment Shader for FFLShaderMaterial
// //  Mostly unmodified from MiiDefaultShader.fsh found in Miitomo.
// // ---------------------------------------------------------------------
const _FFLShader_frag = /* glsl */`
//
//  sample.flg
//  Fragment shader
//  Copyright (c) 2014 Nintendo Co., Ltd. All rights reserved.
//
//

#ifdef GL_ES
precision mediump float;
#else
#   define lowp
#   define mediump
#   define highp
#endif


//
//  定数定義ファイル
//

/// シェーダーモード
#define FFL_SHADER_MODE_UR 0
#define FFL_SHADER_MODE_UB 1

/// 変調処理のマクロ
#define FFL_MODULATE_MODE_CONSTANT        0
#define FFL_MODULATE_MODE_TEXTURE_DIRECT  1
#define FFL_MODULATE_MODE_RGB_LAYERED     2
#define FFL_MODULATE_MODE_ALPHA           3
#define FFL_MODULATE_MODE_LUMINANCE_ALPHA 4
#define FFL_MODULATE_MODE_ALPHA_OPA       5

/// スペキュラのモード
#define FFL_SPECULAR_MODE_BLINN 0
#define FFL_SPECULAR_MODE_ANISO 1

/// ライトのON/OFF
#define FFL_LIGHT_MODE_DISABLE 0
#define FFL_LIGHT_MODE_ENABLE 1

/// フラグメントのディスカードモード
#define FFL_DISCARD_FRAGMENT_DISABLE 0
#define FFL_DISCARD_FRAGMENT_ENABLE  1

/// 座標変換モード
#define FFL_COORDINATE_MODE_NONE   0
#define FFL_COORDINATE_MODE_NORMAL 1

//
//  関数の定義ファイル
//

/**
 * @brief 異方性反射の反射率を計算します。
 * @param[in] light   ライトの向き
 * @param[in] tangent 接線
 * @param[in] eye     視線の向き
 * @param[in] power   鋭さ
 */
mediump float calculateAnisotropicSpecular(mediump vec3 light, mediump vec3 tangent, mediump vec3 eye, mediump float power )
{
	mediump float dotLT = dot(light, tangent);
	mediump float dotVT = dot(eye, tangent);
	mediump float dotLN = sqrt(1.0 - dotLT * dotLT);
	mediump float dotVR = dotLN*sqrt(1.0 - dotVT * dotVT) - dotLT * dotVT;

	return pow(max(0.0, dotVR), power);
}

/**
 * @brief 異方性反射の反射率を計算します。
 * @param[in] light   ライトの向き
 * @param[in] normal  法線
 * @param[in] eye     視線の向き
 * @param[in] power   鋭さ
 */
mediump float calculateBlinnSpecular(mediump vec3 light, mediump vec3 normal, mediump vec3 eye, mediump float power)
{
	return pow(max(dot(reflect(-light, normal), eye), 0.0), power);
}

/**
 * @brief 異方性反射、ブリン反射をブレンドします。
 * @param[in] blend ブレンド率
 * @param[in] blinn ブリンの値
 * @param[in] aniso 異方性の値
 */
mediump float calculateSpecularBlend(mediump float blend, mediump float blinn, mediump float aniso)
{
	return mix(aniso, blinn, blend);
}

/**
 * @brief アンビエントを計算します。
 * @param[in] light    ライト
 * @param[in] material マテリアル
 */
mediump vec3 calculateAmbientColor(mediump vec3 light, mediump vec3 material)
{
	return light * material;
}

/**
 * @brief 拡散を計算します。
 * @param[in] light    ライト
 * @param[in] material マテリアル
 * @param[in] ln       ライトと法線の内積
 */
mediump vec3 calculateDiffuseColor(mediump vec3 light, mediump vec3 material, mediump float ln)
{
	return light * material * ln;
}

/**
 * @brief 鏡面反射を計算します。
 * @param[in] light      ライト
 * @param[in] material   マテリアル
 * @param[in] reflection 反射率
 * @param[in] strength   幅
 */
mediump vec3 calculateSpecularColor(mediump vec3 light, mediump vec3 material, mediump float reflection, mediump float strength)
{
	return light * material * reflection * strength;
}

/**
 * @brief リムを計算します。
 * @param[in] color   リム色
 * @param[in] normalZ 法線のZ方向
 * @param[in] width   リム幅
 * @param[in] power   リムの鋭さ
 */
mediump vec3 calculateRimColor(mediump vec3 color, mediump float normalZ, mediump float width, mediump float power)
{
	return color * pow(width * (1.0 - abs(normalZ)), power);
}

/**
 * @brief ライト方向と法線の内積を求める
 * @note 特殊な実装になっています。
 */
mediump float calculateDot(mediump vec3 light, mediump vec3 normal)
{
	return max(dot(light, normal), 0.1);
}

// フラグメントシェーダーに入力される varying 変数
varying mediump vec4 v_color;          //!< 出力: 頂点の色
varying highp   vec4 v_position;       //!< 出力: 位置情報
varying highp   vec3 v_normal;         //!< 出力: 法線ベクトル
// NOTE: ^^ Those two need to be highp to avoid weird black dot issue on Android
varying mediump vec3 v_tangent;        //!< 出力: 異方位
varying mediump vec2 v_texCoord;       //!< 出力: テクスチャー座標

/// constカラー
uniform mediump vec4  u_const1; ///< constカラー1
uniform mediump vec4  u_const2; ///< constカラー2
uniform mediump vec4  u_const3; ///< constカラー3

/// ライト設定
uniform mediump vec3 u_light_ambient;  ///< カメラ空間のライト方向
uniform mediump vec3 u_light_diffuse;  ///< 拡散光用ライト
uniform mediump vec3 u_light_dir;
uniform bool u_light_enable;
uniform mediump vec3 u_light_specular; ///< 鏡面反射用ライト強度

/// マテリアル設定
uniform mediump vec3 u_material_ambient;         ///< 環境光用マテリアル設定
uniform mediump vec3 u_material_diffuse;         ///< 拡散光用マテリアル設定
uniform mediump vec3 u_material_specular;        ///< 鏡面反射用マテリアル設定
uniform int u_material_specular_mode;            ///< スペキュラの反射モード(CharModelに依存する設定のためub_modulateにしている)
uniform mediump float u_material_specular_power; ///< スペキュラの鋭さ(0.0を指定すると頂点カラーの設定が利用される)

/// 変調設定
uniform int u_mode;   ///< 描画モード

/// リム設定
uniform mediump vec3  u_rim_color;
uniform mediump float u_rim_power;

// サンプラー
uniform sampler2D s_texture;


// -------------------------------------------------------
// メイン文
void main()
{
    mediump vec4 color;

    mediump float specularPower    = u_material_specular_power;
    mediump float rimWidth         = v_color.a;

//#ifdef FFL_MODULATE_MODE_CONSTANT
    if(u_mode == FFL_MODULATE_MODE_CONSTANT)
    {
      color = u_const1;
    }
    // modified to handle u_const1 alpha:
//#elif defined(FFL_MODULATE_MODE_TEXTURE_DIRECT)
    else if(u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.rgb, u_const1.a * texel.a);
    }
//#elif defined(FFL_MODULATE_MODE_RGB_LAYERED)
    else if(u_mode == FFL_MODULATE_MODE_RGB_LAYERED)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.r * u_const1.rgb + texel.g * u_const2.rgb + texel.b * u_const3.rgb, u_const1.a * texel.a);
    }
//#elif defined(FFL_MODULATE_MODE_ALPHA)
    else if(u_mode == FFL_MODULATE_MODE_ALPHA)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(u_const1.rgb, u_const1.a * texel.r);
    }
//#elif defined(FFL_MODULATE_MODE_LUMINANCE_ALPHA)
    else if(u_mode == FFL_MODULATE_MODE_LUMINANCE_ALPHA)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.g * u_const1.rgb, u_const1.a * texel.r);
    }
//#elif defined(FFL_MODULATE_MODE_ALPHA_OPA)
    else if(u_mode == FFL_MODULATE_MODE_ALPHA_OPA)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.r * u_const1.rgb, u_const1.a);
    }
//#endif

    // avoids little outline around mask elements
    if(u_mode != FFL_MODULATE_MODE_CONSTANT && color.a == 0.0)
    {
        discard;
    }

//#ifdef FFL_LIGHT_MODE_ENABLE
    if(u_light_enable)
    {
        /// 環境光の計算
        mediump vec3 ambient = calculateAmbientColor(u_light_ambient.xyz, u_material_ambient.xyz);

        /// 法線ベクトルの正規化
        mediump vec3 norm = normalize(v_normal);

        /// 視線ベクトル
        mediump vec3 eye = normalize(-v_position.xyz);

        // ライトの向き
        mediump float fDot = calculateDot(u_light_dir, norm);

        /// Diffuse計算
        mediump vec3 diffuse = calculateDiffuseColor(u_light_diffuse.xyz, u_material_diffuse.xyz, fDot);

        /// Specular計算
        mediump float specularBlinn = calculateBlinnSpecular(u_light_dir, norm, eye, u_material_specular_power);

        /// Specularの値を確保する変数を宣言
        mediump float reflection;
        mediump float strength = v_color.g;
        if(u_material_specular_mode == 0)
        {
            /// Blinnモデルの場合
            strength = 1.0;
            reflection = specularBlinn;
        }
        else
        {
            /// Aisoモデルの場合
            mediump float specularAniso = calculateAnisotropicSpecular(u_light_dir, v_tangent, eye, u_material_specular_power);
            reflection = calculateSpecularBlend(v_color.r, specularBlinn, specularAniso);
        }
        /// Specularの色を取得
        mediump vec3 specular = calculateSpecularColor(u_light_specular.xyz, u_material_specular.xyz, reflection, strength);

        // リムの色を計算
        mediump vec3 rimColor = calculateRimColor(u_rim_color.rgb, norm.z, rimWidth, u_rim_power);

        // カラーの計算
        color.rgb = (ambient + diffuse) * color.rgb + specular + rimColor;
    }
//#endif

    gl_FragColor = color;
}
`;
// #include <tonemapping_fragment>
// #include <${THREE.REVISION >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>

// // ---------------------------------------------------------------------
// //  FFLShaderMaterial Class
// // ---------------------------------------------------------------------
/**
 * Custom THREE.ShaderMaterial using the FFLShader.
 * @augments {THREE.ShaderMaterial}
 */
class FFLShaderMaterial extends THREE.ShaderMaterial {
	// Default light and rim light uniforms.

	/**
	 * Default ambient light color.
	 * @type {import('three').Color}
	 */
	static defaultLightAmbient = new THREE.Color(0.73, 0.73, 0.73)/* .convertSRGBToLinear() */;
	/**
	 * Default diffuse light color.
	 * @type {import('three').Color}
	 */
	static defaultLightDiffuse = new THREE.Color(0.6, 0.6, 0.6)/* .convertSRGBToLinear() */;
	/**
	 * Default specular light color.
	 * @type {import('three').Color}
	 */
	static defaultLightSpecular = new THREE.Color(0.7, 0.7, 0.7)/* .convertSRGBToLinear() */;
	/**
	 * Default light direction.
	 * @type {import('three').Vector3}
	 */
	static defaultLightDir = new THREE.Vector3(-0.4531539381, 0.4226179123, 0.7848858833);
	/**
	 * Default rim color.
	 * @type {import('three').Color}
	 */
	static defaultRimColor = new THREE.Color(0.3, 0.3, 0.3)/* .convertSRGBToLinear() */;
	/**
	 * Default rim power (intensity).
	 * @type {number}
	 */
	static defaultRimPower = 2.0;

	/**
	 * Alias for default light direction.
	 * @type {import('three').Vector3}
	 */
	static defaultLightDirection = this.defaultLightDir;

	/**
	 * Material uniform table mapping to FFLModulateType.
	 * Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
	 * @package
	 */
	static materialParams = [
		{
			// FFL_MODULATE_TYPE_SHAPE_FACELINE
			ambient: new THREE.Color(0.85, 0.75, 0.75)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.75, 0.75, 0.75)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.3, 0.3, 0.3)/* .convertSRGBToLinear() */,
			specularPower: 1.2,
			specularMode: 0
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_BEARD
			ambient: new THREE.Color(1.0, 1.0, 1.0)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.7, 0.7, 0.7)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.0, 0.0, 0.0)/* .convertSRGBToLinear() */,
			specularPower: 40.0,
			specularMode: 1
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_NOSE
			ambient: new THREE.Color(0.9, 0.85, 0.85)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.75, 0.75, 0.75)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.22, 0.22, 0.22)/* .convertSRGBToLinear() */,
			specularPower: 1.5,
			specularMode: 0
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_FOREHEAD
			ambient: new THREE.Color(0.85, 0.75, 0.75)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.75, 0.75, 0.75)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.3, 0.3, 0.3)/* .convertSRGBToLinear() */,
			specularPower: 1.2,
			specularMode: 0
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_HAIR
			ambient: new THREE.Color(1.0, 1.0, 1.0)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.7, 0.7, 0.7)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.35, 0.35, 0.35)/* .convertSRGBToLinear() */,
			specularPower: 10.0,
			specularMode: 1
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_CAP
			ambient: new THREE.Color(0.75, 0.75, 0.75)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.72, 0.72, 0.72)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.3, 0.3, 0.3)/* .convertSRGBToLinear() */,
			specularPower: 1.5,
			specularMode: 0
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_MASK
			ambient: new THREE.Color(1.0, 1.0, 1.0)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.7, 0.7, 0.7)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.0, 0.0, 0.0)/* .convertSRGBToLinear() */,
			specularPower: 40.0,
			specularMode: 1
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_NOSELINE
			ambient: new THREE.Color(1.0, 1.0, 1.0)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.7, 0.7, 0.7)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.0, 0.0, 0.0)/* .convertSRGBToLinear() */,
			specularPower: 40.0,
			specularMode: 1
		},
		{
			// FFL_MODULATE_TYPE_SHAPE_GLASS
			ambient: new THREE.Color(1.0, 1.0, 1.0)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.7, 0.7, 0.7)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.0, 0.0, 0.0)/* .convertSRGBToLinear() */,
			specularPower: 40.0,
			specularMode: 1
		},

		{
			// body
			ambient: new THREE.Color(0.95622, 0.95622, 0.95622)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(0.49673, 0.49673, 0.49673)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.24099, 0.24099, 0.24099)/* .convertSRGBToLinear() */,
			specularPower: 3.0,
			specularMode: 0
		},
		{
			// pants
			ambient: new THREE.Color(0.95622, 0.95622, 0.95622)/* .convertSRGBToLinear() */,
			diffuse: new THREE.Color(1.08497, 1.08497, 1.08497)/* .convertSRGBToLinear() */,
			specular: new THREE.Color(0.2409, 0.2409, 0.2409)/* .convertSRGBToLinear() */,
			specularPower: 3.0,
			specularMode: 0
		}
	];

	/** @typedef {import('three').IUniform<import('three').Vector4>} IUniformVector4 */

	/**
	 * Constructs an FFLShaderMaterial instance.
	 * @param {import('three').ShaderMaterialParameters & FFLShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		// Set default uniforms.
		/** @type {Object<string, import('three').IUniform>} */
		const uniforms = {
			u_light_ambient: {
				value: FFLShaderMaterial.defaultLightAmbient
			},
			u_light_diffuse: {
				value: FFLShaderMaterial.defaultLightDiffuse
			},
			u_light_specular: {
				value: FFLShaderMaterial.defaultLightSpecular
			},
			u_light_dir: { value: FFLShaderMaterial.defaultLightDir.clone() },
			u_light_enable: { value: true }, // Default to true.
			u_rim_color: { value: FFLShaderMaterial.defaultRimColor },
			u_rim_power: { value: FFLShaderMaterial.defaultRimPower }
		};

		// Construct the ShaderMaterial using the shader source.
		super({
			vertexShader: _FFLShader_vert,
			fragmentShader: _FFLShader_frag,
			uniforms: uniforms
		});

		// Initialize default values.
		/** @type {FFLModulateType} */
		this._modulateType = 0;
		this.useSpecularModeBlinn = false;

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
	}

	/**
	 * Gets the constant color (u_const1) uniform as THREE.Color.
	 * @returns {import('three').Color|null} The constant color, or null if it is not set.
	 */
	get color() {
		if (!this.uniforms.u_const1) {
			// If color is not set, return null.
			return null;
		} else if (this._color3) {
			// Use cached THREE.Color instance if it is set.
			return this._color3;
		}
		// Get THREE.Color from u_const1 (Vector4).
		const color4 = /** @type {IUniformVector4} */ (this.uniforms.u_const1).value;
		const color3 = new THREE.Color(color4.x, color4.y, color4.z);
		this._color3 = color3; // Cache the THREE.Color instance.
		return color3;
	}

	/**
	 * Sets the constant color uniforms from THREE.Color.
	 * @param {import('three').Color|Array<import('three').Color>} value - The
	 * constant color (u_const1), or multiple (u_const1/2/3) to set the uniforms for.
	 */
	set color(value) {
		/**
		 * @param {import('three').Color} color - THREE.Color instance.
		 * @param {number} opacity - Opacity mapped to .a.
		 * @returns {import('three').Vector4} Vector4 containing color and opacity.
		 */
		function toColor4(color, opacity = 1.0) {
			return new THREE.Vector4(color.r, color.g, color.b, opacity);
		}
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances to u_const1/2/3.
			/** @type {IUniformVector4} */ (this.uniforms.u_const1) =
				{ value: toColor4(value[0]) };
			/** @type {IUniformVector4} */ (this.uniforms.u_const2) =
				{ value: toColor4(value[1]) };
			/** @type {IUniformVector4} */ (this.uniforms.u_const3) =
				{ value: toColor4(value[2]) };
			return;
		}
		// Set single color as THREE.Color, defaulting to white.
		const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
		/** @type {import('three').Color} */
		this._color3 = color3;
		// Assign single color with white as a placeholder.
		const opacity = this.opacity;
		if (this._opacity) {
			// if _opacity is set then the above returned it, delete when done
			delete this._opacity;
		}
		/** @type {IUniformVector4} */ (this.uniforms.u_const1) =
			{ value: toColor4(color3, opacity) };
	}

	/**
	 * Gets the opacity of the constant color.
	 * @returns {number} The opacity value.
	 */
	// @ts-ignore - Already defined on parent class.
	get opacity() {
		if (!this.uniforms.u_const1) {
			// Get from _opacity if it is set before constant color.
			return this._opacity ? this._opacity : 1;
		}
		// Return w (alpha) of the constant color uniform.
		return /** @type {IUniformVector4} */ (this.uniforms.u_const1).value.w;
	}

	/**
	 * Sets the opacity of the constant color.
	 * NOTE: that this is actually set in the constructor
	 * of Material, meaning it is the only one set BEFORE uniforms are
	 * @param {number} value - The new opacity value.
	 */
	// @ts-ignore - Already defined on parent class.
	set opacity(value) {
		if (!this.uniforms || !this.uniforms.u_const1) {
			// Store here for later when color is set.
			this._opacity = 1;
			return;
		}
		/** @type {IUniformVector4} */ (this.uniforms.u_const1).value.w = value;
	}

	/**
	 * Gets the value of the modulateMode uniform.
	 * @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
	 */
	get modulateMode() {
		return this.uniforms.u_mode ? this.uniforms.u_mode.value : null;
	}

	/**
	 * Sets the value of the modulateMode uniform.
	 * @param {FFLModulateMode} value - The new modulateMode value.
	 */
	set modulateMode(value) {
		this.uniforms.u_mode = { value: value };
	}

	/**
	 * Sets the value determining whether lighting is enabled or not.
	 * @returns {boolean|null} The lightEnable value, or null if it is unset.
	 */
	get lightEnable() {
		return this.uniforms.u_light_enable ? this.uniforms.u_light_enable.value : null;
	}

	/**
	 * Sets the value determining whether lighting is enabled or not.
	 * @param {boolean} value - The lightEnable value.
	 */
	set lightEnable(value) {
		this.uniforms.u_light_enable = { value: value };
	}

	/**
	 * Sets whether to override specular mode with 0.
	 * @param {boolean} value - The useSpecularModeBlinn value.
	 */
	set useSpecularModeBlinn(value) {
		this._useSpecularModeBlinn = value; // Private property.
		if (this._modulateType !== undefined) {
			// Set material again if it was already set.
			this.modulateType = this._modulateType;
		}
	}

	/**
	 * Gets the value for whether to override specular mode with 0.
	 * @returns {boolean|undefined} The useSpecularModeBlinn value.
	 */
	get useSpecularModeBlinn() {
		return this._useSpecularModeBlinn;
	}

	/**
	 * Gets the modulateType value.
	 * @returns {FFLModulateType|undefined} The modulateType value if it is set.
	 */
	get modulateType() {
		// This isn't actually a uniform so this is a private property.
		return this._modulateType;
	}

	/**
	 * Sets the material uniforms based on the modulate type value.
	 * @param {FFLModulateType} value - The new modulateType value.
	 */
	set modulateType(value) {
		// Get material uniforms for modulate type from materialParams table.
		const matParam = FFLShaderMaterial.materialParams[value];
		if (!matParam) {
			// Out of bounds modulateType that don't have materials
			// are usually for mask/faceline textures, so don't throw error
			return;
		}
		this._modulateType = value;

		// Set material uniforms from matParam object.
		this.uniforms.u_material_ambient = { value: matParam.ambient };
		this.uniforms.u_material_diffuse = { value: matParam.diffuse };
		this.uniforms.u_material_specular = { value: matParam.specular };
		this.uniforms.u_material_specular_mode = {
			// Force value of 0 if useSpecularModeBlinn is set.
			value: this._useSpecularModeBlinn ? 0 : matParam.specularMode
		};
		this.uniforms.u_material_specular_power = { value: matParam.specularPower };
	}

	/**
	 * Gets the texture map if it is set.
	 * @returns {import('three').Texture|null} The texture map, or null if it is unset.
	 */
	get map() {
		return this.uniforms.s_texture ? this.uniforms.s_texture.value : null;
	}

	/**
	 * Sets the texture map (s_texture uniform).
	 * @param {import('three').Texture} value - The new texture map.
	 */
	set map(value) {
		this.uniforms.s_texture = { value: value };
	}

	/**
	 * Gets the light direction.
	 * @returns {import('three').Vector3} The light direction.
	 */
	get lightDirection() {
		// Should always be set as long as this is constructed.
		return this.uniforms.u_light_dir.value;
	}

	/**
	 * Sets the light direction.
	 * @param {import('three').Vector3} value - The new light direction.
	 */
	set lightDirection(value) {
		this.uniforms.u_light_dir = { value: value };
	}
}

/** @global */
// window.FFLShaderMaterial = FFLShaderMaterial;
// export { FFLShaderMaterial };

export default FFLShaderMaterial;
