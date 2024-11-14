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
// auth.js
async function signOut() {
  try {
    // Firebase 로그아웃
    await firebase.auth().signOut();

    // 로컬 스토리지 데이터 삭제
    localStorage.removeItem("userData");

    // Google 로그인 상태도 함께 해제
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
      await auth2.signOut();
    }

    // 로그인 페이지로 리다이렉트
    window.location.href = "login.html";
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
}

// app.html에서 로그아웃 버튼에 이벤트 리스너 추가
document.querySelector(".logout-btn").addEventListener("click", async () => {
  try {
    await signOut();
  } catch (error) {
    console.error("로그아웃 실패:", error);
    alert("로그아웃 중 오류가 발생했습니다.");
  }
});

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
