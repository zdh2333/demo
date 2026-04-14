# Skill: Run & Test httpclientutil

> **When to use:** Every time you need to build, start, or test this codebase.

---

## 1  Environment Setup

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
```

Run these exports in **every new shell session** before any Maven or Java command.
If `javac -version` does not report `1.8.*`, also run:

```bash
sudo update-alternatives --set java  "$JAVA_HOME/bin/java"
sudo update-alternatives --set javac "$JAVA_HOME/bin/javac"
```

All work happens under `/workspace/httpclientutil-master/`.

---

## 2  Build

```bash
cd /workspace/httpclientutil-master
mvn clean install      # compiles, packages, installs to local repo
```

A successful build produces `target/httpclientutil.jar`.

**Known build noise — safe to ignore:**

| Item | Why |
|------|-----|
| `jacob-1.18.jar` warnings | Windows-only COM bridge; non-functional on Linux |
| `TtsMain` / `TokenHolder` compile warnings | Baidu TTS demo code, irrelevant on Linux |

---

## 3  Starting the Application

Use a **dedicated tmux session** so the server survives across tool calls:

```bash
SESSION_NAME="spring-boot-app"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
  || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" \
       -c /workspace/httpclientutil-master -- "${SHELL:-zsh}" -l

tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" \
  'export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64 && cd /workspace/httpclientutil-master && mvn spring-boot:run' C-m
```

Wait ~15 seconds, then verify:

```bash
curl -s http://127.0.0.1:8080/hello/get
# Expected: get无参请求成功
```

The app exposes four endpoints — all under `/hello`:

| Method | Path | Required query/headers |
|--------|------|------------------------|
| GET | `/hello/get` | — |
| GET | `/hello/getWithParam` | `?message=<value>` |
| POST | `/hello/post` | Headers: `User-Agent`, `Accept`, `Accept-Language`, **`Accept-Encoding`**, `Cookie`, `Connection` |
| POST | `/hello/postWithParam` | Form params: `code`, `message` |

---

## 4  Running the Integration Tests

Tests are **not runnable via `mvn test`** — surefire has `<skipTests>true</skipTests>` hard-coded in `pom.xml`. You must invoke JUnit directly.

### Prerequisites

1. The Spring Boot app **must be running** on port 8080 (see §3).
2. The project must be compiled (`mvn clean install`).

### Run all tests

```bash
cd /workspace/httpclientutil-master
mvn dependency:build-classpath -Dmdep.outputFile=/tmp/cp.txt -q
CP=$(cat /tmp/cp.txt)
java -cp "target/classes:target/test-classes:$CP" \
  org.junit.runner.JUnitCore com.jourwon.httpclient.test.HttpClientUtilsTest
```

A clean run prints four `OK` results. If `testPost()` fails with HTTP 400, see the gotcha below.

### Run a single test (example)

```bash
java -cp "target/classes:target/test-classes:$CP" \
  org.junit.runner.JUnitCore com.jourwon.httpclient.test.HttpClientUtilsTest
```

There is no built-in way to run a single method through `JUnitCore` without a runner shim. If you need per-method isolation, temporarily comment out the other `@Test` methods or add a custom runner.

---

## 5  Testing by Codebase Area

### 5.1  HttpClientUtils (utility layer)

**Files:** `src/main/java/.../util/HttpClientUtils.java`

This is the core of the library — static methods for GET / POST / PUT / DELETE.

| What to test | How |
|-------------|-----|
| GET without params | `curl http://127.0.0.1:8080/hello/get` → `get无参请求成功` |
| GET with params | `curl 'http://127.0.0.1:8080/hello/getWithParam?message=hi'` → contains `hi` |
| POST with headers | `curl -X POST http://127.0.0.1:8080/hello/post -H 'User-Agent: test' -H 'Accept: */*' -H 'Accept-Language: en' -H 'Accept-Encoding: gzip' -H 'Cookie: x=1' -H 'Connection: keep-alive'` → `post无参请求成功` |
| POST with params | `curl -X POST http://127.0.0.1:8080/hello/postWithParam -d 'code=0&message=hello'` → contains `code: 0` |
| Full test suite | Run the JUnit command from §4 |

