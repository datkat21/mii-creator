export default /*glsl*/ `
#define VARYING_QUALIFIER in
#define VARYING_INSTANCE In

varying mediump vec2 v_texCoord;
varying mediump vec3 v_normal;
// varying mediump float v_specularMix;

/// ================================================================
/// ピクセルシェーダーの実装
/// ================================================================

// layout( location = 0 ) out vec4 o_Color;

// NOTE: NOT SURE HOW TO SET UNIFORM BLOCKS IN RIO
//layout( std140 ) uniform u_Modulate
//{
    uniform int  modulateType;
    uniform int  gammaType;
    uniform int  drawType;
    uniform int  pad0;
    uniform vec4 u_const1;
    uniform vec4 u_const2;
    uniform vec4 u_const3;
    uniform vec4 lightDirInView;
    uniform vec4 lightColor;
    uniform vec4 u_SssColor;
    uniform vec4 u_SpecularColor;
    uniform vec4 u_RimColor;

    uniform float u_HalfLambertFactor;
    uniform float u_SssSpecularFactor;

    uniform float u_SpecularFactorA;
    uniform float u_SpecularFactorB;
    uniform float u_SpecularShinness;
    uniform float u_RimPower;

    uniform float u_RimWidth;
    uniform bool  lightEnable;
//};


uniform sampler2D s_Tex;

/// 変調モード
#define MODULATE_TYPE_CONSTANT        ( 0 )
#define MODULATE_TYPE_TEXTRUE         ( 1 )
#define MODULATE_TYPE_LAYERED         ( 2 )
#define MODULATE_TYPE_ALPHA           ( 3 )
#define MODULATE_TYPE_ALPHA_OPA       ( 4 )
#define MODULATE_TYPE_GLASS           ( 5 )
#define MODULATE_TYPE_ICONBODY        ( 6 )

#define USE_DEGAMMA(type) (type != 0)

#define DRAW_TYPE_NORMAL   0
#define DRAW_TYPE_FACELINE 1
#define DRAW_TYPE_HAIR     2

vec4 GetAlbedo()
{
    vec4 texel;
    vec4 albedo;

    if(modulateType != MODULATE_TYPE_CONSTANT &&
       modulateType != MODULATE_TYPE_ICONBODY)
    {
        texel = texture(s_Tex,v_texCoord);
    }
    switch(modulateType)
    {
    case MODULATE_TYPE_CONSTANT:
        albedo = vec4(u_const1.rgb,1.0f);
        break;
    case MODULATE_TYPE_TEXTRUE:
        albedo = texel;
        break;
    case MODULATE_TYPE_LAYERED:
        albedo = vec4(u_const1.rgb * texel.r
            + u_const2.rgb * texel.g
            + u_const3.rgb * texel.b
            , texel.a);
        break;
    case MODULATE_TYPE_ALPHA:
        albedo = vec4(u_const1.rgb,texel.r);
        break;
    case MODULATE_TYPE_ALPHA_OPA:
        albedo = vec4(u_const1.rgb * texel.r ,1.0f);
        break;
    case MODULATE_TYPE_GLASS:
        // NOTE: glass background color on switch is R but here it's G
        albedo = vec4(u_const1.rgb * texel.g , pow(texel.r, u_const2.g));
        break;
    case MODULATE_TYPE_ICONBODY:
        albedo = vec4(u_const1.rgb, 1.0f);
        break;
    default:
        albedo = vec4(0.0f);
        break;
    }
    return albedo;
}

vec3 ToLinear(vec3 rgb)
{
    return pow(rgb,vec3(2.2f));
}

vec3 ToSrgb(vec3 rgb)
{
    return pow(rgb,vec3(1.0f/2.2f));
}

vec3 GetRimColor(vec3 color,float normalZ,float width,float power)
{
    return color * pow(width * (1.0f - abs(normalZ)),power);
}

void main()
{
    /// ModulateTypeを考慮してアルベドを取得
    vec4 albedo = GetAlbedo();
    // NOTE: faceline color A channel is 1 here but 0 on switch, needs to be modified
    // NOTE: THE BELOW CODE ALSO TARGETS BEARD!!!!
    /*if(drawType == DRAW_TYPE_FACELINE &&
       modulateType == MODULATE_TYPE_TEXTRUE &&
       albedo.a != 0.0f)
    {
        albedo.a = 0.0f;
    }*/
    if(albedo.a == 0.0f && drawType != DRAW_TYPE_FACELINE)
    {
        discard;
    }
    if(!lightEnable)
    {
        /*o_Color*/gl_FragColor = albedo;
        return;
    }
    
    if(USE_DEGAMMA(gammaType))
    {
        /// SRGB to Linear
        albedo.rgb = ToLinear(albedo.rgb);
    }

    vec3 preNormal = v_normal;

    /// ライティング向け計算
    vec3 normal = normalize(preNormal); ///< ビュー空間法線
    vec3 lightDir = normalize(lightDirInView.xyz); ///< ビュー空間ライト方向
    
    /// diffuseの計算
    float diffuseFactor = max(0.0f,dot(v_normal, lightDir));
    
    /// 拡散値計算
    float halfLambert = ((diffuseFactor) * u_HalfLambertFactor + (1.0f - u_HalfLambertFactor));
    
    /// スペキュラ計算
    vec3 halfDir = normalize(lightDir + vec3(0.0f,0.0f,1.0f));
    float specAngle = max(dot(halfDir,v_normal),0.0f);
    float specular = pow(specAngle,u_SpecularShinness);

    /// 髪型は、スペキュラの係数をParameterのr値でAB補間
    float specularFactor;
    if(drawType != DRAW_TYPE_HAIR)
    {
        specularFactor = u_SpecularFactorA;
    }
    else
    {
        specularFactor = mix(u_SpecularFactorA,u_SpecularFactorB, 0.5f);//,v_specularMix);
    }

    vec4 outputColor = vec4(vec3(0.0f),albedo.a);
    
    vec3 diffuseColor = lightColor.rgb * albedo.rgb * halfLambert;
    vec3 specularColor = specular * specularFactor * lightColor.rgb * u_SpecularColor.rgb;
    vec3 sssColor =  u_SssColor.rgb * (1.0f - halfLambert);
    float sssSpecularFactor = (1.0f - albedo.a * u_SssSpecularFactor);
    //float sssSpecularFactor = 1.0f;
    
    /// FACELINEは、アルファ値を考慮して計算する
    if(drawType == DRAW_TYPE_FACELINE)
    {
        outputColor = vec4(diffuseColor + (specularColor + sssColor) * sssSpecularFactor,1.0f);
    }
    else
    {
        outputColor = vec4(diffuseColor + (specularColor + sssColor),albedo.a);
    }
    
    outputColor.rgb += GetRimColor(u_RimColor.rgb,clamp(v_normal.z,0.0f,1.0f),u_RimWidth,u_RimPower);
    
    if(USE_DEGAMMA(gammaType))
    {
        /// Linear to SRGB
        outputColor.rgb = ToSrgb(outputColor.rgb);
    }

    /*o_Color*/gl_FragColor = outputColor;
}
`;
