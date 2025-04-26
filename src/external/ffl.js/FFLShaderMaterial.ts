import * as THREE from "three";

// ─────────────────────────────────────────────────────────
// Vertex Shader for FFLShaderMaterial
// Derived from MiiDefaultShader.vsh found in Miitomo.
// ─────────────────────────────────────────────────────────
const _FFLShader_vert = /* glsl */ `
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

// ─────────────────────────────────────────────────────────
// Fragment Shader for FFLShaderMaterial
// Mostly unmodified from MiiDefaultShader.fsh found in Miitomo.
// ─────────────────────────────────────────────────────────
const _FFLShader_frag = /* glsl */ `
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
//#elif defined(FFL_MODULATE_MODE_TEXTURE_DIRECT)
    else if(u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT)
    {
        color = texture2D(s_texture, v_texCoord);
    }
//#elif defined(FFL_MODULATE_MODE_RGB_LAYERED)
    else if(u_mode == FFL_MODULATE_MODE_RGB_LAYERED)
    {
        color = texture2D(s_texture, v_texCoord);
        color = vec4(color.r * u_const1.rgb + color.g * u_const2.rgb + color.b * u_const3.rgb, color.a);
    }
//#elif defined(FFL_MODULATE_MODE_ALPHA)
    else if(u_mode == FFL_MODULATE_MODE_ALPHA)
    {
        color = texture2D(s_texture, v_texCoord);
        color = vec4(u_const1.rgb, color.r);
    }
//#elif defined(FFL_MODULATE_MODE_LUMINANCE_ALPHA)
    else if(u_mode == FFL_MODULATE_MODE_LUMINANCE_ALPHA)
    {
        color = texture2D(s_texture, v_texCoord);
        color = vec4(color.g * u_const1.rgb, color.r);
    }
