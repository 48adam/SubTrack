const Subscription = require("../models/sub.model");

// CREATE - nowa subskrypcja
const createSubscription = async (req, res) => {
  try {
    const { name, amount, category, endDate } = req.body;
    
    // Validacja
    if (!name || !amount || !category || !endDate) {
      return res.status(400).json({ error: "Nazwa, kwota, kategoria i data końcowa są wymagane" });
    }

    const newSub = new Subscription({
      user: req.user.id,
      name,
      amount,
      category,
      endDate
    });

    const saved = await newSub.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET ALL - wszystkie subskrypcje zalogowanego użytkownika
const getAllSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user.id }).populate("user", "username");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET by ID - konkretna subskrypcja
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findOne({ _id: id, user: req.user.id }).populate("user", "username");

    if (!sub) {
      return res.status(404).json({ error: "Subskrypcja nie znaleziona" });
    }

    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE - zmiana planu / statusu
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; 

    const sub = await Subscription.findOneAndUpdate({ _id: id, user: req.user.id }, updates, { new: true });

    if (!sub) {
      return res.status(404).json({ error: "Subskrypcja nie znaleziona" });
    }

    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE / CANCEL - anuluj subskrypcję
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await Subscription.findOneAndDelete({ _id: id, user: req.user.id });

    if (!sub) {
      return res.status(404).json({ error: "Subskrypcja nie znaleziona" });
    }

    res.json({ message: "Subskrypcja usunięta" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Report - raport subskrypcji dla danego usera
const getSubscriptionReport = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user.id });
    
    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "Brak subskrypcji dla tego usera" });
    }

    const report = subs.reduce((acc, sub) => {
      const { category, amount } = sub;
      if (!acc[category]) {
        acc[category] = {
          totalAmount: 0,
          count: 0,
          subscriptions: []
        };
      }
      acc[category].totalAmount += amount;
      acc[category].count++;
      acc[category].subscriptions.push(sub);
      return acc;
    }, {});

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Report by Category - raport subskrypcji dla danego usera i kategorii
const getSubscriptionReportByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({ error: "kategoria wymagana" });
    }

    const subs = await Subscription.find({ user: req.user.id, category: category.toLowerCase() });
    
    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "Brak subskrypcji dla tego usera w podanej kategorii" });
    }

    const report = subs.reduce((acc, sub) => {
      const { category, amount } = sub;
      if (!acc[category]) {
        acc[category] = {
          totalAmount: 0,
          count: 0,
          subscriptions: []
        };
      }
      acc[category].totalAmount += amount;
      acc[category].count++;
      acc[category].subscriptions.push(sub);
      return acc;
    }, {});

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Report by Date Range - raport subskrypcji dla danego usera i zakresu dat
const getSubscriptionReportByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate i endDate wymagane" });
    }

    const subs = await Subscription.find({
      user: req.user.id,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
    
    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "Brak subskrypcji dla tego usera w podanym zakresie dat" });
    }

    const report = subs.reduce((acc, sub) => {
      const { category, amount } = sub;
      if (!acc[category]) {
        acc[category] = {
          totalAmount: 0,
          count: 0,
          subscriptions: []
        };
      }
      acc[category].totalAmount += amount;
      acc[category].count++;
      acc[category].subscriptions.push(sub);
      return acc;
    }, {});

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Report by Amount Range - raport subskrypcji dla danego usera i zakresu kwot
const getSubscriptionReportByAmountRange = async (req, res) => {
  try {
    const { minAmount, maxAmount } = req.query;

    if (!minAmount || !maxAmount) {
      return res.status(400).json({ error: "minAmount i maxAmount wymagane" });
    }

    const subs = await Subscription.find({
      user: req.user.id,
      amount: {
        $gte: minAmount,
        $lte: maxAmount
      }
    });
    
    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "Brak subskrypcji dla tego usera w podanym zakresie kwot" });
    }

    const report = subs.reduce((acc, sub) => {
      const { category, amount } = sub;
      if (!acc[category]) {
        acc[category] = {
          totalAmount: 0,
          count: 0,
          subscriptions: []
        };
      }
      acc[category].totalAmount += amount;
      acc[category].count++;
      acc[category].subscriptions.push(sub);
      return acc;
    }, {});

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Report by Name - raport subskrypcji dla danego usera i nazwy
const getSubscriptionReportByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "name wymagane" });
    }

    const subs = await Subscription.find({
      user: req.user.id,
      name: { $regex: name, $options: "i" }
    });
    
    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "Brak subskrypcji dla tego usera o podanej nazwie" });
    }

    const report = subs.reduce((acc, sub) => {
      const { category, amount } = sub;
      if (!acc[category]) {
        acc[category] = {
          totalAmount: 0,
          count: 0,
          subscriptions: []
        };
      }
      acc[category].totalAmount += amount;
      acc[category].count++;
      acc[category].subscriptions.push(sub);
      return acc;
    }, {});

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Report sorted by Amount - raport subskrypcji dla danego usera posortowany wg kwoty
const getSubscriptionReportSortedByAmount = async (req, res) => {
  try {
    const { sort } = req.query;

    const subs = await Subscription.find({ user: req.user.id }).sort({ amount: sort === "desc" ? -1 : 1 });
    
    if (!subs || subs.length === 0) {
      return res.status(404).json({ error: "Brak subskrypcji dla tego usera" });
    }

    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    cancelSubscription,
    getSubscriptionReport,
    getSubscriptionReportByCategory,
};