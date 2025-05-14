"use strict";
class Reservable {
}
class Seat extends Reservable {
    constructor(row, number) {
        super();
        this.row = row;
        this.number = number;
        this.reserved = false;
        this.selected = false;
        this.element = document.createElement("div");
        this.element.classList.add("seat");
        this.element.addEventListener("click", () => this.toggleSelect());
        this.updateUI();
    }
    getElement() {
        return this.element;
    }
    reserve() {
        this.reserved = true;
        this.selected = false;
        this.updateUI();
    }
    isReserved() {
        return this.reserved;
    }
    isSelected() {
        return this.selected;
    }
    getInfo() {
        return { row: this.row, number: this.number };
    }
    toggleSelect() {
        if (this.reserved)
            return;
        this.selected = !this.selected;
        this.updateUI();
    }
    updateUI() {
        this.element.classList.remove("reserved", "selected");
        if (this.reserved) {
            this.element.classList.add("reserved");
        }
        else if (this.selected) {
            this.element.classList.add("selected");
        }
    }
    loadReservedFromStorage() {
        const key = `seat-${this.row}-${this.number}`;
        if (localStorage.getItem(key) === "reserved") {
            this.reserve();
        }
    }
    saveToStorage() {
        const key = `seat-${this.row}-${this.number}`;
        localStorage.setItem(key, "reserved");
    }
}
class Cinema {
    constructor() {
        this.items = [];
    }
    add(item) {
        this.items.push(item);
    }
    getSelectedSeats() {
        return this.items.filter((item) => item.isSelected && item.isSelected());
    }
    render(container) {
        this.items.forEach((item) => {
            if (item.loadReservedFromStorage)
                item.loadReservedFromStorage();
            if (item.getElement)
                container.appendChild(item.getElement());
        });
    }
}
// اجرای برنامه
const cinemaDiv = document.getElementById("cinema");
const cinema = new Cinema();
const TICKET_PRICE = 10000;
for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 8; j++) {
        const seat = new Seat(i, j);
        cinema.add(seat);
    }
}
cinema.render(cinemaDiv);
document.getElementById("buyButton").addEventListener("click", () => {
    const selected = cinema.getSelectedSeats();
    if (selected.length === 0) {
        alert("لطفاً حداقل یک صندلی انتخاب کنید.");
        return;
    }
    const total = selected.length * TICKET_PRICE;
    const confirmed = confirm(`شما ${selected.length} صندلی انتخاب کرده‌اید.\nمبلغ قابل پرداخت: ${total.toLocaleString()} تومان\nآیا ادامه می‌دهید؟`);
    if (confirmed) {
        selected.forEach(seat => {
            seat.reserve();
            seat.saveToStorage();
        });
        const invoice = document.getElementById("invoice");
        const invoiceDetails = document.getElementById("invoice-details");
        invoiceDetails.innerHTML = `
      <p>مبلغ نهایی: <strong>${total.toLocaleString()} تومان</strong></p>
      <p>صندلی‌های رزرو شده:</p>
      <ul>
        ${selected.map(s => `<li>ردیف ${s.getInfo().row} - شماره ${s.getInfo().number}</li>`).join("")}
      </ul>
    `;
        invoice.style.display = "block";
    }
});
document.getElementById("clearStorageButton").addEventListener("click", () => {
    const confirmed = confirm("آیا مطمئن هستید که می‌خواهید تمام اطلاعات رزرو را پاک کنید؟");
    if (confirmed) {
        localStorage.clear();
        alert("اطلاعات با موفقیت حذف شد. در حال بازنشانی صفحه...");
        location.reload();
    }
});
document.getElementById("showSalesButton").addEventListener("click", () => {
    let count = 0;
    for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 8; j++) {
            const key = `seat-${i}-${j}`;
            if (localStorage.getItem(key) === "reserved") {
                count++;
            }
        }
    }
    const totalSales = count * TICKET_PRICE;
    alert(`مجموع فروش تا این لحظه: ${totalSales.toLocaleString()} تومان (${count} بلیت فروخته شده)`);
});