//#elif defined(FFL_MODULATE_MODE_ALPHA_OPA)
    else if(u_mode == FFL_MODULATE_MODE_ALPHA_OPA)
    {
        color = texture2D(s_texture, v_texCoord);
        color = vec4(color.r * u_const1.rgb, 1.0);
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

export type FFLMaterial = {
  ambient: THREE.Color;
  diffuse: THREE.Color;
  specular: THREE.Color;
  specularPower: number;
  specularMode: number;
};
export type FFLColor =
  | [/**Red*/ number, /**Green*/ number, /**Blue*/ number, /**Alpha*/ number]
  | [/**Red*/ number, /**Green*/ number, /**Blue*/ number];

export type FFLShaderOptions = {
  // Maps to pre-made materials
  modulateColor: FFLColor;
  modulateMode: number;
  modulateType: number;
  map: THREE.Texture;

  // FFL shader specific
  lightAmbient: THREE.Color;
  lightDiffuse: THREE.Color;
  lightSpecular: THREE.Color;
  lightEnable: boolean;
  lightDirection: THREE.Vector3;

  // Custom shader
  fragmentShader: string;
  vertexShader: string;

  // Culling
  side: THREE.Side;

  // -- Custom parameters added for use with mii creator

  // Override parts of material settings (only required for 'Toon' shader?)
  customMaterial: FFLMaterial;
};

// ─────────────────────────────────────────────────────────────
// FFLShaderMaterial Class
// ─────────────────────────────────────────────────────────────
class FFLShaderMaterial extends THREE.ShaderMaterial {
  // Default light and rim constants:
  static defaultLightAmbient = new THREE.Color(
    0.73,
    0.73,
    0.73
  ) /*.convertSRGBToLinear()*/;
  static defaultLightDiffuse = new THREE.Color(
    0.6,
    0.6,
    0.6
  ) /*.convertSRGBToLinear()*/;
  static defaultLightSpecular = new THREE.Color(
    0.7,
    0.7,
    0.7
  ) /*.convertSRGBToLinear()*/;
  static defaultLightDir = new THREE.Vector3(
    -0.4531539381,
    0.4226179123,
    0.7848858833
  );
  static defaultRimColor = new THREE.Color(
    0.3,
    0.3,
    0.3
  ) /*.convertSRGBToLinear()*/;
  static defaultRimPower = 2.0;

  static defaultLightDirection = this.defaultLightDir;

  // Material table for FFLDefaultShader mapping to FFLModulateType
  // Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
  static materialParams: FFLMaterial[] = [
    {
      // FFL_MODULATE_TYPE_SHAPE_FACELINE
      ambient: new THREE.Color(0.85, 0.75, 0.75) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.75, 0.75, 0.75) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.3, 0.3, 0.3) /*.convertSRGBToLinear()*/,
      specularPower: 1.2,
      specularMode: 0
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_BEARD
      ambient: new THREE.Color(1.0, 1.0, 1.0) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.7, 0.7, 0.7) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.0, 0.0, 0.0) /*.convertSRGBToLinear()*/,
      specularPower: 40.0,
      specularMode: 1
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_NOSE
      ambient: new THREE.Color(0.9, 0.85, 0.85) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.75, 0.75, 0.75) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.22, 0.22, 0.22) /*.convertSRGBToLinear()*/,
      specularPower: 1.5,
      specularMode: 0
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_FOREHEAD
      ambient: new THREE.Color(0.85, 0.75, 0.75) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.75, 0.75, 0.75) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.3, 0.3, 0.3) /*.convertSRGBToLinear()*/,
      specularPower: 1.2,
      specularMode: 0
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_HAIR
      ambient: new THREE.Color(1.0, 1.0, 1.0) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.7, 0.7, 0.7) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.35, 0.35, 0.35) /*.convertSRGBToLinear()*/,
      specularPower: 10.0,
      specularMode: 1
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_CAP
      ambient: new THREE.Color(0.75, 0.75, 0.75) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.72, 0.72, 0.72) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.3, 0.3, 0.3) /*.convertSRGBToLinear()*/,
      specularPower: 1.5,
      specularMode: 0
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_MASK
      ambient: new THREE.Color(1.0, 1.0, 1.0) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.7, 0.7, 0.7) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.0, 0.0, 0.0) /*.convertSRGBToLinear()*/,
      specularPower: 40.0,
      specularMode: 1
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_NOSELINE
      ambient: new THREE.Color(1.0, 1.0, 1.0) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.7, 0.7, 0.7) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.0, 0.0, 0.0) /*.convertSRGBToLinear()*/,
      specularPower: 40.0,
      specularMode: 1
    },
    {
      // FFL_MODULATE_TYPE_SHAPE_GLASS
      ambient: new THREE.Color(1.0, 1.0, 1.0) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(0.7, 0.7, 0.7) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(0.0, 0.0, 0.0) /*.convertSRGBToLinear()*/,
      specularPower: 40.0,
      specularMode: 1
    },

    {
      // body
      ambient: new THREE.Color(
        0.95622,
        0.95622,
        0.95622
      ) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(
        0.49673,
        0.49673,
        0.49673
      ) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(
        0.24099,
        0.24099,
        0.24099
      ) /*.convertSRGBToLinear()*/,
      specularPower: 3.0,
      specularMode: 0
    },
    {
      // pants
      ambient: new THREE.Color(
        0.95622,
        0.95622,
        0.95622
      ) /*.convertSRGBToLinear()*/,
      diffuse: new THREE.Color(
        1.08497,
        1.08497,
        1.08497
      ) /*.convertSRGBToLinear()*/,
      specular: new THREE.Color(
        0.2409,
        0.2409,
        0.2409
      ) /*.convertSRGBToLinear()*/,
      specularPower: 3.0,
      specularMode: 0
    }
  ];

  // Material enum

  static getBlendOptionsFromModulateType(modulateType: number) {
    if (modulateType >= 0 && modulateType <= 5) {
      // Opaque (DrawOpa)
      return {
        blending: THREE.CustomBlending,
        blendSrcAlpha: THREE.SrcAlphaFactor,
        blendDstAlpha: THREE.OneFactor
      };
    } else if (modulateType >= 6 && modulateType <= 8) {
      // Translucent (DrawXlu)
      return {
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendDstAlpha: THREE.OneFactor
      };
    } else if (modulateType >= 9 && modulateType <= 13) {
      // Mask Textures
      return {
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneMinusDstAlphaFactor,
        blendSrcAlpha: THREE.SrcAlphaFactor,
        blendDst: THREE.DstAlphaFactor
      };
    } else if (modulateType >= 14 && modulateType <= 17) {
      // Faceline Texture
      return {
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor
      };
    } else {
      console.error(`Unknown modulate type:`, modulateType);
      return {};
    }
  }

  // Properties exposed by the constructor.
  modulateMode: number;
  modulateType: number;
  modulateColor?: FFLColor;
  lightEnable: boolean;

  /**
   * Options (all are optional):
   *   - modulateMode: number (default 0)
   *   - modulateType: number (default 0; selects a row from materialParams)
   *   - modulateColor: either a THREE.Vector4 OR an array of THREE.Vector4 of length 3.
   *         If an array is provided, they map to u_const1, u_const2, u_const3.
   *   - lightEnable: boolean (default true)
   *   - lightDirection: THREE.Vector3 (default as defined)
   *   - map: (optional) THREE.Texture
   *   - vertexShader/fragmentShader: shader sources (defaults come from HTML IDs below)
   *   - side, transparent, alphaTest: additional material flags
   */
  constructor(options: Partial<FFLShaderOptions> = {}) {
    const modulateMode = options.modulateMode ?? 0;
    const modulateType = options.modulateType ?? 0;
    const lightEnable = options.lightEnable ?? true;
    const lightDir =
      options.lightDirection ?? FFLShaderMaterial.defaultLightDir.clone();
    const texture = options.map || null; // may be null
    const customMaterial = options.customMaterial || null; // may be null

    // Process modulateColor input:
    let colorUniforms = {};
    if (
      Array.isArray(options.modulateColor) &&
      options.modulateColor.length === 3
    ) {
      colorUniforms = {
        u_const1: { value: options.modulateColor[0] },
        u_const2: { value: options.modulateColor[1] },
        u_const3: { value: options.modulateColor[2] }
      };
    } else {
      colorUniforms = {
        u_const1: {
          value: options.modulateColor || new THREE.Vector4(1, 1, 1, 1)
        }
      };
    }

    let matParam =
      FFLShaderMaterial.materialParams[modulateType] ||
      FFLShaderMaterial.materialParams[0];

    // temp solution
    if (customMaterial) {
      matParam = customMaterial;
    }

    const uniforms = Object.assign({}, colorUniforms, {
      u_light_ambient: {
        value: options.lightAmbient || FFLShaderMaterial.defaultLightAmbient
      },
      u_light_diffuse: {
        value: options.lightDiffuse || FFLShaderMaterial.defaultLightDiffuse
      },
      u_light_specular: {
        value: options.lightSpecular || FFLShaderMaterial.defaultLightSpecular
      },
      u_light_dir: { value: lightDir },
      u_light_enable: { value: lightEnable },
      u_material_ambient: { value: matParam.ambient },
      u_material_diffuse: { value: matParam.diffuse },
      u_material_specular: { value: matParam.specular },
      u_material_specular_mode: { value: matParam.specularMode },
      u_material_specular_power: { value: matParam.specularPower },
      u_mode: { value: modulateMode },
      u_rim_color: { value: FFLShaderMaterial.defaultRimColor },
      u_rim_power: { value: FFLShaderMaterial.defaultRimPower },
      s_texture: { value: texture }
    });

    super({
      vertexShader: options.vertexShader || _FFLShader_vert,
      fragmentShader: options.fragmentShader || _FFLShader_frag,
      uniforms: uniforms,
      side: options.side || THREE.FrontSide,
      // skinning: options.skinning || false, // Not needed with newer Three.js.
      // Merge blend options:
      ...(modulateMode !== 0
        ? FFLShaderMaterial.getBlendOptionsFromModulateType(modulateType)
        : {})
    });
    // Expose these properties.
    this.modulateMode = modulateMode;
    this.modulateType = modulateType;
    this.modulateColor = options.modulateColor;
    this.lightEnable = lightEnable;
  }

  get map() {
    return this.uniforms.s_texture.value; // Expose as 'map'
  }
  set map(value) {
    this.uniforms.s_texture.value = value;
  }
  get lightDirection() {
    return this.uniforms.u_light_dir.value;
  }
  set lightDirection(value) {
    this.uniforms.u_light_dir.value = value;
  }
}

export { FFLShaderMaterial }; // Export.
