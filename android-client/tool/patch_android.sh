#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:?flutter project root}"
MANIFEST="$ROOT/android/app/src/main/AndroidManifest.xml"
PROPS="$ROOT/android/gradle.properties"
APP_KTS="$ROOT/android/app/build.gradle.kts"
APP_GRD="$ROOT/android/app/build.gradle"

mkdir -p "$ROOT/android/app/keystore"
if [[ -f android-client/keystore/polaris.p12.b64 ]]; then
  base64 -d android-client/keystore/polaris.p12.b64 > "$ROOT/android/app/keystore/polaris.p12"
elif [[ -f android-client/keystore/polaris.p12 ]]; then
  cp android-client/keystore/polaris.p12 "$ROOT/android/app/keystore/polaris.p12"
fi

touch "$PROPS"
grep -q "android.bundle.enableUncompressedNativeLibs" "$PROPS" || echo "android.bundle.enableUncompressedNativeLibs=false" >> "$PROPS"
grep -q "android.ndk.suppressMinSdkVersionError" "$PROPS" || echo "android.ndk.suppressMinSdkVersionError=21" >> "$PROPS"

python3 - <<'PY' "$MANIFEST"
import pathlib, sys, re
p = pathlib.Path(sys.argv[1])
t = p.read_text()
perms = [
    '    <uses-permission android:name="android.permission.INTERNET"/>',
    '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
    '    <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>',
    '    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE"/>',
    '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>',
    '    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>',
]
for perm in perms:
    if perm.split('android:name=')[1] not in t:
        t = t.replace("<application", perm + "\n    <application", 1)
if 'android:usesCleartextTraffic' not in t:
    t = t.replace("<application", '<application android:usesCleartextTraffic="true"', 1)
p.write_text(t)
print("patched", p)
PY

python3 - <<'PY' "$APP_KTS" "$APP_GRD"
import pathlib, sys, re
candidates = [pathlib.Path(x) for x in sys.argv[1:] if pathlib.Path(x).exists()]
if not candidates:
    raise SystemExit("no gradle file")
p = candidates[0]
t = p.read_text()
if p.suffix == ".kts":
    t = re.sub(r"minSdk\s*=\s*\d+", "minSdk = 24", t)
    t = t.replace("minSdk = flutter.minSdkVersion", "minSdk = 24")
    if "signingConfigs" not in t:
        t = t.replace(
            "android {",
            """android {
    signingConfigs {
        create("release") {
            storeFile = file("keystore/polaris.p12")
            storePassword = "polaris12"
            keyAlias = "polaris"
            keyPassword = "polaris12"
        }
    }""",
            1,
        )
    if 'signingConfig = signingConfigs.getByName("debug")' in t:
        t = t.replace(
            'signingConfig = signingConfigs.getByName("debug")',
            'signingConfig = signingConfigs.getByName("release")',
        )
    elif "signingConfig =" not in t.split("release")[1][:400] if "release" in t else True:
        t = t.replace(
            "release {",
            """release {
            signingConfig = signingConfigs.getByName("release")""",
            1,
        )
else:
    t = re.sub(r"minSdk(?:Version)?\s+\d+", "minSdk 24", t)
    t = t.replace("minSdkVersion flutter.minSdkVersion", "minSdkVersion 24")
p.write_text(t)
print("patched", p)
PY
