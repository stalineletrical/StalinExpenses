let expenses = [];
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

function verifyMealTotal(text, detectedTotal) {

  let finalTotal = detectedTotal;

  const discountRegex = /discount\s*[-:]?\s*(\d+\.\d{2})/i;

  const match = text.match(discountRegex);

  if (match) {

    const discount = parseFloat(match[1]);

    finalTotal = detectedTotal - discount;
  }

  return finalTotal.toFixed(2);
}

function addToTable(data) {

  const tbody = document.querySelector("#expenseTable tbody");

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

  if (expenses.length === 0) {
    alert("No data available.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(expenses);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  XLSX.writeFile(workbook, "Expense_Report.xlsx");
