(() => {
  const COLLECTION = 'shopping';

  function getAll(user) {
    return window.FoodWiseDB.read(COLLECTION, user, []);
  }

  function add(user, name) {
    const items = getAll(user);
    const item = { id: window.FoodWiseDB.createId(), name, done: false };
    items.push(item);
    window.FoodWiseDB.write(COLLECTION, user, items);
    return item;
  }

  function setDone(user, itemId, done) {
    const items = getAll(user);
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return items;
    item.done = Boolean(done);
    window.FoodWiseDB.write(COLLECTION, user, items);
    return items;
  }

  function remove(user, itemId) {
    const items = getAll(user).filter((item) => item.id !== itemId);
    window.FoodWiseDB.write(COLLECTION, user, items);
    return items;
  }

  function addMany(user, names) {
    const items = getAll(user);
    names.forEach((name) => {
      if (!items.some((item) => !item.done && item.name.toLowerCase() === name.toLowerCase())) {
        items.push({ id: window.FoodWiseDB.createId(), name, done: false });
      }
    });
    window.FoodWiseDB.write(COLLECTION, user, items);
    return items;
  }

  window.FoodWiseShopping = Object.freeze({ getAll, add, setDone, remove, addMany });
})();
