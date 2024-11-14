// Google 로그인 설정
const CLIENT_ID =
  "620001562608-faddmpo0f29hclg4t5knepsjt4nt6voi.apps.googleusercontent.com";

// 로그인 성공 시 호출되는 함수
function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile();
  const userData = {
    id: profile.getId(),
    name: profile.getName(),
    email: profile.getEmail(),
    imageUrl: profile.getImageUrl(),
  };

  // 사용자 정보 저장
  localStorage.setItem("userData", JSON.stringify(userData));

  // 앱 페이지로 리다이렉트
  window.location.href = "app.html";
}

// 로그아웃 함수
function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(() => {
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  });
}

// 로그인 상태 확인
function checkAuth() {
  const userData = localStorage.getItem("userData");
  if (!userData) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function handleGoogleSignIn() {
  try {
    gapi.load("auth2", async function () {
      try {
        const auth2 = await gapi.auth2.init({
          client_id:
            "620001562608-faddmpo0f29hclg4t5knepsjt4nt6voi.apps.googleusercontent.com",
          scope: "email profile",
        });

        const googleUser = await auth2.signIn();
        const profile = googleUser.getBasicProfile();
        const userData = {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          imageUrl: profile.getImageUrl(),
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "app.html";
      } catch (error) {
        console.error("Google 인증 초기화 실패:", error);
        document.getElementById("errorMessage").textContent =
          "Google 로그인을 초기화하는 중 오류가 발생했습니다.";
      }
    });
  } catch (error) {
    console.error("Google API 로드 실패:", error);
    document.getElementById("errorMessage").textContent =
      "Google API를 로드하는 중 오류가 발생했습니다.";
  }
}

// Google API 초기화
function initGoogleAuth() {
  gapi.load("auth2", () => {
    gapi.auth2
      .init({
        client_id: CLIENT_ID,
      })
      .then(() => {
        // 초기화 완료 후 로그인 상태 확인
        if (window.location.pathname.includes("app.html")) {
          checkAuth();
        }
      });
  });
}

// 페이지 로드 시 Google API 초기화
window.onload = initGoogleAuth;
