// --- Firebase SDKs ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCZ0j398VfiI0rrXf5VyQ6qUr4iKFBPW4s",
  authDomain: "abqar-store.firebaseapp.com",
  projectId: "abqar-store",
  storageBucket: "abqar-store.firebasestorage.app",
  messagingSenderId: "119184115173",
  appId: "1:119184115173:web:46d08d93578b02970e1b0c",
  measurementId: "G-LFF1FP9YNH"
};

// --- Global Variables & Elements ---
let salesData = [];
let customersData = {};
let currentLanguage = "en";
let dailyGoal = 5000;
let salesCollection;
let db;
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingMessage = document.getElementById('loadingMessage');
const loadingError = document.getElementById('loadingError');

// --- TRANSLATION DATA ---
const translations = {
  en: {
    app_title: "مبيعات متجر عبقر",
    dashboard: "Dashboard",
    sales_entry: "Sales Entry",
    sales_log: "Sales Log",
    ai_insights: "AI Insights",
    customers: "Customers",
    debt_management: "Debt Management",
    export: "Export",
    todays_revenue: "Today's Revenue",
    from_yesterday: "from yesterday",
    weekly_revenue: "Weekly Revenue",
    from_last_week: "from last week",
    monthly_revenue: "Monthly Revenue",
    from_last_month: "from last month",
    top_selling_service: "Top Selling Service",
    period_profit: "Profit for Date",
    total_debt: "Total Debt",
    daily_goal: "Daily Goal",
    of_profit_goal: "of profit goal",
    sales_by_service_type: "Sales by Service Type",
    monthly_sales_trend: "Monthly Sales Trend",
    service_profitability: "Service Profitability",
    service: "Service",
    orders: "Orders",
    revenue: "Revenue",
    avg_profit: "Avg. Profit",
    no_data_available: "No data available",
    new_sale_entry: "New Sale Entry",
    date: "Date",
    service_type: "Service Type",
    select_service_type: "Select Service Type",
    price: "Price",
    service_cost: "Service Cost",
    client_name: "Client Name (Optional)",
    whatsapp_number: "WhatsApp Number (Optional)",
    payment_status: "Payment Status",
    paid: "Paid",
    unpaid: "Unpaid",
    notes: "Notes (Optional)",
    save_sale: "Save Sale",
    sales_history: "Sales History",
    profit: "Profit",
    status: "Status",
    no_sales_records_found: "No sales records found",
    customer_database: "Customer Database",
    customer: "Customer",
    whatsapp: "WhatsApp",
    last_purchase: "Last Purchase",
    total_orders: "Total Orders",
    total_spent: "Total Spent",
    no_customer_records_found: "No customer records found",
    unpaid_orders: "Unpaid Orders",
    amount_due: "Amount Due",
    no_unpaid_orders: "No unpaid orders",
    notification: "Notification",
    delete_sale_title: "Delete Sale",
    delete_sale_message: "Are you sure you want to delete this sale? This action cannot be undone.",
    mark_as_paid_message: "Are you sure you want to mark this order as paid?",
    currency: "EGP",
    edit: "Edit",
    delete: "Delete",
    details: "Details",
    mark_as_paid: "Mark as Paid",
    enter_daily_goal: "Enter new daily goal (for profit)",
    goal_updated: "Daily profit goal updated successfully!",
    customer_details: "Customer Details",
    purchase_history: "Purchase History",
    close: "Close",
    customer_name: "Name",
    confirm: "Confirm",
    cancel: "Cancel",
    loading_data: "Loading Data...",
    firebase_error: "Connection to database failed. Please check your Firebase configuration and internet connection.",
    ai_monthly_report: "AI Monthly Report",
    generate_report: "Generate Report",
    report_placeholder: "Click 'Generate Report' to get an AI-powered analysis of your last 30 days of sales data.",
    generating_report: "Generating report, please wait...",
    no_data_for_report: "Not enough data from the last 30 days to generate a report."
  },
  ar: {
    app_title: "مبيعات متجر عبقر",
    dashboard: "لوحة التحكم",
    sales_entry: "إدخال المبيعات",
    sales_log: "سجل المبيعات",
    ai_insights: "رؤى الذكاء الاصطناعي",
    customers: "العملاء",
    debt_management: "إدارة الديون",
    export: "تصدير",
    todays_revenue: "إيرادات اليوم",
    from_yesterday: "عن أمس",
    weekly_revenue: "إيرادات الأسبوع",
    from_last_week: "عن الأسبوع الماضي",
    monthly_revenue: "إيرادات الشهر",
    from_last_month: "عن الشهر الماضي",
    top_selling_service: "الخدمة الأكثر مبيعاً",
    period_profit: "أرباح تاريخ محدد",
    total_debt: "إجمالي الديون",
    daily_goal: "الهدف اليومي",
    of_profit_goal: "من هدف الربح",
    sales_by_service_type: "المبيعات حسب نوع الخدمة",
    monthly_sales_trend: "اتجاه المبيعات الشهري",
    service_profitability: "ربحية الخدمة",
    service: "الخدمة",
    orders: "الطلبات",
    revenue: "الإيرادات",
    avg_profit: "متوسط الربح",
    no_data_available: "لا توجد بيانات متاحة",
    new_sale_entry: "إدخال عملية بيع جديدة",
    date: "التاريخ",
    service_type: "نوع الخدمة",
    select_service_type: "اختر نوع الخدمة",
    price: "السعر",
    service_cost: "تكلفة الخدمة",
    client_name: "اسم العميل (اختياري)",
    whatsapp_number: "رقم الواتساب (اختياري)",
    payment_status: "حالة الدفع",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    notes: "ملاحظات (اختياري)",
    save_sale: "حفظ البيع",
    sales_history: "سجل المبيعات",
    profit: "الربح",
    status: "الحالة",
    no_sales_records_found: "لم يتم العثور على سجلات مبيعات",
    customer_database: "قاعدة بيانات العملاء",
    customer: "العميل",
    whatsapp: "واتساب",
    last_purchase: "آخر عملية شراء",
    total_orders: "إجمالي الطلبات",
    total_spent: "إجمالي الإنفاق",
    no_customer_records_found: "لم يتم العثور على سجلات عملاء",
    unpaid_orders: "الطلبات غير المدفوعة",
    amount_due: "المبلغ المستحق",
    no_unpaid_orders: "لا توجد طلبات غير مدفوعة",
    notification: "إشعار",
    delete_sale_title: "حذف عملية البيع",
    delete_sale_message: "هل أنت متأكد أنك تريد حذف هذا البيع؟ لا يمكن التراجع عن هذا الإجراء.",
    mark_as_paid_message: "هل أنت متأكد من أنك تريد تحديد هذا الطلب كمدفوع؟",
    currency: "ج.م",
    edit: "تعديل",
    delete: "حذف",
    details: "تفاصيل",
    mark_as_paid: "تحديد كمدفوع",
    enter_daily_goal: "أدخل الهدف اليومي الجديد (للربح)",
    goal_updated: "تم تحديث هدف الربح اليومي بنجاح!",
    customer_details: "تفاصيل العميل",
    purchase_history: "سجل الشراء",
    close: "إغلاق",
    customer_name: "الاسم",
    confirm: "تأكيد",
    cancel: "إلغاء",
    loading_data: "جاري تحميل البيانات...",
    firebase_error: "فشل الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات Firebase واتصالك بالإنترنت.",
    ai_monthly_report: "تقرير الذكاء الاصطناعي الشهري",
    generate_report: "إنشاء تقرير",
    report_placeholder: "انقر فوق 'إنشاء تقرير' للحصول على تحليل مدعوم بالذكاء الاصطناعي لبيانات المبيعات لآخر 30 يومًا.",
    generating_report: "جاري إنشاء التقرير، يرجى الانتظار...",
    no_data_for_report: "لا توجد بيانات كافية من آخر 30 يومًا لإنشاء تقرير."
  },
};

