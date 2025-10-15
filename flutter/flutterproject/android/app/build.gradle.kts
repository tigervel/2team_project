plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.flutterproject"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.example.flutterproject"
        minSdk = flutter.minSdkVersion
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    implementation(kotlin("stdlib", "1.9.10"))

    // Google Sign-In
    implementation("com.google.android.gms:play-services-auth:20.6.0")

    // Kakao SDK
    implementation("com.kakao.sdk:v2-user:2.12.0")
    implementation("com.kakao.sdk:v2-auth:2.12.0")

    // Naver Login SDK는 flutter_naver_login에서 자동 추가
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://devrepo.kakao.com/nexus/content/groups/public/") }
    }
}