// ===========================
// BARBER BOOKING — main.js
// ===========================

// ===== DATA =====
// เก็บข้อมูลคิวแต่ละสาขา (ในโปรเจกต์จริงจะดึงจาก Backend/Database)
const branches = {
  "สาขา 1 - สยาม": { queues: [], nextNumber: 1, serving: 1 },
  "สาขา 2 - อโศก": { queues: [], nextNumber: 1, serving: 1 },
  "สาขา 3 - ลาดพร้าว": { queues: [], nextNumber: 1, serving: 1 },
};

// Map สาขา → element ID
const branchMap = {
  "สาขา 1 - สยาม": { queue: "queue-branch1", serving: "serving-branch1", list: "list-branch1" },
  "สาขา 2 - อโศก": { queue: "queue-branch2", serving: "serving-branch2", list: "list-branch2" },
  "สาขา 3 - ลาดพร้าว": { queue: "queue-branch3", serving: "serving-branch3", list: "list-branch3" },
};

// ===== STATE =====
let selectedBranch = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initBranchCards();
  initBookingButtons();
  renderAllQueues();
});

// ===== BRANCH SELECTION =====
function initBranchCards() {
  const cards = document.querySelectorAll(".branch-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // ยกเลิก selected ทั้งหมด
      cards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedBranch = card.dataset.branch;

      // ไปขั้นตอนที่ 2 หลังเลือกสาขา
      setTimeout(() => {
        showStep("step2");
      }, 300);
    });
  });
}

// ===== BOOKING BUTTONS =====
function initBookingButtons() {
  // ปุ่มย้อนกลับ
  document.getElementById("btn-back").addEventListener("click", () => {
    showStep("step1");
    selectedBranch = null;
    document.querySelectorAll(".branch-card").forEach((c) => c.classList.remove("selected"));
    clearForm();
  });

  // ปุ่มยืนยัน
  document.getElementById("btn-confirm").addEventListener("click", () => {
    const name = document.getElementById("customer-name").value.trim();
    if (!name) {
      alert("กรุณากรอกชื่อของคุณก่อนจองคิว");
      return;
    }
    if (!selectedBranch) {
      alert("กรุณาเลือกสาขา");
      return;
    }
    bookQueue(name);
  });

  // ปุ่มจองใหม่
  document.getElementById("btn-new-booking").addEventListener("click", () => {
    showStep("step1");
    selectedBranch = null;
    document.querySelectorAll(".branch-card").forEach((c) => c.classList.remove("selected"));
    clearForm();
  });
}

// ===== BOOK QUEUE =====
function bookQueue(name) {
  const branch = branches[selectedBranch];
  const queueNumber = branch.nextNumber;

  // เพิ่มคิวเข้าระบบ
  branch.queues.push({ number: queueNumber, name: name, status: "รอ" });
  branch.nextNumber++;

  // แสดงผลลัพธ์
  document.getElementById("result-name").textContent = `ชื่อ: ${name}`;
  document.getElementById("result-branch").textContent = `สาขา: ${selectedBranch}`;
  document.getElementById("result-queue-number").textContent = queueNumber;

  // อัปเดตหน้า Queue Status
  renderAllQueues();

  // ไปขั้นตอนที่ 3
  showStep("step3");

  // TODO: ส่ง LINE Notify ที่นี่ (เชื่อมกับ Backend)
  // sendLineNotify(selectedBranch, queueNumber, name);
}

// ===== RENDER QUEUE STATUS =====
function renderAllQueues() {
  Object.keys(branches).forEach((branchName) => {
    const branch = branches[branchName];
    const ids = branchMap[branchName];

    // อัปเดตจำนวนคิวในหน้า Booking
    const queueEl = document.getElementById(ids.queue);
    if (queueEl) {
      const waiting = branch.queues.filter((q) => q.status === "รอ").length;
      queueEl.innerHTML = `คิวปัจจุบัน: <strong>${waiting} คน</strong>`;
    }

    // อัปเดตคิวที่กำลังให้บริการ
    const servingEl = document.getElementById(ids.serving);
    if (servingEl) {
      servingEl.textContent = branch.serving;
    }

    // อัปเดตรายการคิว
    const listEl = document.getElementById(ids.list);
    if (listEl) {
      if (branch.queues.length === 0) {
        listEl.innerHTML = `<div class="queue-empty">ยังไม่มีคิวในขณะนี้</div>`;
      } else {
        listEl.innerHTML = branch.queues
          .map((q) => {
            const isActive = q.number === branch.serving;
            return `
              <div class="queue-item ${isActive ? "active" : ""}">
                <span class="queue-item-number">#${q.number}</span>
                <span class="queue-item-name">${q.name}</span>
                <span class="queue-item-status">${isActive ? "กำลังให้บริการ" : q.status}</span>
              </div>
            `;
          })
          .join("");
      }
    }
  });
}

// ===== HELPERS =====
function showStep(stepId) {
  document.querySelectorAll(".booking-step").forEach((step) => {
    step.style.display = "none";
  });
  document.getElementById(stepId).style.display = "block";
}

function clearForm() {
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-phone").value = "";
}

// ===== LINE NOTIFY (เชื่อมกับ Backend ภายหลัง) =====
// function sendLineNotify(branch, queueNumber, name) {
//   fetch('/api/notify', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ branch, queueNumber, name })
//   });
// }