// --- CORE APP LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        const auth = getAuth(app);

        initializeCharts();
        
        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
        }
        currentLanguage = localStorage.getItem("language") || "ar"; // Default to Arabic
        dailyGoal = parseFloat(localStorage.getItem("dailyGoal")) || 5000;
        
        setLanguage(currentLanguage);
        
        // Set default dates
        document.getElementById("date").valueAsDate = new Date();
        document.getElementById("profitDate").valueAsDate = new Date();

        setupEventListeners();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User authenticated with UID:", user.uid);
                salesCollection = collection(db, 'sales');
                loadDataAndSetupRealtimeListener();
            } else {
                signInAnonymously(auth).catch((error) => {
                    handleLoadingError(error);
                });
            }
        });
    } catch (error) {
        handleLoadingError(error);
    }
});

function handleLoadingError(error) {
    console.error("Firebase Initialization Error:", error);
    if (loadingMessage) loadingMessage.classList.add('hidden');
    if (loadingError) {
        loadingError.textContent = translations[currentLanguage].firebase_error;
        loadingError.classList.remove('hidden');
    }
}

function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('opacity-0');
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            document.body.classList.remove('loading');
        }, 300);
    }
}

function loadDataAndSetupRealtimeListener() {
    onSnapshot(salesCollection, (snapshot) => {
        salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        salesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        updateCustomerDatabase();
        updateAllViews();
        hideLoadingOverlay();
        console.log("Data updated in real-time:", salesData.length, "records");
    }, (error) => {
        handleLoadingError(error);
    });
}

