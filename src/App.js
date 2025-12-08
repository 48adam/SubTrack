import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  PlusCircle,
  Moon,
  Sun,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  Download,
  Upload,
  LogOut,
  X,
  Trash2,
  Globe,
  CreditCard,
  Save,
} from "lucide-react";
import "./App.css";

// --- SŁOWNIK TŁUMACZEŃ ---
const TRANSLATIONS = {
  pl: {
    dashboard: "Panel Główny",
    monthlyExpenses: "Miesięczne wydatki",
    activeSubs: "Aktywne subskrypcje",
    nextPayment: "Najbliższa płatność",
    inDays: "za dni",
    today: "Dzisiaj!",
    calendar: "Kalendarz Płatności",
    add: "Dodaj",
    addHeader: "Dodaj subskrypcję",
    namePlace: "Nazwa (np. Netflix)",
    pricePlace: "Cena",
    cat: "Kategoria",
    date: "Data płatności",
    chartTitle: "Struktura wydatków",
    settingsTitle: "Ustawienia i Dane",
    exportBtn: "Zapisz kopię (Backup)",
    importBtn: "Wczytaj z pliku",
    currency: "Waluta",
    language: "Język",
    logout: "Wyloguj",
    loginHeader: "Zaloguj się",
    registerHeader: "Utwórz konto",
    loginBtn: "Wejdź",
    regBtn: "Zarejestruj",
    noAccount: "Nie masz konta?",
    hasAccount: "Masz już konto?",
    details: "Szczegóły",
    delete: "Usuń subskrypcję",
    cats: {
      Rozrywka: "Rozrywka",
      Praca: "Praca",
      Zdrowie: "Zdrowie",
      Edukacja: "Edukacja",
      Inne: "Inne",
    },
  },
  en: {
    dashboard: "Dashboard",
    monthlyExpenses: "Monthly Expenses",
    activeSubs: "Active Subscriptions",
    nextPayment: "Next Payment",
    inDays: "in days",
    today: "Today!",
    calendar: "Payment Calendar",
    add: "Add",
    addHeader: "Add Subscription",
    namePlace: "Name (e.g. Netflix)",
    pricePlace: "Price",
    cat: "Category",
    date: "Payment Date",
    chartTitle: "Expense Structure",
    settingsTitle: "Settings & Data",
    exportBtn: "Save Backup",
    importBtn: "Load from File",
    currency: "Currency",
    language: "Language",
    logout: "Log out",
    loginHeader: "Login",
    registerHeader: "Create Account",
    loginBtn: "Login",
    regBtn: "Register",
    noAccount: "No account?",
    hasAccount: "Already have an account?",
    details: "Details",
    delete: "Delete Subscription",
    cats: {
      Rozrywka: "Entertainment",
      Praca: "Work",
      Zdrowie: "Health",
      Edukacja: "Education",
      Inne: "Other",
    },
  },
};

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

