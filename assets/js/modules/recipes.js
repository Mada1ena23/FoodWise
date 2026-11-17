(() => {
  const recipes = [
    { name: 'Omelete de legumes', time: '20 min', type: 'Fácil', emoji: '🍳', ingredients: ['ovos', 'tomate', 'espinafres'], description: 'Uma refeição rápida para aproveitar legumes frescos.' },
    { name: 'Sopa de legumes', time: '40 min', type: 'Fácil', emoji: '🥣', ingredients: ['cenoura', 'batata', 'cebola'], description: 'Conforto à mesa com os legumes que tens à mão.' },
    { name: 'Massa de aproveitamento', time: '25 min', type: 'Fácil', emoji: '🍝', ingredients: ['massa', 'tomate', 'queijo'], description: 'Transforma sobras numa refeição deliciosa.' },
    { name: 'Taça de fruta', time: '10 min', type: 'Muito fácil', emoji: '🍓', ingredients: ['maçã', 'banana', 'iogurte'], description: 'Um lanche simples para aproveitar fruta madura.' }
  ];

  window.FoodWiseRecipes = Object.freeze({
    getAll() {
      return recipes.map((recipe) => ({ ...recipe, ingredients: [...recipe.ingredients] }));
    },
    get(index) {
      const recipe = recipes[index];
      return recipe ? { ...recipe, ingredients: [...recipe.ingredients] } : null;
    }
  });
})();
