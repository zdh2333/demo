# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

This is `httpclientutil` — a Java utility library wrapping Apache HttpClient 4.5.5 into a Spring Boot 1.5.8 demo application. The project root is `/workspace/httpclientutil-master/`.

### Prerequisites

- **JDK 8** (`java.version=1.8` in `pom.xml`). Must set `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64` and switch `update-alternatives` to Java 8.
- **Maven 3.x** (system package `maven`).

### Build

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
cd /workspace/httpclientutil-master
mvn clean install
```

### Running the Application

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
cd /workspace/httpclientutil-master
mvn spring-boot:run
```

The app starts an embedded Tomcat on **port 8080** with endpoints under `/hello/*`.

### Running Tests

Tests are **skipped by default** in `pom.xml` (`<skipTests>true</skipTests>` in surefire config). This is a hard-coded plugin configuration, not a property — it **cannot** be overridden via `-DskipTests=false`.

To run the integration tests, the Spring Boot app **must be running** on port 8080 first (they are not mocked). Then run tests directly via JUnit:

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
cd /workspace/httpclientutil-master
mvn dependency:build-classpath -Dmdep.outputFile=/tmp/cp.txt -q
CP=$(cat /tmp/cp.txt)
java -cp "target/classes:target/test-classes:$CP" org.junit.runner.JUnitCore com.jourwon.httpclient.test.HttpClientUtilsTest
```

### Gotchas

- The `jacob` dependency (Windows COM bridge for TTS) and `TtsMain` / Baidu TTS classes are non-functional on Linux — ignore them.
- `testPost()` sends custom headers including `Accept-Encoding`; the controller `@RequestHeader("Accept-Encoding")` makes this header mandatory for that endpoint.
- No lint tool is configured in this project (no Checkstyle, PMD, or SpotBugs plugins).