// Funkcja renderująca etykiety procentowe na wykresie
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  // Pokazuj tylko jeśli segment jest większy niż 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SubTrackPrototype() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authInput, setAuthInput] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [subscriptions, setSubscriptions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [newSub, setNewSub] = useState({
    name: "",
    price: "",
    category: "Rozrywka",
    nextPayment: "",
  });
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
  const [selectedSub, setSelectedSub] = useState(null);

  // NOWE STANY: Waluta i Język
  const [currency, setCurrency] = useState("PLN");
  const [lang, setLang] = useState("pl"); // 'pl' lub 'en'

  const fileInputRef = useRef(null);
  const t = TRANSLATIONS[lang]; // Skrót do tłumaczeń

  // --- LOGIKA "NASTĘPNA PŁATNOŚĆ" ---
  const upcomingPayment = useMemo(() => {
    if (subscriptions.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset godziny dla dokładnego porównania

    // Sortujemy daty rosnąco, bierzemy tylko te >= dzisiaj
    const futureSubs = subscriptions
      .map((sub) => ({ ...sub, dateObj: new Date(sub.nextPayment) }))
      .filter((sub) => sub.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);

    if (futureSubs.length === 0) return null; // Brak przyszłych płatności w tym roku/okresie

    const nearest = futureSubs[0];
    const diffTime = Math.abs(nearest.dateObj - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { ...nearest, daysLeft: diffDays };
  }, [subscriptions]);

  // --- RESZTA LOGIKI ---
  const getCategoryClass = (category) => {
    switch (category) {
      case "Rozrywka":
        return "cat-rozrywka";
      case "Praca":
        return "cat-praca";
      case "Zdrowie":
        return "cat-zdrowie";
      case "Edukacja":
        return "cat-edukacja";
      default:
        return "cat-inne";
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const usersDb = JSON.parse(localStorage.getItem("subtrack_users") || "{}");
    if (
      usersDb[authInput.username] &&
      usersDb[authInput.username] === authInput.password
    ) {
      setCurrentUser(authInput.username);
      setAuthError("");
      loadUserData(authInput.username);
    } else {
      setAuthError("Błędny login lub hasło.");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const usersDb = JSON.parse(localStorage.getItem("subtrack_users") || "{}");
    if (usersDb[authInput.username]) {
      setAuthError("Użytkownik istnieje.");
      return;
    }
    if (authInput.username.length < 3) {
      setAuthError("Za krótkie.");
      return;
    }
    usersDb[authInput.username] = authInput.password;
    localStorage.setItem("subtrack_users", JSON.stringify(usersDb));
    alert("Konto utworzone!");
    setAuthMode("login");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSubscriptions([]);
    setSelectedSub(null);
  };

  const loadUserData = (username) => {
    const saved = localStorage.getItem(`subtrack_data_${username}`);
    setSubscriptions(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    if (currentUser)
      localStorage.setItem(
        `subtrack_data_${currentUser}`,
        JSON.stringify(subscriptions)
      );
  }, [subscriptions, currentUser]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const changeMonth = (offset) =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );
  const monthLabel = currentDate.toLocaleString(
    lang === "pl" ? "pl-PL" : "en-US",
    { month: "long", year: "numeric" }
  );

  const totalMonthly = useMemo(
    () =>
      subscriptions
        .reduce((acc, sub) => acc + parseFloat(sub.price), 0)
        .toFixed(2),
    [subscriptions]
  );

  const chartData = useMemo(() => {
    const data = {};
    subscriptions.forEach((sub) => {
      data[sub.category] = (data[sub.category] || 0) + sub.price;
    });
    return Object.keys(data).map((key) => ({
      name: lang === "pl" ? key : t.cats[key] || key,
      value: data[key],
    }));
  }, [subscriptions, lang, t.cats]);

  const handleAddSubscription = (e) => {
    e.preventDefault();
    const priceValue = parseFloat(newSub.price);
    if (!newSub.name || !newSub.price || priceValue <= 0) {
      setError("Błąd danych");
      return;
    }
    setError("");
    const newItem = {
      id: Date.now(),
      name: newSub.name,
      price: priceValue,
      category: newSub.category,
      nextPayment: newSub.nextPayment || new Date().toISOString().split("T")[0],
    };
    setSubscriptions([...subscriptions, newItem]);
    setNewSub({ name: "", price: "", category: "Rozrywka", nextPayment: "" });
  };

  const handleDelete = (id) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    setSelectedSub(null);
  };

  // Ulepszone funkcje Eksportu/Importu
  const handleExport = () => {
    const jsonString = JSON.stringify(subscriptions, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `subtrack_${currentUser}_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleImportClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setSubscriptions(JSON.parse(ev.target.result));
        alert("OK!");
      } catch (err) {
        alert("Error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  if (!currentUser) {
    return (
      <div className={`auth-container ${darkMode ? "dark-theme" : ""}`}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle-auth"
        >
          {darkMode ? (
            <Sun size={24} color="#fbbf24" />
          ) : (
            <Moon size={24} color="#475569" />
          )}
        </button>
        <div className="auth-box">
          <h1>
            Sub<span>Track</span>
          </h1>
          <form
            onSubmit={authMode === "login" ? handleLogin : handleRegister}
            className="auth-form"
          >
            {authError && <div className="error-message">{authError}</div>}
            <input
              className="mb-2"
              type="text"
              placeholder="Login"
              value={authInput.username}
              onChange={(e) =>
                setAuthInput({ ...authInput, username: e.target.value })
              }
            />
            <input
              className="mb-2"
              type="password"
              placeholder="Password"
              value={authInput.password}
              onChange={(e) =>
                setAuthInput({ ...authInput, password: e.target.value })
              }
            />
            <button className="btn-primary full-width">
              {authMode === "login" ? t.loginBtn : t.regBtn}
            </button>
          </form>
          <p
            className="mt-4 pointer"
            onClick={() =>
              setAuthMode(authMode === "login" ? "register" : "login")
            }
          >
            {authMode === "login" ? t.noAccount : t.hasAccount}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? "dark-theme" : ""}`}>
      {/* MODAL */}
      {selectedSub && (
        <div className="modal-overlay" onClick={() => setSelectedSub(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.details}</h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content-details">
              <div className="detail-row">
                <span className="detail-label">{t.namePlace}:</span>
                <span className="detail-value big">{selectedSub.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t.cat}:</span>
                <span
                  className={`badge ${getCategoryClass(selectedSub.category)}`}
                >
                  {lang === "pl"
                    ? selectedSub.category
                    : t.cats[selectedSub.category]}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t.pricePlace}:</span>
                <span className="detail-value price">
                  {selectedSub.price.toFixed(2)} {currency}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t.date}:</span>
                <span className="detail-value">{selectedSub.nextPayment}</span>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => handleDelete(selectedSub.id)}
                  className="btn-delete-full"
                >
                  <Trash2 size={16} /> {t.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="logo-section">
          <TrendingUp size={24} className="text-primary" />
          <h1>
            Sub<span>Track</span>
          </h1>
        </div>
        <div className="nav-actions">
          <span className="user-greeting">{currentUser}</span>
          <button onClick={() => setDarkMode(!darkMode)} className="icon-btn">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="icon-btn logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <section className="stats-grid">
          <div className="card stat-card">
            <p className="label">{t.monthlyExpenses}</p>
            <h2 className="value highlight">
              {totalMonthly} {currency}
            </h2>
          </div>
          <div className="card stat-card">
            <p className="label">{t.activeSubs}</p>
            <h2 className="value">{subscriptions.length}</h2>
          </div>

          {/* DYNAMICZNA NASTĘPNA PŁATNOŚĆ */}
          {upcomingPayment ? (
            <div className="card payment-card">
              <div className="payment-header">
                <CalendarIcon size={20} />
                <span>{t.nextPayment}</span>
              </div>
              <h3>{upcomingPayment.name}</h3>
              <p className="big-price">
                {upcomingPayment.price.toFixed(2)} {currency}
              </p>
              <p className="due-date">
                {upcomingPayment.daysLeft === 0
                  ? t.today
                  : `${t.inDays}: ${upcomingPayment.daysLeft}`}
              </p>
            </div>
          ) : (
            <div
              className="card payment-card"
              style={{
                background: "linear-gradient(135deg, #9ca3af, #4b5563)",
              }}
            >
              <div className="payment-header">
                <CalendarIcon size={20} />
                <span>{t.nextPayment}</span>
              </div>
              <h3>---</h3>
              <p className="due-date" style={{ marginTop: "1rem" }}>
                Brak nadchodzących
              </p>
            </div>
          )}
        </section>

        <div className="content-split">
          <div className="left-column">
            <div className="card calendar-card">
              <div className="calendar-header">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={20} />
                  <h3>{t.calendar}</h3>
                </div>
                <div className="calendar-nav">
                  <button onClick={() => changeMonth(-1)}>
                    <ChevronLeft />
                  </button>
                  <span className="month-label">{monthLabel}</span>
                  <button onClick={() => changeMonth(1)}>
                    <ChevronRight />
                  </button>
                </div>
              </div>
              <div className="calendar-grid-header">
                <span>Pn</span>
                <span>Wt</span>
                <span>Śr</span>
                <span>Cz</span>
                <span>Pt</span>
                <span>Sb</span>
                <span>Nd</span>
              </div>
              <div className="calendar-grid">
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="calendar-day empty"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const daySubs = subscriptions.filter((sub) => {
                    const d = new Date(sub.nextPayment);
                    return (
                      d.getDate() === day &&
                      d.getMonth() === currentDate.getMonth() &&
                      d.getFullYear() === currentDate.getFullYear()
                    );
                  });
                  return (
                    <div
                      key={`day-${day}`}
                      className={`calendar-day ${
                        daySubs.length > 0 ? "has-event" : ""
                      }`}
                    >
                      <span className="day-number">{day}</span>
                      <div className="day-events">
                        {daySubs.map((sub) => (
                          <div
                            key={sub.id}
                            className={`event-chip ${getCategoryClass(
                              sub.category
                            )}`}
                            onClick={() => setSelectedSub(sub)}
                          >
                            {sub.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card form-card">
              <div className="card-header">
                <PlusCircle size={20} />
                <h3>{t.addHeader}</h3>
              </div>
              <form onSubmit={handleAddSubscription} className="add-form">
                {error && <div className="error-message">{error}</div>}
                <input
                  type="text"
                  placeholder={t.namePlace}
                  value={newSub.name}
                  onChange={(e) =>
                    setNewSub({ ...newSub, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder={t.pricePlace}
                  value={newSub.price}
                  onChange={(e) =>
                    setNewSub({ ...newSub, price: e.target.value })
                  }
                  step="0.01"
                />
                <select
                  value={newSub.category}
                  onChange={(e) =>
                    setNewSub({ ...newSub, category: e.target.value })
                  }
                >
                  <option value="Rozrywka">{t.cats.Rozrywka}</option>
                  <option value="Praca">{t.cats.Praca}</option>
                  <option value="Zdrowie">{t.cats.Zdrowie}</option>
                  <option value="Edukacja">{t.cats.Edukacja}</option>
                  <option value="Inne">{t.cats.Inne}</option>
                </select>
                <input
                  type="date"
                  value={newSub.nextPayment}
                  onChange={(e) =>
                    setNewSub({ ...newSub, nextPayment: e.target.value })
                  }
                />
                <button type="submit" className="btn-primary">
                  {t.add}
                </button>
              </form>
            </div>
          </div>

          <div className="right-column">
            <div className="card chart-card">
              <h3>{t.chartTitle}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label={renderCustomizedLabel} // TUTAJ DODANO PROCENTY
                    labelLine={false}
                  >
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* NOWA ŁADNA SEKCJA USTAWIEŃ */}
            <div className="card settings-card">
              <div className="card-header">
                <Settings size={20} />
                <h3>{t.settingsTitle}</h3>
              </div>

              {/* Konfiguracja */}
              <div className="settings-controls">
                <div className="control-group">
                  <label>
                    <Globe size={14} /> {t.language}
                  </label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                  >
                    <option value="pl">Polski</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="control-group">
                  <label>
                    <CreditCard size={14} /> {t.currency}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="PLN">PLN (zł)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Pliki - Ładniejsze przyciski */}
              <div className="file-actions">
                <p className="subtext">Backup & Restore</p>
                <div className="file-buttons-grid">
                  <button onClick={handleExport} className="btn-file export">
                    <Download size={16} /> {t.exportBtn}
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="btn-file import"
                  >
                    <Upload size={16} /> {t.importBtn}
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept=".json"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
