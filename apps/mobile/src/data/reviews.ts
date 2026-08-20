export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export const reviews: Review[] = [
  { id: 'r1', productId: 'atelier-coat', author: 'Maya R.', rating: 5, title: 'Exactly the coat I wanted', body: 'The shape is relaxed without feeling oversized. The wool has a beautiful weight and the sand tone is even better in person.', date: '2 days ago', verified: true },
  { id: 'r2', productId: 'atelier-coat', author: 'Sofia K.', rating: 5, title: 'Beautiful construction', body: 'Clean finish, thoughtful proportions and genuinely useful pockets. I have worn it almost every day.', date: '1 week ago', verified: true },
  { id: 'r3', productId: 'studio-runner', author: 'Daniel M.', rating: 4, title: 'Comfortable all day', body: 'Lightweight and understated. The sole has enough support for walking around the city for hours.', date: '3 weeks ago', verified: true },
  { id: 'r4', productId: 'meridian-watch', author: 'Adam P.', rating: 5, title: 'Quietly impressive', body: 'The proportions are excellent and the dial is extremely clean. It feels much more considered than the price suggests.', date: '1 month ago', verified: true },
];

export function getProductReviews(productId: string) {
  return reviews.filter((review) => review.productId === productId);
}
