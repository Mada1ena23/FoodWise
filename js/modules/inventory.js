(() => {
  const COLLECTION = 'inventory';

  function getAll(user) {
    return window.FoodWiseDB.read(COLLECTION, user, []);
  }

  function add(user, item) {
    const items = getAll(user);
    const newItem = { id: window.FoodWiseDB.createId(), ...item };
    items.push(newItem);
    window.FoodWiseDB.write(COLLECTION, user, items);
    return newItem;
  }

  function remove(user, itemId) {
    const items = getAll(user).filter((item) => item.id !== itemId);
    window.FoodWiseDB.write(COLLECTION, user, items);
    return items;
  }

  function daysUntil(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(`${date}T00:00:00`);
    return Math.ceil((expiry - today) / 86400000);
  }

  function expiring(user, days = 7) {
    return getAll(user)
      .filter((item) => item.expiry && daysUntil(item.expiry) <= days)
      .sort((first, second) => daysUntil(first.expiry) - daysUntil(second.expiry));
  }

  window.FoodWiseInventory = Object.freeze({ getAll, add, remove, daysUntil, expiring });
})();
