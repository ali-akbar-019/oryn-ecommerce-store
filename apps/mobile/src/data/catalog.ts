export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  images: string[];
  description: string;
  material: string;
  colors: string[];
  sizes?: string[];
  rating: number;
  reviewCount: number;
  badge?: string;
  featured?: boolean;
  tags: string[];
};

export const categories = ['All', 'Women', 'Men', 'Shoes', 'Watches', 'Accessories'];

const img = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const products: Product[] = [
  {
    id: 'atelier-coat', name: 'Atelier Wool Coat', category: 'Women', price: 289, compareAt: 340,
    image: img('photo-1539109136881-3be0616acf4b'), images: [img('photo-1539109136881-3be0616acf4b'), img('photo-1551488831-00ddcb6c6bd3'), img('photo-1591369822096-ffd140ec948f')],
    description: 'A softly structured wool coat cut with a relaxed silhouette and considered proportions. Designed to become an everyday layer with a quiet, tailored presence.', material: '80% wool, 20% recycled polyamide', colors: ['Sand', 'Black'], sizes: ['XS', 'S', 'M', 'L'], rating: 4.8, reviewCount: 124, badge: 'Best seller', featured: true, tags: ['coat', 'wool', 'outerwear', 'women']
  },
  {
    id: 'form-knit', name: 'Form Rib Knit', category: 'Women', price: 118,
    image: img('photo-1485230895905-ec40ba36b9bc'), images: [img('photo-1485230895905-ec40ba36b9bc'), img('photo-1485968579580-b6d095142e6e')],
    description: 'A fine rib knit with a clean neckline and close, comfortable fit. Minimal enough for layering, distinctive enough to wear alone.', material: 'Merino wool blend', colors: ['Oat', 'Charcoal'], sizes: ['XS', 'S', 'M', 'L'], rating: 4.7, reviewCount: 68, featured: true, tags: ['knit', 'top', 'women']
  },
  {
    id: 'daily-leather', name: 'Daily Leather Tote', category: 'Accessories', price: 196,
    image: img('photo-1548036328-c9fa89d128fa'), images: [img('photo-1548036328-c9fa89d128fa'), img('photo-1594223274512-ad4803739b7c')],
    description: 'A generously sized leather tote with an architectural profile, reinforced handles and an unlined interior that softens beautifully with use.', material: 'Full-grain leather', colors: ['Espresso', 'Black'], rating: 4.9, reviewCount: 91, badge: 'New', featured: true, tags: ['bag', 'leather', 'tote', 'accessories']
  },
  {
    id: 'studio-runner', name: 'Studio Runner', category: 'Shoes', price: 164,
    image: img('photo-1542291026-7eec264c27ff'), images: [img('photo-1542291026-7eec264c27ff'), img('photo-1495555961986-6d4c1ecb7be3')],
    description: 'A low-profile everyday runner balancing a sculpted sole with a lightweight upper. Built for long city days and understated enough to work beyond sport.', material: 'Mesh and suede', colors: ['Stone', 'Black'], sizes: ['40', '41', '42', '43', '44'], rating: 4.6, reviewCount: 57, featured: true, tags: ['sneakers', 'shoes', 'runner']
  },
  {
    id: 'meridian-watch', name: 'Meridian 38', category: 'Watches', price: 420,
    image: img('photo-1524805444758-089113d48a6d'), images: [img('photo-1524805444758-089113d48a6d'), img('photo-1523170335258-f5ed11844a49')],
    description: 'A restrained 38mm automatic watch with a brushed steel case, clean dial and leather strap. A considered daily object rather than a statement piece.', material: '316L stainless steel, leather', colors: ['Steel / Black', 'Steel / Brown'], rating: 4.9, reviewCount: 43, badge: 'Limited', featured: true, tags: ['watch', 'automatic', 'steel']
  },
  {
    id: 'everyday-overshirt', name: 'Everyday Overshirt', category: 'Men', price: 142,
    image: img('photo-1515886657613-9f3515b0c78f'), images: [img('photo-1515886657613-9f3515b0c78f'), img('photo-1529139574466-a303027c1d8b')],
    description: 'A relaxed overshirt in a dry cotton weave, finished with clean patch pockets and a straight hem. Designed to sit comfortably between shirt and jacket.', material: '100% cotton', colors: ['Olive', 'Stone'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.7, reviewCount: 74, tags: ['overshirt', 'cotton', 'men']
  },
  {
    id: 'field-trouser', name: 'Field Trouser', category: 'Men', price: 128,
    image: img('photo-1473966968600-fa801b869a1a'), images: [img('photo-1473966968600-fa801b869a1a')],
    description: 'A relaxed straight-leg trouser with a softly structured drape and utility-inspired details. Cut for everyday movement.', material: 'Cotton twill', colors: ['Charcoal', 'Khaki'], sizes: ['30', '32', '34', '36'], rating: 4.5, reviewCount: 38, tags: ['trouser', 'pants', 'men']
  },
  {
    id: 'line-sunglasses', name: 'Line 02 Sunglasses', category: 'Accessories', price: 96,
    image: img('photo-1511499767150-a48a237f0083'), images: [img('photo-1511499767150-a48a237f0083')],
    description: 'A narrow acetate frame with a softly squared profile and lightweight feel. Finished with UV-protective lenses.', material: 'Acetate', colors: ['Tortoise', 'Black'], rating: 4.6, reviewCount: 22, tags: ['sunglasses', 'accessories']
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) => [product.name, product.category, ...product.tags].join(' ').toLowerCase().includes(normalized));
}
