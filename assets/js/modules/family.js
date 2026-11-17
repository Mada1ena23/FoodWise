(() => {
  const COLLECTION = 'family';

  function get(user) {
    return window.FoodWiseDB.read(COLLECTION, user, null);
  }

  function save(user, family) {
    window.FoodWiseDB.write(COLLECTION, user, family);
    return family;
  }

  function create(user, name, memberCount) {
    const members = [{ id: user.id, name: user.name, role: 'Administrador' }];
    for (let index = 1; index < memberCount; index += 1) {
      members.push({
        id: window.FoodWiseDB.createId(),
        name: `Membro ${index + 1}`,
        role: 'Familiar'
      });
    }
    return save(user, { name, members });
  }

  function addMember(user, name, role) {
    const family = get(user);
    if (!family) throw new Error('Configura a família antes de adicionar membros.');
    family.members.push({ id: window.FoodWiseDB.createId(), name, role });
    return save(user, family);
  }

  function removeMember(user, memberId) {
    const family = get(user);
    if (!family) throw new Error('Não foi encontrada uma família configurada.');
    family.members = family.members.filter((member) => member.id !== memberId);
    return save(user, family);
  }

  window.FoodWiseFamily = Object.freeze({ get, save, create, addMember, removeMember });
})();
