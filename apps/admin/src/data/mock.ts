export const stats = [
  { label: 'Net revenue', value: '$128,420', delta: '+18.4%', note: 'vs. previous 30 days' },
  { label: 'Orders', value: '1,284', delta: '+12.8%', note: 'this month' },
  { label: 'Average order', value: '$100.02', delta: '+5.2%', note: 'per completed order' },
  { label: 'Customers', value: '8,492', delta: '+9.7%', note: 'active accounts' },
];

export const revenue = [
  ['Jan', 62], ['Feb', 71], ['Mar', 68], ['Apr', 84], ['May', 79], ['Jun', 96], ['Jul', 91], ['Aug', 112],
];

export const orders = [
  { id: '#ORY-10482', customer: 'Maya Chen', date: 'Aug 19, 2026', total: '$284.00', status: 'Processing', payment: 'Paid' },
  { id: '#ORY-10481', customer: 'Daniel Reed', date: 'Aug 19, 2026', total: '$148.50', status: 'Shipped', payment: 'Paid' },
  { id: '#ORY-10480', customer: 'Sofia Malik', date: 'Aug 18, 2026', total: '$620.00', status: 'Delivered', payment: 'Paid' },
  { id: '#ORY-10479', customer: 'Noah Williams', date: 'Aug 18, 2026', total: '$94.00', status: 'Pending', payment: 'Pending' },
  { id: '#ORY-10478', customer: 'Ava Morgan', date: 'Aug 17, 2026', total: '$1,120.00', status: 'Delivered', payment: 'Paid' },
  { id: '#ORY-10477', customer: 'Leo Martin', date: 'Aug 17, 2026', total: '$218.00', status: 'Cancelled', payment: 'Refunded' },
];

export const products = [
  { name: 'Form 01 Chronograph', category: 'Watches', price: '$620', stock: 24, status: 'Published' },
  { name: 'No. 07 Leather Loafer', category: 'Shoes', price: '$188', stock: 61, status: 'Published' },
  { name: 'Studio Overshirt', category: 'Apparel', price: '$148', stock: 9, status: 'Low stock' },
  { name: 'Arc Wireless Headphones', category: 'Electronics', price: '$220', stock: 37, status: 'Published' },
  { name: 'Field Tote 02', category: 'Accessories', price: '$96', stock: 0, status: 'Out of stock' },
];

export const activities = [
  ['10:42', 'Maya Chen placed order #ORY-10482', 'Orders'],
  ['10:18', 'Studio Overshirt inventory adjusted by 12 units', 'Inventory'],
  ['09:54', 'A new review is awaiting moderation', 'Reviews'],
  ['09:31', 'Summer Edit collection published', 'Catalog'],
  ['08:47', 'Administrator role updated for Olivia Grant', 'Security'],
];
