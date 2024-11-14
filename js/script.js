class PDFAnalyzer {
  constructor() {
    this.apiKey = "AIzaSyBzM9p64vESvPMGJfPrXsvarcN1yC2cW1w";
    this.pdfText = "";
    this.rateLimit = new APIRateLimit();
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.dropArea = document.getElementById("dropArea");
    this.fileInput = document.getElementById("fileInput");
    this.loading = document.getElementById("loading");
    this.resultSection = document.getElementById("resultSection");
    this.pdfViewer = document.getElementById("pdfViewer");
    this.analysisContent = document.getElementById("analysisContent");
    this.chatMessages = document.getElementById("chatMessages");
    this.questionInput = document.getElementById("questionInput");
    this.sendButton = document.getElementById("sendButton");
  }

  setupEventListeners() {
    this.dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropArea.classList.add("dragover");
    });

    this.dropArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropArea.classList.remove("dragover");
    });

    this.dropArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropArea.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        await this.handleFile(file);
      } else {
        alert("PDF 파일만 업로드 가능합니다.");
      }
    });

    this.fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
        await this.handleFile(file);
      } else {
        alert("PDF 파일만 업로드 가능합니다.");
      }
    });

    this.dropArea.addEventListener("click", () => {
      this.fileInput.click();
    });

    this.sendButton.addEventListener("click", () => this.handleQuestion());
    this.questionInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleQuestion();
    });
  }

  async handleFile(file) {
    try {
      await this.rateLimit.checkLimit();
      this.showLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      await this.processPDF(arrayBuffer);
      this.showLoading(false);
      this.resultSection.style.display = "grid";
    } catch (error) {
      console.error("파일 처리 오류:", error);
      this.showLoading(false);
      alert(error.message || "파일을 처리하는 중 오류가 발생했습니다.");
    }
  }

  async processPDF(arrayBuffer) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let textContent = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textContent += content.items.map((item) => item.str).join(" ") + "\n";
      }
      this.pdfText = textContent;

      const firstPage = await pdf.getPage(1);
      await this.renderPage(firstPage);

      if (this.pdfText.trim()) {
        const analysis = await this.analyzeDocument(this.pdfText);
        this.displayAnalysis(this.formatAnalysis(analysis));
      }
    } catch (error) {
      console.error("PDF 처리 중 오류:", error);
      throw new Error("PDF 처리 중 오류가 발생했습니다.");
    }
  }

  async renderPage(page) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const viewport = page.getViewport({ scale: 1.2 }); // 스케일 조정

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    try {
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      this.pdfViewer.innerHTML = "";
      this.pdfViewer.appendChild(canvas);
    } catch (error) {
      console.error("페이지 렌더링 오류:", error);
      throw new Error("PDF 페이지를 표시할 수 없습니다.");
    }
  }

  formatAnalysis(text) {
    // 줄바꿈과 구분자 추가
    return text
      .replace(/([0-9]+\.|•)/g, "\n$1") // 번호나 글머리 기호 앞에 줄바꿈
      .replace(/([.!?])\s+/g, "$1\n\n") // 문장 끝에 두 줄 추가
      .replace(/\*\*(.*?)\*\*/g, "$1") // ** 제거
      .trim();
  }

  async analyzeDocument(text) {
    try {
      const truncatedText = text.substring(0, 30000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
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
${truncatedText}`,
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
        const errorData = await response.json();
        console.error("API 오류 상세:", errorData);
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("AI 분석 오류:", error);
      return "문서 분석 중 오류가 발생했습니다. " + error.message;
    }
  }

  async handleQuestion() {
    const question = this.questionInput.value.trim();
    if (!question) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.rateLimit.checkLimit();

      this.addMessage("user", question);
      this.questionInput.value = "";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
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
                    text: `문서 내용:
${this.pdfText.substring(0, 30000)}

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
        throw new Error(
          response.status === 429
            ? "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
            : "API 응답 오류"
        );
      }

      const data = await response.json();
      const answer = this.formatResponse(
        data.candidates[0].content.parts[0].text
      );
      this.addMessage("ai", answer);
    } catch (error) {
      console.error("질문 처리 오류:", error);
      this.addMessage(
        "ai",
        error.message || "죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.",
        true
      );
    }
  }

  formatResponse(text) {
    // 응답 텍스트 포맷팅
    return text
      .replace(/([.!?])\s+/g, "$1\n\n") // 문장 끝에 줄바꿈 추가
      .replace(/\*\*(.*?)\*\*/g, "$1") // ** 제거
      .trim();
  }

  addMessage(type, content, isError = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type} ${isError ? "error" : ""}`;
    messageDiv.textContent = content;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  displayAnalysis(analysis) {
    this.analysisContent.textContent = analysis; // innerHTML 대신 textContent 사용
  }

  showLoading(show) {
    this.loading.style.display = show ? "block" : "none";
    this.dropArea.style.display = show ? "none" : "block";
  }
}

class APIRateLimit {
  constructor() {
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;
  }

  async checkLimit() {
    if (Date.now() >= this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }

    if (this.requestCount >= 60) {
      throw new Error(
        "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
      );
    }

    this.requestCount++;
  }
}

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

document.addEventListener("DOMContentLoaded", () => {
  new PDFAnalyzer();
});
