interface SeatInfo {
    row: number;
    number: number;
  }
  
  abstract class Reservable {
    abstract reserve(): void;
    abstract isReserved(): boolean;
  }
  
  class Seat extends Reservable {
    private reserved: boolean = false;
    private selected: boolean = false;
    private element: HTMLDivElement;
  
    constructor(public row: number, public number: number) {
      super();
      this.element = document.createElement("div");
      this.element.classList.add("seat");
      this.element.addEventListener("click", () => this.toggleSelect());
      this.updateUI();
    }
  
    getElement(): HTMLDivElement {
      return this.element;
    }
  
    reserve(): void {
      this.reserved = true;
      this.selected = false;
      this.updateUI();
    }
  
    isReserved(): boolean {
      return this.reserved;
    }
  
    isSelected(): boolean {
      return this.selected;
    }
  
    getInfo(): SeatInfo {
      return { row: this.row, number: this.number };
    }
  
    toggleSelect(): void {
      if (this.reserved) return;
      this.selected = !this.selected;
      this.updateUI();
    }
  
    private updateUI(): void {
      this.element.classList.remove("reserved", "selected");
      if (this.reserved) {
        this.element.classList.add("reserved");
      } else if (this.selected) {
        this.element.classList.add("selected");
      }
    }
  
    loadReservedFromStorage(): void {
      const key = `seat-${this.row}-${this.number}`;
      if (localStorage.getItem(key) === "reserved") {
        this.reserve();
      }
    }
  
    saveToStorage(): void {
      const key = `seat-${this.row}-${this.number}`;
      localStorage.setItem(key, "reserved");
    }
  }
  
  class Cinema {
    private items: Seat[] = [];
  
    add(item: Seat): void {
      this.items.push(item);
    }
  
    getSelectedSeats(): Seat[] {
      return this.items.filter(i => i.isSelected());
    }
  
    render(container: HTMLElement): void {
      this.items.forEach(seat => {
        seat.loadReservedFromStorage();
        container.appendChild(seat.getElement());
      });
    }
  }
  
  
  // اجرای برنامه
  const cinemaDiv = document.getElementById("cinema")!;
  const cinema = new Cinema();
  
  const TICKET_PRICE = 10000;
  
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 8; j++) {
      const seat = new Seat(i, j);
      cinema.add(seat);
    }
  }
  
  cinema.render(cinemaDiv);
  
  document.getElementById("buyButton")!.addEventListener("click", () => {
    const selected = cinema.getSelectedSeats();
  
    if (selected.length === 0) {
      alert("لطفاً حداقل یک صندلی انتخاب کنید.");
      return;
    }
  
    const total = selected.length * TICKET_PRICE;
    const confirmed = confirm(`شما ${selected.length} صندلی انتخاب کرده‌اید.\nمبلغ قابل پرداخت: ${total.toLocaleString()} تومان\nآیا ادامه می‌دهید؟`);
  
    if (confirmed) {
      // ذخیره و رزرو
      selected.forEach(seat => {
        seat.reserve();
        seat.saveToStorage();
      });
  
      // نمایش فاکتور
      const invoice = document.getElementById("invoice")!;
      const invoiceDetails = document.getElementById("invoice-details")!;
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
  // دکمه پاک‌سازی
  document.getElementById("clearStorageButton")!.addEventListener("click", () => {
    const confirmed = confirm("آیا مطمئن هستید که می‌خواهید تمام اطلاعات رزرو را پاک کنید؟");
  
    if (confirmed) {
      localStorage.clear();
      alert("اطلاعات با موفقیت حذف شد. در حال بازنشانی صفحه...");
      location.reload(); // ریفرش کامل برای بارگذاری مجدد صندلی‌ها
    }
  });
  
  // دکمه نمایش فروش
  document.getElementById("showSalesButton")!.addEventListener("click", () => {
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
