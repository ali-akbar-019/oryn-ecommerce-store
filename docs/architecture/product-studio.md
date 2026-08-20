# ORYN Product Studio

The admin product workspace is intentionally organized into four editorial/commercial surfaces: Details, Variants, Media, and Attributes. The UI keeps product identity separate from SKU-level commerce data, while the API remains authoritative for persistence.

## Details
Name, slug, brand, category, description, and publishing status.

## Variants
Each SKU owns its price, compare-at price, stock quantity, and flexible attribute payload. Inventory is mirrored to the Inventory record and tracked through transactions.

## Media
Ordered product images with alt text. The first image is the primary listing image.

## Attributes
Category-specific merchandising fields remain flexible so watches, apparel, footwear and electronics do not share an artificial fixed schema.
