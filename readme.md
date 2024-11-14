# 서석 (Seoseok) 📚 - AI 문서 분석 서비스

## 소개 🎯

서석은 PDF 문서를 AI로 분석하고 실시간으로 질문할 수 있는 스마트 문서 분석 서비스입니다. Google의 Gemini AI를 활용하여 문서의 핵심 내용을 빠르게 파악하고, 필요한 정보를 쉽게 찾을 수 있습니다.

## 주요 기능 ⭐

- 📝 **PDF 문서 분석**: 업로드한 PDF 문서를 자동으로 분석하고 요약
- 💬 **실시간 질의응답**: 문서 내용에 대해 자유롭게 질문하고 답변 받기
- 🔍 **핵심 내용 추출**: 문서의 주요 포인트를 자동으로 추출
- 🔒 **안전한 로그인**: Google 계정을 통한 간편한 로그인

## 기술 스택 🛠

- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Google OAuth
- **AI Model**: Google Gemini AI
- **PDF Processing**: PDF.js
- **Deployment**: Vercel

## 시작하기 🚀

1. 웹사이트 방문: [서석 바로가기](your-url-here)
2. Google 계정으로 로그인
3. PDF 파일 업로드
4. AI 분석 결과 확인
5. 궁금한 내용 질문하기

## 로컬 개발 환경 설정 💻

```bash
# 저장소 클론
git clone https://github.com/seojin-dev/Seoseok.git

# 디렉토리 이동
cd seoseok

# 로컬 서버 실행 (예: VS Code Live Server 또는 Python 서버)
python -m http.server
```

## 프로젝트 구조 📁

```
seoseok/
├── index.html          # 랜딩 페이지
├── login.html          # 로그인 페이지
├── app.html            # 메인 애플리케이션
├── css/
│   ├── style.css       # 메인 스타일
│   └── animations.css  # 애니메이션
├── js/
│   ├── auth.js         # 인증 관련
│   ├── app.js          # 앱 로직
│   └── animations.js   # 애니메이션 효과
└── assets/
    └── logo.svg        # 로고
```

## 주요 기능 설명 📖

### PDF 분석 🔍

- 드래그 앤 드롭으로 간편한 파일 업로드
- 자동 텍스트 추출 및 분석
- 핵심 내용 요약 제공

### 실시간 질의응답 💭

- 문서 내용 기반 Q&A
- 자연어 처리를 통한 정확한 답변
- 실시간 대화형 인터페이스

## 기여하기 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스 📄

이 프로젝트는 "김서진"이 소유하고 있습니다.
Copyright (c) 2024 Seojin Kim (김서진)

## 개발자 정보 👨‍💻

- 개발자: 김서진 [Seojin Kim]
- 이메일: dev.seojinkim@gmail.com
- GitHub: seojin-dev

## 업데이트 내역 🔄

- v1.0.0 (2024-01-14)
  - 최초 릴리즈
  - 기본 기능 구현

---

⭐ 이 프로젝트가 마음에 드신다면 GitHub Star를 눌러주세요!
