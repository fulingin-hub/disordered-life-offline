# Android APK

The Android package wraps the complete offline WEB/PWA edition in a local
WebView. Game files, images, English/Japanese translations and save tools are
bundled into the APK and do not require a server.

## Download

Open the repository's **Actions** tab, select **Build Android APK**, then
download the `disordered-life-offline-apk` artifact from the latest successful
run.

## Build locally

Install Java 17, Android SDK platform 35 and Gradle 8.9, then run:

```bash
gradle -p android assembleDebug
```

The installable file is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

The APK uses its own Android WebView storage. Use **Offline Management** to
export a WEB/PWA save and import it into the Android app.
