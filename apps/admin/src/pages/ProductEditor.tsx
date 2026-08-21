import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { adminData } from '../services/adminData';

type Variant = {
    id?: string;
    sku: string;
    price: string;
    compareAtPrice: string;
    stockQuantity: number;
    attributes: Record<string, string>;
};

type Image = {
    url: string;
    altText: string;
    sortOrder: number;
};

type Attribute = {
    name: string;
    values: string;
};

const blankVariant = (): Variant => ({
    sku: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: 0,
    attributes: {}
});

export function ProductEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);

    // State
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [tab, setTab] = useState<'details' | 'variants' | 'media' | 'attributes'>('details');

    // Product fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState('DRAFT');

    // Variants, images, attributes
    const [variants, setVariants] = useState<Variant[]>([blankVariant()]);
    const [images, setImages] = useState<Image[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load categories
                const catResponse = await adminData.categories();
                setCategories(catResponse.data ?? []);

                // Load product if editing
                if (id) {
                    const productResponse = await adminData.product(id);
                    const product = productResponse.data;

                    setName(product.name);
                    setSlug(product.slug);
                    setBrand(product.brand ?? '');
                    setDescription(product.description ?? '');
                    setCategoryId(product.categoryId);
                    setStatus(product.status);

                    setVariants(
                        product.variants.map((v: any) => ({
                            id: v.id,
                            sku: v.sku,
                            price: String(v.price),
                            compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : '',
                            stockQuantity: v.inventory?.quantity ?? v.stockQuantity,
                            attributes: v.attributes ?? {}
                        }))
                    );

                    setImages(
                        product.images.map((i: any) => ({
                            url: i.url,
                            altText: i.altText ?? '',
                            sortOrder: i.sortOrder
                        }))
                    );

                    setAttributes(
                        product.attributes.map((a: any) => ({
                            name: a.name,
                            values: a.values.map((v: any) => v.value).join(', ')
                        }))
                    );
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load product');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    // Computed
    const totalStock = useMemo(
        () => variants.reduce((sum, v) => sum + Number(v.stockQuantity || 0), 0),
        [variants]
    );

    // Helpers
    const updateVariant = (index: number, key: keyof Variant, value: any) => {
        setVariants((prev) =>
            prev.map((variant, i) => (i === index ? { ...variant, [key]: value } : variant))
        );
    };

    const updateAttribute = (index: number, key: 'name' | 'values', value: string) => {
        setAttributes((prev) =>
            prev.map((attr, i) => (i === index ? { ...attr, [key]: value } : attr))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const body = {
                name,
                slug,
                brand: brand || null,
                description: description || null,
                categoryId,
                status,
                images: images.map((img, index) => ({
                    ...img,
                    sortOrder: index
                })),
                variants: variants.map((variant) => ({
                    sku: variant.sku,
                    price: Number(variant.price),
                    compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
                    stockQuantity: Number(variant.stockQuantity),
                    attributes: variant.attributes
                })),
                attributes: attributes.map((attr) => ({
                    name: attr.name,
                    values: attr.values.split(',').map((v) => v.trim()).filter(Boolean)
                }))
            };

            const response = editing
                ? await adminData.updateProduct(id!, body)
                : await adminData.createProduct(body);

            navigate(`/products/${response.data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="state-view">
                <div className="loader-line" />
                <p>Loading product workspace…</p>
            </div>
        );
    }

    return (
        <div className="editor-page">
            {/* Header */}
            <div className="editor-head">
                <div>
                    <button className="back-link" onClick={() => navigate('/products')}>
                        <Icon name="ArrowLeft" size={15} /> Products
                    </button>
                    <p className="eyebrow">{editing ? 'Product workspace' : 'New product'}</p>
                    <h2>{name || 'Untitled product'}</h2>
                    <p>
                        Build the product, its variants, media and merchandising attributes in one focused
                        workspace.
                    </p>
                </div>
                <div className="editor-actions">
                    <button className="secondary-btn" onClick={() => navigate('/products')}>
                        Cancel
                    </button>
                    <button
                        className="primary-btn"
                        disabled={saving || !name || !slug || !categoryId}
                        onClick={handleSave}
                    >
                        {saving ? 'Saving…' : editing ? 'Save product' : 'Create product'}
                    </button>
                </div>
            </div>

            {error && <div className="notice error-notice">{error}</div>}

            {/* Editor Layout */}
            <div className="editor-layout">
                <main>
                    {/* Tabs */}
                    <div className="editor-tabs">
                        {[
                            ['details', 'Details'],
                            ['variants', 'Variants'],
                            ['media', 'Media'],
                            ['attributes', 'Attributes']
                        ].map(([key, label]) => (
                            <button
                                className={tab === key ? 'active' : ''}
                                key={key}
                                onClick={() => setTab(key as any)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Details Tab */}
                    {tab === 'details' && (
                        <section className="editor-panel">
                            <div className="section-title">
                                <div>
                                    <p className="eyebrow">Identity</p>
                                    <h3>Product information</h3>
                                </div>
                            </div>

                            <div className="form-grid">
                                <label>
                                    Product name
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Atelier Field Watch"
                                    />
                                </label>

                                <label>
                                    Slug
                                    <input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="atelier-field-watch"
                                    />
                                </label>

                                <label>
                                    Brand
                                    <input
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="ORYN Studio"
                                    />
                                </label>

                                <label>
                                    Category
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Status
                                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option>DRAFT</option>
                                        <option>ACTIVE</option>
                                        <option>ARCHIVED</option>
                                    </select>
                                </label>

                                <label className="full">
                                    Description
                                    <textarea
                                        rows={8}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the product, materials, construction and story."
                                    />
                                </label>
                            </div>
                        </section>
                    )}

                    {/* Variants Tab */}
                    {tab === 'variants' && (
                        <section className="editor-panel">
                            <div className="section-title">
                                <div>
                                    <p className="eyebrow">Commerce</p>
                                    <h3>Variants & inventory</h3>
                                    <p>
                                        {variants.length} variants · {totalStock} units currently available
                                    </p>
                                </div>
                                <button
                                    className="secondary-btn"
                                    onClick={() => setVariants((prev) => [...prev, blankVariant()])}
                                >
                                    <Icon name="Plus" size={15} /> Add variant
                                </button>
                            </div>

                            {variants.map((variant, index) => (
                                <div className="variant-card" key={variant.id ?? index}>
                                    <div className="variant-index">{String(index + 1).padStart(2, '0')}</div>

                                    <div className="variant-fields">
                                        <label>
                                            SKU
                                            <input
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                            />
                                        </label>

                                        <label>
                                            Price
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            />
                                        </label>

                                        <label>
                                            Compare at
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variant.compareAtPrice}
                                                onChange={(e) =>
                                                    updateVariant(index, 'compareAtPrice', e.target.value)
                                                }
                                            />
                                        </label>

                                        <label>
                                            Stock
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.stockQuantity}
                                                onChange={(e) =>
                                                    updateVariant(index, 'stockQuantity', Number(e.target.value))
                                                }
                                            />
                                        </label>

                                        <label className="full">
                                            Attributes
                                            <input
                                                value={Object.entries(variant.attributes)
                                                    .map(([key, val]) => `${key}: ${val}`)
                                                    .join(' · ')}
                                                onChange={(e) => {
                                                    const pairs = e.target.value
                                                        .split('·')
                                                        .map((x) => x.trim())
                                                        .filter(Boolean);
                                                    const obj: Record<string, string> = {};
                                                    pairs.forEach((pair) => {
                                                        const [key, ...rest] = pair.split(':');
                                                        if (key && rest.length) {
                                                            obj[key.trim()] = rest.join(':').trim();
                                                        }
                                                    });
                                                    updateVariant(index, 'attributes', obj);
                                                }}
                                                placeholder="Color: Black · Size: M"
                                            />
                                        </label>
                                    </div>

                                    {variants.length > 1 && (
                                        <button
                                            className="icon-btn danger"
                                            onClick={() =>
                                                setVariants((prev) => prev.filter((_, i) => i !== index))
                                            }
                                        >
                                            <Icon name="Trash2" size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Media Tab */}
                    {tab === 'media' && (
                        <section className="editor-panel">
                            <div className="section-title">
                                <div>
                                    <p className="eyebrow">Presentation</p>
                                    <h3>Product media</h3>
                                    <p>
                                        Use clean, high-resolution product photography. The first image becomes
                                        the primary listing image.
                                    </p>
                                </div>
                                <button
                                    className="secondary-btn"
                                    onClick={() =>
                                        setImages((prev) => [
                                            ...prev,
                                            { url: '', altText: '', sortOrder: prev.length }
                                        ])
                                    }
                                >
                                    <Icon name="Plus" size={15} /> Add image
                                </button>
                            </div>

                            <div className="media-list">
                                {images.map((image, index) => (
                                    <div className="media-row" key={index}>
                                        <div className="media-number">{String(index + 1).padStart(2, '0')}</div>
                                        <div className="media-preview">
                                            {image.url ? (
                                                <img src={image.url} alt="" />
                                            ) : (
                                                <Icon name="Image" size={20} />
                                            )}
                                        </div>
                                        <div className="media-fields">
                                            <label>
                                                Image URL
                                                <input
                                                    value={image.url}
                                                    onChange={(e) =>
                                                        setImages((prev) =>
                                                            prev.map((img, i) =>
                                                                i === index ? { ...img, url: e.target.value } : img
                                                            )
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label>
                                                Alt text
                                                <input
                                                    value={image.altText}
                                                    onChange={(e) =>
                                                        setImages((prev) =>
                                                            prev.map((img, i) =>
                                                                i === index ? { ...img, altText: e.target.value } : img
                                                            )
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>
                                        <button
                                            className="icon-btn danger"
                                            onClick={() =>
                                                setImages((prev) => prev.filter((_, i) => i !== index))
                                            }
                                        >
                                            <Icon name="Trash2" size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {!images.length && (
                                <div className="empty-editor">
                                    <Icon name="Image" size={24} />
                                    <strong>No media added</strong>
                                    <span>Add the first product image to create the listing gallery.</span>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Attributes Tab */}
                    {tab === 'attributes' && (
                        <section className="editor-panel">
                            <div className="section-title">
                                <div>
                                    <p className="eyebrow">Merchandising</p>
                                    <h3>Product attributes</h3>
                                    <p>
                                        Define category-specific attributes without forcing every product into
                                        the same schema.
                                    </p>
                                </div>
                                <button
                                    className="secondary-btn"
                                    onClick={() =>
                                        setAttributes((prev) => [...prev, { name: '', values: '' }])
                                    }
                                >
                                    <Icon name="Plus" size={15} /> Add attribute
                                </button>
                            </div>

                            {attributes.map((attr, index) => (
                                <div className="attribute-row" key={index}>
                                    <input
                                        placeholder="Attribute name"
                                        value={attr.name}
                                        onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                    />
                                    <input
                                        placeholder="Values, separated by commas"
                                        value={attr.values}
                                        onChange={(e) => updateAttribute(index, 'values', e.target.value)}
                                    />
                                    <button
                                        className="icon-btn danger"
                                        onClick={() =>
                                            setAttributes((prev) => prev.filter((_, i) => i !== index))
                                        }
                                    >
                                        <Icon name="Trash2" size={16} />
                                    </button>
                                </div>
                            ))}

                            {!attributes.length && (
                                <div className="empty-editor">
                                    <Icon name="SlidersHorizontal" size={24} />
                                    <strong>No attributes defined</strong>
                                    <span>
                                        Add attributes such as material, movement, fit, storage or warranty.
                                    </span>
                                </div>
                            )}
                        </section>
                    )}
                </main>

                {/* Sidebar */}
                <aside>
                    <section className="editor-side">
                        <p className="eyebrow">Publishing</p>
                        <h3>
                            {status === 'ACTIVE'
                                ? 'Live in storefront'
                                : status === 'ARCHIVED'
                                    ? 'Archived'
                                    : 'Draft'}
                        </h3>
                        <p>
                            {status === 'ACTIVE'
                                ? 'Customers can discover and purchase this product.'
                                : status === 'ARCHIVED'
                                    ? 'This product is hidden from the storefront.'
                                    : 'The product is saved but not publicly available.'}
                        </p>

                        <div className="side-divider" />

                        <div className="side-stat">
                            <span>Variants</span>
                            <strong>{variants.length}</strong>
                        </div>
                        <div className="side-stat">
                            <span>Units</span>
                            <strong>{totalStock}</strong>
                        </div>
                        <div className="side-stat">
                            <span>Media</span>
                            <strong>{images.length}</strong>
                        </div>
                    </section>

                    <section className="editor-side">
                        <p className="eyebrow">Editorial standard</p>
                        <p className="muted">
                            Use descriptive names, accurate attributes and purposeful photography. Avoid
                            duplicate variants and generic product copy.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
}