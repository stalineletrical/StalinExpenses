let expenses = [];

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const categoryKeywords = {
  "Vegetable": ["tomato", "potato", "onion", "vegetable"],
  "Fruits": ["apple", "banana", "orange", "fruit"],
  "Drinks and Alcohol": ["beer", "wine", "vodka", "drink"],
  "Meat": ["chicken", "beef", "fish", "meat"],
  "Transport": ["fuel", "diesel", "petrol", "train", "bus"],
  "Snacks": ["chips", "snack", "biscuit"],
  "Meal": ["burger", "pizza", "rice", "dinner", "lunch"]
};

async function processReceipts() {

  const files = document.getElementById("receiptInput").files;

  if (files.length === 0) {
    alert("Upload receipts first");
    return;
  }

  document.getElementById("status").innerText =
    "Processing receipts...";

  for (const file of files) {

    let text = "";

    if (file.type === "application/pdf") {
      text = await extractTextFromPDF(file);
    } else {
      text = await extractTextFromImage(file);
    }

    const data = extractReceiptData(text);

    expenses.push(data);

    addToTable(data);
  }

  document.getElementById("status").innerText =
    "Completed";
}

async function extractTextFromImage(file) {

  const result = await Tesseract.recognize(
    file,
    'eng'
  );

  return result.data.text;
}

async function extractTextFromPDF(file) {

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer
  }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

    const page = await pdf.getPage(pageNum);

    const viewport = page.getViewport({
      scale: 2
    });

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const imageData = canvas.toDataURL("image/png");

    const result = await Tesseract.recognize(
      imageData,
      'eng'
    );

    fullText += result.data.text + "\n";
  }

  return fullText;
}

function extractReceiptData(text) {

  const lines = text.split("\n");

  let date = "Unknown";

  const dateMatch = text.match(
    /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/
  );

  if (dateMatch) {
    date = dateMatch[1];
  }

  const shopName = lines[0] || "Unknown Shop";

  let totalAmount = 0;

  const amounts = text.match(/(\d+\.\d{2})/g);

  if (amounts) {
    totalAmount = Math.max(...amounts.map(Number));
  }

  const category = detectCategory(text);

  return {
    date,
    shopName,
    category,
    totalAmount
  };
}

function detectCategory(text) {

  const lowerText = text.toLowerCase();

  for (const category in categoryKeywords) {

    for (const keyword of categoryKeywords[category]) {

      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }

  return "Others";
}

function addToTable(data) {

  const tbody =
    document.querySelector("#expenseTable tbody");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${data.date}</td>
    <td>${data.shopName}</td>
    <td>${data.category}</td>
    <td>${data.totalAmount}</td>
  `;

  tbody.appendChild(row);
}

function downloadExcel() {

  const worksheet =
    XLSX.utils.json_to_sheet(expenses);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Expenses"
  );

  XLSX.writeFile(
    workbook,
    "Expense_Report.xlsx"
  );
}
