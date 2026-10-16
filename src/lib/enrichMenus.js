// Enrichment never changes ingredient evidence, dietary labels or availability.
export function enrichMenus(menus, updates) {
  const byId = new Map(updates.map(update => [update.id, update]));
  return menus.map(menu => {
    const update = byId.get(menu.id);
    if (!update) return menu;
    return { ...menu, price: update.price, priceVerification: update.priceVerification,
      descriptionUpdate: update.descriptionUpdate, photoReferenceUrl: update.photoReferenceUrl,
      photoReferenceLabel: update.photoReferenceLabel };
  });
}
