let expenses = [];

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const categoryKeywords = {
  "Vegetable": ["tomato", "potato", "onion", "vegetable", "carrot"],
  "Fruits": ["apple", "banana", "orange", "fruit", "grapes"],
  "Drinks and Alcohol": ["beer", "wine", "vodka", "whiskey", "cola", "juice", "drink"],
  "Meat": ["chicken", "mutton", "beef", "fish", "meat"],
  "Transport": ["fuel", "diesel", "petrol", "train", "bus", "ticket", "uber", "taxi"],
  "Snacks": ["chips", "snack", "biscuit", "cookies"],
  "Meal": ["meal", "burger", "pizza", "rice", "dinner", "lunch"]
};

async function processReceipts() {

  const files = document.getElementById("receiptInput").files;

  if (files.length === 0) {
    alert("Please upload PDF or image receipts.");
    return;
  }

  document.getElementById("status").innerText = "Processing receipts...";

  for (const file of files) {

    let text = "";

      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromImage(file);
      }

    console.log(text);

    const extractedData = extractReceiptData(text);

    expenses.push(extractedData);

    addToTable(extractedData);
  }

  document.getElementById("status").innerText = "Processing completed.";
}

async function extractTextFromImage(file) {

  const result = await Tesseract.recognize(file, 'eng');

  return result.data.text;
}

async function extractTextFromPDF(file) {

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

    const page = await pdf.getPage(pageNum);

    const viewport = page.getViewport({ scale: 2 });
}