function updateAllViews() {
  renderSalesLog();
  renderCustomerDatabase();
  renderDebtManagement();
  updateDashboard();
  if (window.serviceTypeChart && window.salesTrendChart) {
    updateCharts();
  }
  setLanguage(currentLanguage);
}

function setupEventListeners() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function () {
      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
      document.querySelectorAll(".tab-content").forEach((content) => content.classList.add("hidden"));
      document.getElementById(this.dataset.tab).classList.remove("hidden");
    });
  });

  document.getElementById("salesForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveSale();
  });

  document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode);
  document.getElementById("languageToggle").addEventListener("click", toggleLanguage);
  document.getElementById("editGoalBtn").addEventListener("click", setDailyGoal);
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("generateReportBtn").addEventListener("click", generateAIReport);

  // Listener for the new profit date selector
  document.getElementById("profitDate").addEventListener("change", updateDashboard);
  
  document.getElementById("closeNotification").addEventListener("click", () => {
    document.getElementById("notification").classList.add("-translate-x-full");
  });
  
  document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
    document.getElementById("deleteConfirmationModal").classList.add("hidden");
  });
  document.getElementById("closeCustomerModalBtn").addEventListener("click", () => {
    document.getElementById("customerDetailsModal").classList.add("hidden");
  });
   document.getElementById("closeCustomerModalBtn2").addEventListener("click", () => {
    document.getElementById("customerDetailsModal").classList.add("hidden");
  });
}

async function saveSale() {
  const form = document.getElementById("salesForm");
  const formData = new FormData(form);
  const editingId = formData.get("editingSaleId");

  const saleData = {
    date: formData.get("date"),
    serviceType: formData.get("serviceType"),
    price: parseFloat(formData.get("price")) || 0,
    serviceCost: parseFloat(formData.get("serviceCost")) || 0,
    clientName: formData.get("clientName") || "N/A",
    whatsappNumber: formData.get("whatsappNumber") || null,
    paymentStatus: formData.get("paymentStatus"),
    notes: formData.get("notes") || "",
  };
  saleData.profit = saleData.price - saleData.serviceCost;

  if (!saleData.serviceType || !saleData.date || isNaN(saleData.price)) {
    showNotification("Please fill date, service type, and price.", "error");
    return;
  }

  try {
    if (editingId) {
      const saleDocRef = doc(db, "sales", editingId);
      await updateDoc(saleDocRef, saleData);
      showNotification("Sale updated successfully!", "success");
    } else {
      await addDoc(salesCollection, saleData);
      showNotification("Sale saved successfully!", "success");
    }
    form.reset();
    document.getElementById("editingSaleId").value = "";
    document.getElementById("date").valueAsDate = new Date();
  } catch (error) {
    console.error("Error saving sale: ", error);
    showNotification("Error saving sale. Please try again.", "error");
  }
}

