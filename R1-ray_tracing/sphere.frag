// 単純なレイトレーシングの雛形

struct Ray
{
    vec3 org;
    vec3 dir;
};

struct Hit
{
    float distanceToHitpoint;
    vec3 normal;
    vec3 coord;
};

// 各種パラメータの例
float FilmWidth() { return iResolution.x / 100.0; }
float FilmHeight() { return iResolution.y / 100.0;  }
float FilmDistance() { return 8.0; }

vec3 CameraFrom() { return vec3(5.0, 2.0, 3.0); }
vec3 CameraTo() { return vec3(0.2, 0.7, 0.2); }
vec3 CameraUp() { return vec3(0.0, 1.0, 0.0); }

float LargeFloat() { return 1e+6; }

vec3 LightSource() { return vec3(3.0, 2.0, 3.0); }
float LightFlux() { return 1000.0; }
float ReflectionRate() { return 0.5; }

// 正規直交基底を計算する関数の例
void createOrthoNormalBasis(
    vec3 from, vec3 to, vec3 up,
    out vec3 u, out vec3 v, out vec3 w, out vec3 e
)
{
    // TODO: ベクトル正規化normalize()や外積cross()を用いて実装する。
    w = normalize(from - to);
    u = normalize(cross(up, w));
    v = cross(w, u);
    e = from;
}

vec3 convertToCameraCoordinateSystem(
    vec2 pixelCoordinate
)
{
    // TODO: ピクセル座標をカメラ座標系に変換する。
    float x, y, z;
    x = FilmWidth() * (1.0 - (2.0 * pixelCoordinate[0] + 0.5) / iResolution.x);
    y = FilmHeight() * (1.0 - 2.0 * (pixelCoordinate[1] + 0.5) / iResolution.y);
    z = FilmDistance();
    return vec3(x, y, z);
}

Ray generateCameraRay(
    vec2 pixelCoordinate
)
{
    // TODO: 以下を実装する。
    // 1. ピクセル座標をカメラ座標系に変換
    // 2. カメラパラメータからカメラ座標系の正規直交基底を計算。
    // 3. ピクセル座標を基底を用いてワールド座標系に変換
    // 4. カメラレイを計算。
    float x = convertToCameraCoordinateSystem(pixelCoordinate)[0];
    float y = convertToCameraCoordinateSystem(pixelCoordinate)[1];
    float z = convertToCameraCoordinateSystem(pixelCoordinate)[2];
    vec3 u, v, w, e;
    createOrthoNormalBasis(CameraFrom(), CameraTo(), CameraUp(), u, v, w, e);
    vec3 pixel = x * u + y * v + z * w + e;
    Ray ray;
    ray.org = e;
    ray.dir = normalize(e - pixel);
    return ray;
}

bool intersectToSphere(
    vec3 center, float radius, Ray ray,
    out Hit hit
)
{
    // TODO: レイと球の交差判定を実装する。
    // 二次方程式の解の計算に帰着する。
    float b_, c, d;
    // a = dot(ray.dir, ray.dir); // a = 1
    b_ = dot(ray.dir, ray.org - center);
    c = dot(ray.org - center, ray.org - center) - radius * radius;
    d = b_ * b_ - c;
    if (d >= 0.0) {
        float hit1, hit2;
        hit1 = - b_ + sqrt(d);
        hit2 = - b_ - sqrt(d);
        if (hit2 >= 0.0) {
            hit.distanceToHitpoint = hit2;
            hit.coord = ray.org + hit2 * ray.dir;
            hit.normal = (hit.coord - center) / radius;
            return true;
        } else if (hit1 >= 0.0) {
            hit.distanceToHitpoint = hit1;
            hit.coord = ray.org + hit1 * ray.dir;
            hit.normal = (hit.coord - center) / radius;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

bool intersect(Ray ray, out Hit hit)
{
    hit.distanceToHitpoint = LargeFloat();

    // TODO: intersectToSphere を用いて具体的な球との交差判定を行う。
    vec3 center = vec3(0.0, 0.0, 0.0);
    float radius = 1.0;
    
    intersectToSphere(center, radius, ray, hit);

    return hit.distanceToHitpoint < LargeFloat();
}

float computeIrradiance(Ray ray, Hit hit)
{
    float dist = distance(LightSource(), hit.coord);
    vec3 to_light = normalize(LightSource() - hit.coord);
    return LightFlux() * dot(hit.normal, to_light) / (4.0 * acos(-1.0) * dist * dist);
}

vec3 shade(Ray ray, Hit hit)
{
    // TODO: なんらかのシェーディングを行う。
    float E = computeIrradiance(ray, hit);
    float L = ReflectionRate() * E / acos(-1.0);
    
    return vec3(0.0, 1.0, 1.0) * L;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    Ray ray = generateCameraRay(fragCoord);
     
    Hit hit;
    if (intersect(ray, hit)) {
        fragColor = vec4(shade(ray, hit), 0.0);
    } else {
        fragColor = vec4(1.0, 1.0, 1.0, 0.0);
    }
}