**Known issue — `testPost()` and `Accept-Encoding`:**

The controller's `/hello/post` endpoint requires an `Accept-Encoding` header via `@RequestHeader`. The test class currently does **not** include this header in its `headers` map. Apache HttpClient may or may not inject it automatically depending on the version/config. If the test returns HTTP 400, add `headers.put("Accept-Encoding", "gzip, deflate")` to `testPost()` in the test file.

### 5.2  HelloWorldController (web layer)

**File:** `src/main/java/.../controller/HelloWorldController.java`

Smoke-test all four endpoints with `curl` after starting the app. The curl commands in §5.1 cover these.

For changes to controller logic, always re-test the affected endpoint(s) with curl, then re-run the full JUnit suite.

### 5.3  HttpClientResult (POJO)

**File:** `src/main/java/.../pojo/HttpClientResult.java`

DTO with `code` (int) and `content` (String). Changes here are validated indirectly by the integration tests — the test methods print `HttpClientResult.toString()`.

### 5.4  ConnUtil / DemoException (secondary utils)

**Files:** `src/main/java/.../util/ConnUtil.java`, `DemoException.java`

These are standalone utilities (URL encoding, raw `HttpURLConnection` reading). They have no tests and no controller routes. Validate changes by writing a small `main` method or ad-hoc JUnit test, then remove it before committing.

### 5.5  TTS / Jacob / Baidu classes (ignore on Linux)

**Files:** `Test.java`, `TtsMain.java`, `TokenHolder.java`

These depend on Windows COM (`jacob`) or Baidu cloud keys. **Do not attempt to run or test them on Linux.** If you must edit them, verify only that the project still compiles.

---

## 6  Quick-Reference Smoke Test (copy-paste)

Run this block after starting the app to confirm everything works:

```bash
echo "=== GET ==="
curl -s http://127.0.0.1:8080/hello/get

echo -e "\n=== GET with param ==="
curl -s 'http://127.0.0.1:8080/hello/getWithParam?message=test'

echo -e "\n=== POST with headers ==="
curl -s -X POST http://127.0.0.1:8080/hello/post \
  -H 'User-Agent: agent' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en' \
  -H 'Accept-Encoding: gzip' \
  -H 'Cookie: k=v' \
  -H 'Connection: keep-alive'

echo -e "\n=== POST with params ==="
curl -s -X POST http://127.0.0.1:8080/hello/postWithParam \
  -d 'code=0&message=hello'
```

Expected output (one line per block):

```
get无参请求成功
get带参请求成功,参数message: test
post无参请求成功
post带参请求成功,参数code: 0,参数message: hello
```

---

## 7  Feature Flags / Login / Mocking

This project has **none** of the following:

- Authentication or login
- Feature flags
- External service dependencies (other than Baidu TTS, which is ignored)
- Database connections
- Profile-based configuration (`application-{profile}.properties`)

No mocking or special environment variables are needed beyond `JAVA_HOME`.

---

## 8  Keeping This Skill Up to Date

When you discover a new testing trick, workaround, or runbook step:

1. **Open this file** at `.cursor/skills/run-and-test.md`.
2. **Add the new information** under the most relevant section (§1–§7), or create a new `### 5.x` subsection if it covers a new codebase area.
3. **Date-stamp your addition** with a short note, e.g. `<!-- 2026-04-14: Added workaround for Accept-Encoding header in testPost -->`.
4. **Keep entries concrete** — always include the exact command, file path, or config value. Avoid vague advice.
5. If a workaround becomes obsolete (e.g. a bug is fixed upstream), **delete it** rather than marking it deprecated.