function editSale(saleId) {
  const sale = salesData.find((s) => s.id === saleId);
  if (!sale) return;

  document.getElementById("editingSaleId").value = sale.id;
  document.getElementById("date").value = sale.date;
  document.getElementById("serviceType").value = sale.serviceType;
  document.getElementById("price").value = sale.price;
  document.getElementById("serviceCost").value = sale.serviceCost;
  document.getElementById("clientName").value = sale.clientName;
  document.getElementById("whatsappNumber").value = sale.whatsappNumber;
  document.getElementById("paymentStatus").value = sale.paymentStatus;
  document.getElementById("notes").value = sale.notes;

  document.querySelector('[data-tab="sales-entry"]').click();
}

async function deleteSale(saleId) {
    try {
        await deleteDoc(doc(db, "sales", saleId));
        showNotification("Sale deleted successfully", "success");
    } catch (error) {
        console.error("Error deleting sale: ", error);
        showNotification("Error deleting sale.", "error");
    }
}

async function markAsPaid(saleId) {
    const saleDocRef = doc(db, "sales", saleId);
    try {
        await updateDoc(saleDocRef, { paymentStatus: "paid" });
        showNotification("Order marked as paid", "success");
    } catch (error) {
        console.error("Error marking as paid: ", error);
        showNotification("Error updating order.", "error");
    }
}

