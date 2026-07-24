plugins {
    id("com.android.application")
}

val webRoot = rootProject.projectDir.parentFile
val generatedWebAssets = layout.buildDirectory.dir("generated/web-assets").get().asFile
val releaseVersionCode = 14
val releaseVersionName = "1.0.14"
val keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
val keystorePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
val keyAliasValue = System.getenv("ANDROID_KEY_ALIAS")
val keyPasswordValue = System.getenv("ANDROID_KEY_PASSWORD")
val releaseSigningReady = listOf(
    keystorePath,
    keystorePassword,
    keyAliasValue,
    keyPasswordValue,
).all { !it.isNullOrBlank() }

val syncWebAssets by tasks.registering(Copy::class) {
    from(webRoot) {
        exclude(
            ".git/**",
            ".github/**",
            "android/**",
            "*.apk",
            "*.aab",
            "*.zip",
            "DEPLOYMENT.md",
            "README.txt",
            "_headers",
            "_redirects",
            "netlify.toml",
            "vercel.json",
        )
    }
    into(generatedWebAssets.resolve("www"))
}

android {
    namespace = "com.fulinginhub.disorderedlife"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fulinginhub.disorderedlife"
        minSdk = 24
        targetSdk = 35
        versionCode = releaseVersionCode
        versionName = releaseVersionName
    }

    sourceSets["main"].assets.srcDir(generatedWebAssets)

    signingConfigs {
        if (releaseSigningReady) {
            create("release") {
                storeFile = file(keystorePath!!)
                storePassword = keystorePassword!!
                keyAlias = keyAliasValue!!
                keyPassword = keyPasswordValue!!
                storeType = "PKCS12"
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.findByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
