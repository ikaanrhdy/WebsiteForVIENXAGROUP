const STORAGE_KEY = 'vienxa_guest_cart'

export function readGuestCart() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(items)
      ? items.filter((item) => item?.product?.id && Number.isInteger(item.quantity) && item.quantity > 0)
      : []
  } catch (error) {
    console.error('Keranjang lokal tidak dapat dibaca:', error)
    return []
  }
}

export function writeGuestCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('vienxa:cart-updated'))
}

export function addGuestCartItem(product, quantity = 1) {
  const items = readGuestCart()
  const current = items.find((item) => item.product.id === product.id)
  const nextQuantity = (current?.quantity || 0) + quantity
  if (product.stock != null && nextQuantity > product.stock) {
    throw new Error('Jumlah produk melebihi stok yang tersedia.')
  }

  if (current) {
    current.quantity = nextQuantity
    current.product = product
  } else {
    items.push({ product, quantity })
  }
  writeGuestCart(items)
}

export function guestCartCount() {
  return readGuestCart().reduce((count, item) => count + item.quantity, 0)
}
