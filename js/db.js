(() => {
  const SESSION_KEY = 'foodwise_session';

  function getUserKey(collection, user) {
    if (!user || !user.id) {
      throw new Error('É necessário iniciar sessão para aceder aos dados.');
    }
    return `foodwise_${collection}_${user.id}`;
  }

  function read(collection, user, fallback) {
    const raw = localStorage.getItem(getUserKey(collection, user));
    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Não foi possível ler os dados de "${collection}".`, error);
      throw new Error(`Os dados de "${collection}" estão corrompidos.`);
    }
  }

  function write(collection, user, value) {
    localStorage.setItem(getUserKey(collection, user), JSON.stringify(value));
  }

  window.FoodWiseDB = Object.freeze({
    getCurrentUser() {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      try {
        return JSON.parse(raw);
      } catch (error) {
        console.error('Não foi possível ler a sessão FoodWise.', error);
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
    },
    read,
    write,
    createId() {
      return window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  });
})();
