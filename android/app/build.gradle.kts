plugins {
    id("com.android.application")
}

val webRoot = rootProject.projectDir.parentFile
val generatedWebAssets = layout.buildDirectory.dir("generated/web-assets").get().asFile

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
        versionCode = 1
        versionName = "1.0.0"
    }

    sourceSets["main"].assets.srcDir(generatedWebAssets)

    buildTypes {
        release {
            isMinifyEnabled = false
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