function renderSalesLog() {
  const tableBody = document.getElementById("salesTableBody");
  tableBody.innerHTML = "";

  if (salesData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400" data-translate="no_sales_records_found">No sales records found</td></tr>`;
    return;
  }

  salesData.forEach((sale) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 dark:hover:bg-gray-700";
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${formatDate(sale.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${sale.serviceType}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${sale.clientName}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${formatCurrency(sale.price)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm ${sale.profit >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(sale.profit)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
                ${translations[currentLanguage][sale.paymentStatus]}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="edit-btn" data-id="${sale.id}" data-translate="edit">Edit</button>
            <button class="delete-btn" data-id="${sale.id}" data-translate="delete">Delete</button>
        </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      showDeleteConfirmation(this.dataset.id);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      editSale(this.dataset.id);
    });
  });
}

function renderCustomerDatabase() {
  const tableBody = document.getElementById("customersTableBody");
  const customersArray = Object.values(customersData);
  tableBody.innerHTML = "";

  if (customersArray.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400" data-translate="no_customer_records_found">No customer records found</td></tr>`;
    return;
  }

  customersArray.sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase));

  customersArray.forEach((customer) => {
    const isVip = customer.totalOrders > 3;
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 dark:hover:bg-gray-700";
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
            <div class="flex items-center">
              ${isVip ? '<span class="vip-badge">VIP</span>' : ""}
              <span>${customer.name}</span>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${customer.whatsappNumber || "N/A"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formatDate(customer.lastPurchase)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${customer.totalOrders}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${formatCurrency(customer.totalSpent)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="details-btn" data-id="${customer.whatsappNumber}" data-translate="details">Details</button>
        </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".details-btn").forEach(btn => {
      btn.addEventListener("click", function() {
          showCustomerDetails(this.dataset.id);
      });
  });
}

function renderDebtManagement() {
  const tableBody = document.getElementById("debtTableBody");
  const unpaidOrders = salesData.filter((sale) => sale.paymentStatus === "unpaid");
  tableBody.innerHTML = "";

  if (unpaidOrders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400" data-translate="no_unpaid_orders">No unpaid orders</td></tr>`;
    return;
  }

  unpaidOrders.forEach((sale) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${formatDate(sale.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${sale.clientName}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">${formatCurrency(sale.price)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="mark-paid-btn" data-id="${sale.id}" data-translate="mark_as_paid">Mark as Paid</button>
        </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".mark-paid-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      markAsPaid(this.dataset.id);
    });
  });
}

function updateCustomerDatabase() {
  customersData = {};
  salesData.forEach((sale) => {
    if (sale.whatsappNumber) {
      if (!customersData[sale.whatsappNumber]) {
        customersData[sale.whatsappNumber] = {
          name: sale.clientName,
          whatsappNumber: sale.whatsappNumber,
          totalOrders: 0,
          totalSpent: 0,
          purchaseHistory: [],
          lastPurchase: "1970-01-01",
        };
      }
      const customer = customersData[sale.whatsappNumber];
      customer.totalOrders++;
      customer.totalSpent += sale.price;
      if (new Date(sale.date) > new Date(customer.lastPurchase)) {
        customer.lastPurchase = sale.date;
        customer.name = sale.clientName;
      }
      customer.purchaseHistory.push(sale);
    }
  });
}

function formatCurrency(value) {
  const lang = currentLanguage;
  const symbol = translations[lang].currency;
  const val = value || 0;
  return lang === "ar"
    ? `${val.toFixed(2)} ${symbol}`
    : `${symbol}${val.toFixed(2)}`;
}

function updateDashboard() {
    const now = new Date();
    const getRevenue = (sales) => sales.reduce((sum, s) => sum + s.price, 0);
    const getProfit = (sales) => sales.reduce((sum, s) => sum + s.profit, 0);

    const todaySales = salesData.filter(s => new Date(s.date).toDateString() === now.toDateString());
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdaySales = salesData.filter(s => new Date(s.date).toDateString() === yesterday.toDateString());
    const todayRevenue = getRevenue(todaySales);
    const yesterdayRevenue = getRevenue(yesterdaySales);
    updateStatCard('today', todayRevenue, yesterdayRevenue);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const thisWeekSales = salesData.filter(s => { const d = new Date(s.date); return d >= startOfWeek && d <= endOfWeek; });
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    const lastWeekSales = salesData.filter(s => { const d = new Date(s.date); return d >= startOfLastWeek && d <= endOfLastWeek; });
    const weeklyRevenue = getRevenue(thisWeekSales);
    const lastWeekRevenue = getRevenue(lastWeekSales);
    updateStatCard('weekly', weeklyRevenue, lastWeekRevenue);

    const thisMonthSales = salesData.filter(s => { const d = new Date(s.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const lastMonthSales = salesData.filter(s => { const d = new Date(s.date); return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear(); });
    const monthlyRevenue = getRevenue(thisMonthSales);
    const lastMonthRevenue = getRevenue(lastMonthSales);
    updateStatCard('monthly', monthlyRevenue, lastMonthRevenue);

    // Update profit card based on selected date
    const profitDateStr = document.getElementById("profitDate").value;
    if (profitDateStr) {
        const profitDate = new Date(profitDateStr);
        const selectedDateSales = salesData.filter(s => new Date(s.date).toDateString() === profitDate.toDateString());
        const periodProfit = getProfit(selectedDateSales);
        document.getElementById("periodProfit").textContent = periodProfit.toFixed(2);
    }

    const totalDebt = salesData.filter((s) => s.paymentStatus === "unpaid").reduce((sum, s) => sum + s.price, 0);
   
    document.getElementById("dashboardTotalOrders").textContent = salesData.length;
    const serviceCounts = salesData.reduce((acc, sale) => { acc[sale.serviceType] = (acc[sale.serviceType] || 0) + 1; return acc; }, {});
    const topService = Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b, "N/A");
    const topServiceEl = document.getElementById("dashboardTopService");
    topServiceEl.textContent = topService;
    topServiceEl.title = topService;

    // Daily goal calculation based on TODAY's PROFIT
    const todayProfit = getProfit(todaySales);
    const goalPercentage = dailyGoal > 0 ? Math.min((todayProfit / dailyGoal) * 100, 100) : 0;
    document.getElementById("dailyGoalProgress").style.width = `${goalPercentage}%`;
    document.getElementById("dailyGoalPercentage").textContent = Math.round(goalPercentage);
    document.getElementById("dailyGoalText").textContent = dailyGoal;

    const debtEl = document.getElementById("totalDebt");
    if (debtEl) debtEl.textContent = totalDebt.toFixed(2);
    
    renderServiceProfitability();
}

function updateStatCard(period, current, previous) {
    document.getElementById(`${period}Revenue`).textContent = current.toFixed(2);
    let trend = 0;
    if (previous > 0) {
        trend = ((current - previous) / previous) * 100;
    } else if (current > 0) {
        trend = 100; // If previous was 0 and current is > 0, it's a 100% increase from a baseline of 0.
    }
    const trendEl = document.getElementById(`${period}Trend`);
    const trendParent = trendEl.parentElement;
    const trendArrow = trendParent.querySelector('.trend-arrow');
    trendEl.textContent = Math.round(trend);
    trendParent.classList.remove('text-green-600', 'text-red-600', 'text-gray-500');
    trendArrow.style.transform = '';
    if (trend > 0) {
        trendParent.classList.add('text-green-600');
        trendArrow.style.transform = 'rotate(0deg)';
    } else if (trend < 0) {
        trendParent.classList.add('text-red-600');
        trendArrow.style.transform = 'rotate(180deg)';
        trendEl.textContent = Math.round(Math.abs(trend)); // Show positive number for decrease
    } else {
        trendParent.classList.add('text-gray-500');
    }
}

function renderServiceProfitability() {
    const serviceProfitabilityBody = document.getElementById("serviceProfitabilityBody");
    serviceProfitabilityBody.innerHTML = "";
    const serviceStats = {};
    salesData.forEach((sale) => {
        if (!serviceStats[sale.serviceType]) {
            serviceStats[sale.serviceType] = { orders: 0, revenue: 0, profit: 0 };
        }
        serviceStats[sale.serviceType].orders++;
        serviceStats[sale.serviceType].revenue += sale.price;
        serviceStats[sale.serviceType].profit += sale.profit;
    });
    if (Object.keys(serviceStats).length === 0) {
        serviceProfitabilityBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400" data-translate="no_data_available">No data available</td></tr>`;
    } else {
        Object.entries(serviceStats)
            .sort(([, a], [, b]) => b.revenue - a.revenue)
            .forEach(([service, stats]) => {
                const avgProfit = stats.orders > 0 ? stats.profit / stats.orders : 0;
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${service}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${stats.orders}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${formatCurrency(stats.revenue)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${avgProfit >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(avgProfit)}</td>
                `;
                serviceProfitabilityBody.appendChild(row);
            });
    }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Correct for timezone offset by creating date in UTC
  const correctedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const options = { year: "numeric", month: "short", day: "numeric" };
  return correctedDate.toLocaleDateString(currentLanguage === "ar" ? "ar-EG" : "en-US", options);
}

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notificationMessage");
  notificationMessage.textContent = message;
  notification.classList.remove("-translate-x-full");
  setTimeout(() => {
    notification.classList.add("-translate-x-full");
  }, 3000);
}

function showDeleteConfirmation(saleId) {
    const dialog = document.getElementById("deleteConfirmationModal");
    dialog.classList.remove("hidden");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const confirmAction = () => {
        deleteSale(saleId);
        dialog.classList.add("hidden");
    };
    const newConfirmBtn = confirmBtn.cloneNode(true);
    newConfirmBtn.textContent = translations[currentLanguage].delete;
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener("click", confirmAction);
}

function showCustomerDetails(whatsappNumber) {
    const customer = customersData[whatsappNumber];
    if (!customer) return;
    document.getElementById("modalCustomerName").textContent = customer.name;
    document.getElementById("modalCustomerWhatsapp").textContent = customer.whatsappNumber;
    document.getElementById("modalCustomerTotalOrders").textContent = customer.totalOrders;
    document.getElementById("modalCustomerTotalSpent").textContent = formatCurrency(customer.totalSpent);
    const historyBody = document.getElementById("modalPurchaseHistory");
    historyBody.innerHTML = "";
    if (customer.purchaseHistory && customer.purchaseHistory.length > 0) {
        customer.purchaseHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(sale => {
                const row = historyBody.insertRow();
                row.innerHTML = `
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formatDate(sale.date)}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${sale.serviceType}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">${formatCurrency(sale.price)}</td>
                `;
            });
    } else {
        historyBody.innerHTML = `<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500 dark:text-gray-400" data-translate="no_sales_records_found">No sales records found</td></tr>`;
    }
    document.getElementById("customerDetailsModal").classList.remove("hidden");
    setLanguage(currentLanguage);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
  updateCharts();
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "ar" : "en";
  localStorage.setItem("language", currentLanguage);
  updateAllViews(); // Re-render everything to apply new language and currency formats
}

function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-translate]").forEach((el) => {
    const key = el.dataset.translate;
    if (translations[lang] && translations[lang][key]) {
      // Handle nested spans for goal text
      if (el.id === "dailyGoalText") {
        const parent = el.parentElement;
        const goalText = translations[lang][parent.dataset.translate]
            .replace('5000', `<span id="dailyGoalText">${dailyGoal}</span>`);
        parent.innerHTML = goalText;
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
  document.querySelectorAll(".currency-symbol").forEach((el) => {
    el.textContent = translations[lang].currency;
  });
}

function setDailyGoal() {
  const newGoal = prompt(translations[currentLanguage].enter_daily_goal, dailyGoal);
  if (newGoal && !isNaN(newGoal) && parseFloat(newGoal) > 0) {
    dailyGoal = parseFloat(newGoal);
    localStorage.setItem("dailyGoal", dailyGoal);
    showNotification(translations[currentLanguage].goal_updated, "success");
    updateDashboard();
  }
}

let serviceTypeChart, salesTrendChart;
function initializeCharts() {
  const serviceTypeCtx = document.getElementById("serviceTypeChart").getContext("2d");
  serviceTypeChart = new Chart(serviceTypeCtx, { type: "pie", data: { labels: [], datasets: [{ data: [], backgroundColor: ["#4A90E2", "#7ED321", "#F5A623", "#9013FE", "#BD10E0", "#4A4A4A"] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#333' } } } } });
  const salesTrendCtx = document.getElementById("salesTrendChart").getContext("2d");
  salesTrendChart = new Chart(salesTrendCtx, { type: "line", data: { labels: [], datasets: [{ label: "Revenue", data: [], borderColor: "#4A90E2", tension: 0.1 }, { label: "Profit", data: [], borderColor: "#7ED321", tension: 0.1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: '#333' } }, x: { ticks: { color: '#333' } } }, plugins: { legend: { labels: { color: '#333' } } } } });
}

function updateCharts() {
  if (!serviceTypeChart || !salesTrendChart) return;
  const isDarkMode = document.body.classList.contains("dark-mode");
  const textColor = isDarkMode ? "#e2e8f0" : "#333";
  const serviceCounts = salesData.reduce((acc, sale) => { acc[sale.serviceType] = (acc[sale.serviceType] || 0) + sale.price; return acc; }, {});
  serviceTypeChart.data.labels = Object.keys(serviceCounts);
  serviceTypeChart.data.datasets[0].data = Object.values(serviceCounts);
  serviceTypeChart.options.plugins.legend.labels.color = textColor;
  serviceTypeChart.update();
  const monthlyData = {};
  salesData.forEach((sale) => {
    const month = sale.date.substring(0, 7);
    if (!monthlyData[month]) { monthlyData[month] = { revenue: 0, profit: 0 }; }
    monthlyData[month].revenue += sale.price;
    monthlyData[month].profit += sale.profit;
  });
  const sortedMonths = Object.keys(monthlyData).sort();
  salesTrendChart.data.labels = sortedMonths.map(m => {
      const [year, month] = m.split('-');
      return new Date(year, month - 1).toLocaleString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  });
  salesTrendChart.data.datasets[0].data = sortedMonths.map((m) => monthlyData[m].revenue);
  salesTrendChart.data.datasets[1].data = sortedMonths.map((m) => monthlyData[m].profit);
  salesTrendChart.options.plugins.legend.labels.color = textColor;
  salesTrendChart.options.scales.x.ticks.color = textColor;
  salesTrendChart.options.scales.y.ticks.color = textColor;
  salesTrendChart.update();
}

function exportData() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Date,Service Type,Price,Cost,Profit,Client Name,WhatsApp,Status,Notes\n";
  salesData.forEach((sale) => {
    const notes = sale.notes ? `"${sale.notes.replace(/"/g, '""')}"` : "";
    const clientName = `"${sale.clientName.replace(/"/g, '""')}"`;
    const row = [sale.id, sale.date, sale.serviceType, sale.price, sale.serviceCost, sale.profit, clientName, sale.whatsappNumber || "", sale.paymentStatus, notes].join(",");
    csvContent += row + "\r\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- AI INSIGHTS FUNCTION ---
async function generateAIReport() {
    const container = document.getElementById('aiReportContainer');
    const placeholder = document.getElementById('aiPlaceholder');
    const loading = document.getElementById('aiLoadingIndicator');

    placeholder.classList.add('hidden');
    loading.classList.remove('hidden');
    container.innerHTML = ''; // Clear previous report
    container.appendChild(loading); // Re-add loading indicator

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = salesData.filter(s => new Date(s.date) >= thirtyDaysAgo);

    if (recentSales.length === 0) {
        loading.classList.add('hidden');
        container.innerHTML = `<p>${translations[currentLanguage].no_data_for_report}</p>`;
        return;
    }

    const totalRevenue = recentSales.reduce((sum, s) => sum + s.price, 0);
    const totalProfit = recentSales.reduce((sum, s) => sum + s.profit, 0);
    const serviceStats = recentSales.reduce((acc, sale) => {
        if (!acc[sale.serviceType]) {
            acc[sale.serviceType] = { revenue: 0, profit: 0, orders: 0 };
        }
        acc[sale.serviceType].revenue += sale.price;
        acc[sale.serviceType].profit += sale.profit;
        acc[sale.serviceType].orders++;
        return acc;
    }, {});

    const topServices = Object.entries(serviceStats)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 3);
    
    const topProfitServices = Object.entries(serviceStats)
        .sort(([, a], [, b]) => b.profit - a.profit)
        .slice(0, 3);

    const reportTitleKey = currentLanguage === 'ar' ? '### ملخص أداء آخر 30 يومًا' : '### Performance Summary: Last 30 Days';
    const revenueKey = translations[currentLanguage].revenue;
    const profitKey = translations[currentLanguage].profit;
    const ordersKey = translations[currentLanguage].orders;
    const topRevenueKey = currentLanguage === 'ar' ? '**الخدمات الأعلى إيرادًا**' : '**Top Services by Revenue**';
    const topProfitKey = currentLanguage === 'ar' ? '**الخدمات الأعلى ربحًا**' : '**Top Services by Profit**';
    const conclusionKey = currentLanguage === 'ar' ? '### توصيات' : '### Recommendations';
    const recommendationText = currentLanguage === 'ar' ? `- ركز على تسويق **${topServices[0][0]}** نظرًا لأنه يدر أعلى الإيرادات.\n- قم بتحليل تكاليف الخدمات الأقل ربحًا لتحسين هوامش الربح.` : `- Focus marketing efforts on **${topServices[0][0]}** as it is the highest revenue generator.\n- Analyze the costs of lower-profit services to improve margins.`;

    let markdownReport = `${reportTitleKey}\n`;
    markdownReport += `* **${translations[currentLanguage].monthly_revenue}:** ${formatCurrency(totalRevenue)}\n`;
    markdownReport += `* **${profitKey}:** ${formatCurrency(totalProfit)}\n`;
    markdownReport += `* **${translations[currentLanguage].total_orders}:** ${recentSales.length}\n\n`;

    markdownReport += `${topRevenueKey}\n`;
    topServices.forEach((s, i) => {
        markdownReport += `${i + 1}. **${s[0]}**: ${formatCurrency(s[1].revenue)} (${s[1].orders} ${ordersKey.toLowerCase()})\n`;
    });
    
    markdownReport += `\n${topProfitKey}\n`;
    topProfitServices.forEach((s, i) => {
        markdownReport += `${i + 1}. **${s[0]}**: ${formatCurrency(s[1].profit)} (${profitKey.toLowerCase()})\n`;
    });

    markdownReport += `\n${conclusionKey}\n${recommendationText}`;

    loading.classList.add('hidden');
    container.innerHTML = marked.parse(markdownReport);
}