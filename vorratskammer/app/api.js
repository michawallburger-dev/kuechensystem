export async function lookupBarcode(code) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
    const json = await res.json();

    if (json.status === 1) {
      const p = json.product;
      return {
        name: p.product_name || '',
        brand: p.brands || '',
        img: p.image_small_url || null
      };
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}