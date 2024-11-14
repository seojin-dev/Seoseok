class PDFAnalyzer {
  constructor() {
    this.apiKey = "AIzaSyBzM9p64vESvPMGJfPrXsvarcN1yC2cW1w";
    this.pdfText = "";
    this.currentPage = 1;
    this.totalPages = 1;
    this.pdfDoc = null;
    this.initializeElements();
    this.setupEventListeners();
    this.loadUserProfile();
  }

  initializeElements() {
    this.uploadBox = document.getElementById("uploadBox");
    this.fileInput = document.getElementById("fileInput");
    this.analysisSection = document.getElementById("analysisSection");
    this.pdfViewer = document.getElementById("pdfViewer");
    this.analysisResult = document.getElementById("analysisResult");
    this.chatMessages = document.getElementById("chatMessages");
    this.questionInput = document.getElementById("questionInput");
    this.sendButton = document.getElementById("sendButton");
    this.userProfile = document.getElementById("userProfile");
    this.prevButton = document.getElementById("prevPage");
    this.nextButton = document.getElementById("nextPage");
    this.pageInfo = document.getElementById("pageInfo");
  }

  loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      this.userProfile.innerHTML = `
                <div class="user-info">
                    <img src="${userData.imageUrl}" alt="${userData.name}" class="user-avatar">
                    <span class="user-name">${userData.name}</span>
                </div>
                <button onclick="handleLogout()" class="logout-btn">로그아웃</button>
            `;
    } else {
      window.location.href = "login.html";
    }
  }

  setupEventListeners() {
    this.uploadBox.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.uploadBox.classList.add("dragover");
    });

    this.uploadBox.addEventListener("dragleave", () => {
      this.uploadBox.classList.remove("dragover");
    });

    this.uploadBox.addEventListener("drop", async (e) => {
      e.preventDefault();
      this.uploadBox.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        await this.handleFile(file);
      } else {
        alert("PDF 파일만 업로드 가능합니다.");
      }
    });

    this.uploadBox.addEventListener("click", () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
        await this.handleFile(file);
      } else {
        alert("PDF 파일만 업로드 가능합니다.");
      }
    });

    this.sendButton.addEventListener("click", () => this.handleQuestion());
    this.questionInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleQuestion();
    });
  }

  async handleFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      await this.processPDF(arrayBuffer);
      this.analysisSection.hidden = false;
      this.uploadBox.style.display = "none";
    } catch (error) {
      console.error("PDF 처리 오류:", error);
      alert("PDF 파일을 처리하는 중 오류가 발생했습니다.");
    }
  }

  async processPDF(arrayBuffer) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      this.pdfDoc = pdf;
      this.totalPages = pdf.numPages;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      this.pdfText = text;
      await this.displayPDFPreview(pdf);
      await this.analyzeDocument(text);
      this.setupPDFControls();
    } catch (error) {
      console.error("PDF 처리 중 오류:", error);
      throw new Error("PDF 파일을 처리할 수 없습니다.");
    }
  }

  async displayPDFPreview(pdf) {
    await this.renderPage(1);
    this.updatePageInfo();
  }

  async renderPage(pageNumber) {
    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      this.pdfViewer.innerHTML = "";
      this.pdfViewer.appendChild(canvas);
      this.currentPage = pageNumber;
    } catch (error) {
      console.error("페이지 렌더링 오류:", error);
    }
  }

  setupPDFControls() {
    this.prevButton.onclick = () => {
      if (this.currentPage > 1) {
        this.renderPage(this.currentPage - 1);
        this.updatePageInfo();
      }
    };

    this.nextButton.onclick = () => {
      if (this.currentPage < this.totalPages) {
        this.renderPage(this.currentPage + 1);
        this.updatePageInfo();
      }
    };
  }

  updatePageInfo() {
    this.pageInfo.textContent = `${this.currentPage}/${this.totalPages}`;
  }

  async analyzeDocument(text) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `다음 문서를 분석하고 주요 내용을 요약해주세요:
                                        1. 문서의 주제
                                        2. 핵심 포인트
                                        3. 주요 결론
                                        
                                        문서 내용:
                                        ${text.substring(0, 30000)}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API 응답 오류");
      }

      const data = await response.json();
      this.displayAnalysis(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("분석 오류:", error);
      this.displayAnalysis("문서 분석 중 오류가 발생했습니다.");
    }
  }

  async handleQuestion() {
    const question = this.questionInput.value.trim();
    if (!question) return;

    this.addMessage("user", question);
    this.questionInput.value = "";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `문서 내용: ${this.pdfText.substring(0, 30000)}
                                        
                                        질문: ${question}
                                        
                                        위 문서의 내용을 바탕으로 자세하게 답변해주세요.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API 응답 오류");
      }

      const data = await response.json();
      this.addMessage("ai", data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("응답 오류:", error);
      this.addMessage(
        "ai",
        "죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. (1분 후 다시 시도해 주세요.)"
      );
    }
  }

  addMessage(type, content) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = content;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  displayAnalysis(analysis) {
    this.analysisResult.innerHTML = analysis.replace(/\n/g, "<br>");
  }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  new PDFAnalyzer();
});
